import type {Asset,Layer} from '../../../types/collage';
import {WIDTH,HEIGHT} from '../../../types/collage';
import {randomCollage} from './randomCollage';
import type {CollageSettings} from './randomCollage';
export type SemanticMode='fill'|'scene'|'character'|'growth'|'hybrid';
export type SemanticSettings={mode:SemanticMode;seed:number;subjects:number;accessories:number;mutation:number;growth:number;background:number;chaos:number;scale:number;palette:number};
export const semanticDefaults:SemanticSettings={mode:'scene',seed:12345,subjects:55,accessories:65,mutation:50,growth:70,background:65,chaos:40,scale:55,palette:50};
function random(seed:number){let a=seed>>>0;return ()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296}}
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
const kind=(a:Asset)=>a.classification?.kind||'';
const role=(a:Asset)=>a.classification?.role||'';
const tags=(a:Asset)=>a.classification?.tags||[];
function choose<T>(xs:T[],rnd:()=>number):T|undefined{return xs[Math.floor(rnd()*xs.length)]}
function colorDistance(a:Asset,b:Asset){const parse=(h:string)=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));const aa=a.colorProfile?.average,bb=b.colorProfile?.average;if(!aa||!bb)return .5;const x=parse(aa),y=parse(bb);if([...x,...y].some(Number.isNaN))return .5;return Math.sqrt(x.reduce((sum,n,i)=>sum+(n-y[i])**2,0))/(Math.sqrt(3)*255)}
function pick(pool:Asset[],rnd:()=>number,base:Asset|undefined,coherence:number){if(!pool.length)return undefined;if(!base||coherence===0)return choose(pool,rnd);const sorted=[...pool].sort((a,b)=>colorDistance(a,base)-colorDistance(b,base));return sorted[Math.floor((rnd()**(1+coherence/15))*sorted.length)]}
function anchor(a:Asset,key:keyof NonNullable<Asset['anchors']>,fallback:[number,number]):[number,number]{return a.anchors?.[key]||fallback}
function make(a:Asset,x:number,y:number,w:number,h:number,rot=0):Layer{return {id:crypto.randomUUID(),name:a.name,src:a.src,x,y,width:w,height:h,rotation:rot,visible:true,opacity:1}}
function place(a:Asset,cx:number,cy:number,targetWidth:number,rot=0){const w=clamp(targetWidth,10,WIDTH*2);const h=w*a.height/Math.max(1,a.width);return make(a,cx-w/2,cy-h/2,w,h,rot)}
function atAnchor(parent:Layer,source:Asset,position:[number,number]){return [parent.x+parent.width*position[0],parent.y+parent.height*position[1]] as [number,number]}
function poolOf(all:Asset[],predicate:(a:Asset)=>boolean){return all.filter(predicate)}
export async function generateSemanticCollage(assets:Asset[],s:SemanticSettings,fillSettings:CollageSettings):Promise<Layer[]>{
 const all=assets.filter(a=>a.segmented);if(!all.length)throw Error('Segmenta imágenes antes de construir.');
 if(s.mode==='fill')return randomCollage(all,fillSettings);
 const rnd=random(s.seed),r=(lo:number,hi:number)=>lo+rnd()*(hi-lo),result:Layer[]=[];
 const backgrounds=poolOf(all,a=>role(a)==='fondo'||kind(a)==='paisaje'||kind(a)==='edificio');
 const characters=poolOf(all,a=>['persona','personaje','animal'].includes(kind(a)));
 const trees=poolOf(all,a=>kind(a)==='planta'||tags(a).some(t=>/árbol|arbol|tree|plant/.test(t)));
 const tools=poolOf(all,a=>['herramienta','objeto','vehículo'].includes(kind(a)));
 const ornaments=poolOf(all,a=>['símbolo','número','letra','alimento','objeto','animal'].includes(kind(a))||role(a)==='decoración');
 const heads=poolOf(all,a=>['objeto','animal','símbolo','alimento','personaje','número'].includes(kind(a)));
 const subjectPool=characters.length?characters:all;
 const background=pick(backgrounds,rnd,undefined,0);
 if(background&&rnd()<s.background/100){const factor=Math.max(WIDTH/background.width,HEIGHT/background.height)*r(1,1.15);const w=background.width*factor,h=background.height*factor;result.push(make(background,(WIDTH-w)/2,(HEIGHT-h)/2,w,h))}
 const primary=pick(subjectPool,rnd,background,s.palette);
 const count=1+Math.round(s.subjects/33);
 const subjects: {layer:Layer;asset:Asset}[]=[];
 if(s.mode!=='growth')for(let i=0;i<count;i++){
  const a=i===0?primary:pick(subjectPool,rnd,primary,s.palette);if(!a)continue;
  const width=WIDTH*(.2+s.scale/100*.38)*r(.6,1.15)*(i===0?1:.65);
  const cx=i===0?WIDTH*.5:WIDTH*r(.15,.85),cy=i===0?HEIGHT*.56:HEIGHT*r(.22,.8);
  const l=place(a,cx,cy,width,r(-s.chaos,s.chaos)*.35);result.push(l);subjects.push({layer:l,asset:a});
 }
 if(['character','scene','hybrid'].includes(s.mode))for(const {layer,asset} of subjects){
  const n=Math.round(s.accessories/30);
  for(let i=0;i<n;i++){const key=i%2?'leftHand':'rightHand';const fallback:[number,number]=key==='leftHand'?[.18,.6]:[.82,.6];const p=atAnchor(layer,asset,anchor(asset,key,fallback));const a=pick(tools.length?tools:ornaments,rnd,asset,s.palette);if(a)result.push(place(a,p[0],p[1],layer.width*r(.12,.32),r(-65,65)))}
  if(rnd()<s.mutation/100){const p=atAnchor(layer,asset,anchor(asset,'head',[.5,.16]));const a=pick(heads,rnd,asset,s.palette);if(a&&a.id!==asset.id)result.push(place(a,p[0],p[1],layer.width*r(.24,.48),r(-25,25)))}
 }
 if(['growth','scene','hybrid'].includes(s.mode)){
  const treePool=trees.length?trees:(s.mode==='growth'?all:[]);
  const treeCount=s.mode==='growth'?1+Math.round(s.subjects/20):Math.round(s.growth/35);
  for(let t=0;t<treeCount;t++){
   const a=pick(treePool,rnd,primary,s.palette);if(!a)continue;
   const cx=WIDTH*(treeCount===1?.5:(t+.5)/treeCount),cy=HEIGHT*r(.56,.8);
   const tree=place(a,cx,cy,WIDTH*r(.23,.48),r(-12,12));result.push(tree);
   const fruitPool=ornaments.length?ornaments:all;
   const fruits=Math.round(s.growth/8);
   for(let j=0;j<fruits;j++){
    const angle=r(0,Math.PI*2),rad=Math.sqrt(rnd());const center=atAnchor(tree,a,anchor(a,'crown',[.5,.28]));
    const x=center[0]+Math.cos(angle)*rad*tree.width*.47,y=center[1]+Math.sin(angle)*rad*tree.height*.27;
    const fruit=pick(fruitPool,rnd,a,s.palette);if(fruit)result.push(place(fruit,x,y,tree.width*r(.07,.19),r(-90,90)));
   }
  }
 }
 if(s.mode==='hybrid'){
  const parts=ornaments.length?ornaments:all;
  const n=Math.round(s.mutation/5);
  for(let i=0;i<n;i++){const a=pick(parts,rnd,primary,s.palette);if(a)result.push(place(a,WIDTH*r(.05,.95),HEIGHT*r(.05,.95),WIDTH*r(.04,.22),r(-180,180)))}
 }
 return result;
}
