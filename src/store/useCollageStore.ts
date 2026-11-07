import {create} from 'zustand';
import {readSavedAssets,saveSegmentedAsset,deleteSavedAsset} from '../features/assets/services/assetDatabase';
import {analyzeColorProfile} from '../features/assets/services/colorProfile';
import type {Asset,Layer} from '../types/collage';
import {WIDTH,HEIGHT} from '../types/collage';
import {autoArrange} from '../features/composition/algorithms/autoArrange';
import {randomCollage,defaultSettings} from '../features/composition/algorithms/randomCollage';
import type {CollageSettings} from '../features/composition/algorithms/randomCollage';
type State={assets:Asset[];layers:Layer[];selectedId:string|null;settings:CollageSettings;generating:boolean;libraryReady:boolean;libraryError:string|null;loadLibrary:()=>Promise<void>;deleteAsset:(id:string)=>Promise<void>;setSettings:(p:Partial<CollageSettings>)=>void;addAssets:(a:Asset[])=>void;replaceAsset:(oldId:string,a:Asset)=>Promise<void>;addLayer:(a:Asset)=>void;select:(id:string|null)=>void;update:(id:string,patch:Partial<Layer>)=>void;replaceLayerImage:(id:string,a:Asset)=>void;remove:(id:string)=>void;move:(id:string,dir:number)=>void;arrange:()=>void;generateRandom:()=>Promise<void>;clear:()=>void};
export const useCollageStore=create<State>((set,get)=>({
 assets:[],layers:[],selectedId:null,settings:defaultSettings,generating:false,libraryReady:false,libraryError:null,
 loadLibrary:async()=>{try{const saved=await readSavedAssets();set(s=>({assets:[...s.assets.filter(a=>!a.segmented),...saved],libraryReady:true,libraryError:null}))}catch(e){set({libraryReady:true,libraryError:String(e)})}},
 deleteAsset:async(id)=>{await deleteSavedAsset(id);set(s=>({assets:s.assets.filter(a=>a.id!==id),layers:s.layers.filter(l=>l.src!==s.assets.find(a=>a.id===id)?.src)}))},
 setSettings:(p)=>set(s=>({settings:{...s.settings,...p}})),
 addAssets:(a)=>set(s=>({assets:[...s.assets,...a]})),
 replaceAsset:async(oldId,a)=>{const colorProfile=await analyzeColorProfile(a.src);const result:Asset={...a,id:oldId,segmented:true,colorProfile};await saveSegmentedAsset(result);set(s=>({assets:s.assets.map(x=>x.id===oldId?result:x),layers:s.layers.map(l=>l.src===s.assets.find(x=>x.id===oldId)?.src?{...l,src:result.src,name:result.name}:l)}))},
 addLayer:(a)=>set(s=>{const factor=Math.min(.55*WIDTH/a.width,.5*HEIGHT/a.height,1);const width=Math.max(1,a.width*factor),height=Math.max(1,a.height*factor);const l:Layer={id:crypto.randomUUID(),name:a.name,src:a.src,x:(WIDTH-width)/2,y:(HEIGHT-height)/2,width,height,rotation:0,visible:true,opacity:1};return {layers:[...s.layers,l],selectedId:l.id}}),
 select:(id)=>set({selectedId:id}),update:(id,patch)=>set(s=>({layers:s.layers.map(l=>l.id===id?{...l,...patch}:l)})),
 replaceLayerImage:(id,a)=>set(s=>({layers:s.layers.map(l=>l.id===id?{...l,src:a.src,name:a.name,width:a.width,height:a.height}:l)})),
 remove:(id)=>set(s=>({layers:s.layers.filter(l=>l.id!==id),selectedId:s.selectedId===id?null:s.selectedId})),
 move:(id,dir)=>set(s=>{const layers=[...s.layers],i=layers.findIndex(l=>l.id===id),j=i+dir;if(i>=0&&j>=0&&j<layers.length)[layers[i],layers[j]]=[layers[j],layers[i]];return {layers}}),
 arrange:()=>set(s=>({layers:autoArrange(s.layers)})),
 generateRandom:async()=>{if(get().generating)return;set({generating:true});try{const layers=await randomCollage(get().assets,get().settings);set({layers,selectedId:null})}finally{set({generating:false})}},
 clear:()=>set({layers:[],selectedId:null})
}));
