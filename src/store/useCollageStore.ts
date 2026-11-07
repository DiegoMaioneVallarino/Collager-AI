import {create} from 'zustand';
import {generateSemanticCollage,semanticDefaults} from '../features/composition/algorithms/semanticEngine';
import type {SemanticSettings} from '../features/composition/algorithms/semanticEngine';
import type {SemanticAnchors} from '../types/collage';
import {suggestClassification,normalizeClassification} from '../features/assets/services/classification';
import type {AssetClassification} from '../types/collage';
import {readSavedAssets,saveSegmentedAsset,deleteSavedAsset} from '../features/assets/services/assetDatabase';
import {analyzeColorProfile} from '../features/assets/services/colorProfile';
import type {Asset,Layer} from '../types/collage';
import {WIDTH,HEIGHT} from '../types/collage';
import {autoArrange} from '../features/composition/algorithms/autoArrange';
import {randomCollage,defaultSettings} from '../features/composition/algorithms/randomCollage';
import type {CollageSettings} from '../features/composition/algorithms/randomCollage';
type State={assets:Asset[];layers:Layer[];selectedId:string|null;settings:CollageSettings;semantic:SemanticSettings;generating:boolean;libraryReady:boolean;libraryError:string|null;loadLibrary:()=>Promise<void>;deleteAsset:(id:string)=>Promise<void>;classifyAsset:(id:string,classification:AssetClassification)=>Promise<void>;suggestAll:()=>Promise<void>;setSettings:(p:Partial<CollageSettings>)=>void;setSemantic:(p:Partial<SemanticSettings>)=>void;setAnchors:(id:string,anchors:SemanticAnchors)=>Promise<void>;generateSemantic:()=>Promise<void>;addAssets:(a:Asset[])=>void;replaceAsset:(oldId:string,a:Asset)=>Promise<void>;addLayer:(a:Asset)=>void;select:(id:string|null)=>void;update:(id:string,patch:Partial<Layer>)=>void;replaceLayerImage:(id:string,a:Asset)=>void;remove:(id:string)=>void;move:(id:string,dir:number)=>void;arrange:()=>void;generateRandom:()=>Promise<void>;clear:()=>void};
export const useCollageStore=create<State>((set,get)=>({
 assets:[],layers:[],selectedId:null,settings:defaultSettings,semantic:semanticDefaults,generating:false,libraryReady:false,libraryError:null,
 loadLibrary:async()=>{try{const saved=await readSavedAssets();set(s=>({assets:[...s.assets.filter(a=>!a.segmented),...saved],libraryReady:true,libraryError:null}))}catch(e){set({libraryReady:true,libraryError:String(e)})}},
 classifyAsset:async(id,classification)=>{const asset=get().assets.find(a=>a.id===id);if(!asset)return;const next={...asset,classification:normalizeClassification(classification)};if(next.segmented)await saveSegmentedAsset(next);set(s=>({assets:s.assets.map(a=>a.id===id?next:a)}))},
 suggestAll:async()=>{const current=get().assets;const updates=current.filter(a=>!a.classification).map(a=>({...a,classification:suggestClassification(a)}));for(const a of updates){if(a.segmented)await saveSegmentedAsset(a)}const map=new Map(updates.map(a=>[a.id,a]));set(s=>({assets:s.assets.map(a=>map.get(a.id)||a)}))},
 deleteAsset:async(id)=>{await deleteSavedAsset(id);set(s=>({assets:s.assets.filter(a=>a.id!==id),layers:s.layers.filter(l=>l.src!==s.assets.find(a=>a.id===id)?.src)}))},
 setSettings:(p)=>set(s=>({settings:{...s.settings,...p}})),
 setSemantic:(p)=>set(s=>({semantic:{...s.semantic,...p}})),
 setAnchors:async(id,anchors)=>{const a=get().assets.find(x=>x.id===id);if(!a)return;const next={...a,anchors};if(next.segmented)await saveSegmentedAsset(next);set(s=>({assets:s.assets.map(x=>x.id===id?next:x)}))},
 generateSemantic:async()=>{if(get().generating)return;set({generating:true});try{const {assets,semantic,settings}=get();const layers=await generateSemanticCollage(assets,semantic,settings);set({layers,selectedId:null})}finally{set({generating:false})}},
 addAssets:(a)=>set(s=>({assets:[...s.assets,...a]})),
 replaceAsset:async(oldId,a)=>{const colorProfile=await analyzeColorProfile(a.src);const original=get().assets.find(x=>x.id===oldId);const result:Asset={...a,id:oldId,segmented:true,colorProfile,classification:original?.classification||suggestClassification(a)};await saveSegmentedAsset(result);set(s=>({assets:s.assets.map(x=>x.id===oldId?result:x),layers:s.layers.map(l=>l.src===s.assets.find(x=>x.id===oldId)?.src?{...l,src:result.src,name:result.name}:l)}))},
 addLayer:(a)=>set(s=>{const factor=Math.min(.55*WIDTH/a.width,.5*HEIGHT/a.height,1);const width=Math.max(1,a.width*factor),height=Math.max(1,a.height*factor);const l:Layer={id:crypto.randomUUID(),name:a.name,src:a.src,x:(WIDTH-width)/2,y:(HEIGHT-height)/2,width,height,rotation:0,visible:true,opacity:1};return {layers:[...s.layers,l],selectedId:l.id}}),
 select:(id)=>set({selectedId:id}),update:(id,patch)=>set(s=>({layers:s.layers.map(l=>l.id===id?{...l,...patch}:l)})),
 replaceLayerImage:(id,a)=>set(s=>({layers:s.layers.map(l=>l.id===id?{...l,src:a.src,name:a.name,width:a.width,height:a.height}:l)})),
 remove:(id)=>set(s=>({layers:s.layers.filter(l=>l.id!==id),selectedId:s.selectedId===id?null:s.selectedId})),
 move:(id,dir)=>set(s=>{const layers=[...s.layers],i=layers.findIndex(l=>l.id===id),j=i+dir;if(i>=0&&j>=0&&j<layers.length)[layers[i],layers[j]]=[layers[j],layers[i]];return {layers}}),
 arrange:()=>set(s=>({layers:autoArrange(s.layers)})),
 generateRandom:async()=>{if(get().generating)return;set({generating:true});try{const layers=await randomCollage(get().assets,get().settings);set({layers,selectedId:null})}finally{set({generating:false})}},
 clear:()=>set({layers:[],selectedId:null})
}));
