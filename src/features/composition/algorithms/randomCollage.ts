import type {Asset,Layer} from '../../../types/collage';
import {WIDTH,HEIGHT} from '../../../types/collage';
export type CollageSettings={size:number;density:number;rotation:number;variation:number;overlap:number};
export const defaultSettings:CollageSettings={size:55,density:70,rotation:50,variation:65,overlap:55};
const rnd=(a:number,b:number)=>a+Math.random()*(b-a);
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const GRID=12; // sampling resolution for coverage, in canvas pixels
export async function randomCollage(assets:Asset[],settings:CollageSettings=defaultSettings):Promise<Layer[]>{
 const eligible=assets.filter(a=>a.segmented);if(!eligible.length)throw new Error('Primero segmenta alguna imagen.');
 const images=await Promise.all(eligible.map(a=>new Promise<HTMLImageElement>((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('No se pudo leer '+a.name));img.src=a.src})));
 const cw=Math.ceil(WIDTH/GRID),ch=Math.ceil(HEIGHT/GRID),coverage=document.createElement('canvas');coverage.width=cw;coverage.height=ch;
 const ctx=coverage.getContext('2d',{willReadFrequently:true})!;
 const layers:Layer[]=[];const base=clamp(0.23+settings.size/100*0.85,0.15,1.1);const variation=settings.variation/100;
 const angle=settings.rotation/100*180;const maxLayers=Math.round(100+settings.density*5);
 // Coverage is measured from actual alpha, not bounding rectangles.
 let pixels=new Uint8ClampedArray(cw*ch*4),uncovered:number[]=[];
 const refresh=()=>{pixels=ctx.getImageData(0,0,cw,ch).data;uncovered=[];for(let y=0;y<ch;y++)for(let x=0;x<cw;x++){const i=(y*cw+x)*4;if(pixels[i+3]<245)uncovered.push(y*cw+x)}return uncovered.length/(cw*ch)};
 refresh();let previous=1;
 for(let k=0;k<maxLayers;k++){
  const ratio=refresh();if(ratio<=0.004)break;
  const point=uncovered[Math.floor(Math.random()*uncovered.length)];if(point===undefined)break;
  const targetX=(point%cw+.5)*GRID,targetY=(Math.floor(point/cw)+.5)*GRID;
  const idx=Math.floor(Math.random()*eligible.length),asset=eligible[idx],img=images[idx];
  const dim=Math.min(WIDTH/asset.width,HEIGHT/asset.height)*base*rnd(1-variation*.65,1+variation*.8);
  // As holes shrink, place smaller pieces to fill them.
  const factor=k>eligible.length*2?rnd(.55,1):1;
  const width=Math.max(12,asset.width*dim*factor),height=Math.max(12,asset.height*dim*factor);
  const rotation=rnd(-angle,angle),radians=rotation*Math.PI/180;
  const jitter=(settings.overlap/100)*Math.min(width,height)*.35;
  const x=targetX-width/2+rnd(-jitter,jitter),y=targetY-height/2+rnd(-jitter,jitter);
  const layer:Layer={id:crypto.randomUUID(),name:asset.name,src:asset.src,x,y,width,height,rotation,visible:true,opacity:1};
  ctx.save();ctx.translate((x+width/2)/GRID,(y+height/2)/GRID);ctx.rotate(radians);ctx.drawImage(img,-width/(2*GRID),-height/(2*GRID),width/GRID,height/GRID);ctx.restore();
  layers.push(layer);
  // Allow the loop to keep trying different subjects when the selected center is transparent.
  if(k%15===0){const next=refresh();if(next>=previous&&k>30)break;previous=next;}
 }
 return layers;
}
