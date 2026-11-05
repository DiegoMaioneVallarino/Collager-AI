import { create } from 'zustand';
import type { Asset, Layer } from '../types/collage';
import { WIDTH, HEIGHT } from '../types/collage';
import { autoArrange } from '../features/composition/algorithms/autoArrange';
import { randomCollage } from '../features/composition/algorithms/randomCollage';
type State={assets:Asset[];layers:Layer[];selectedId:string|null;addAssets:(a:Asset[])=>void;addLayer:(a:Asset)=>void;select:(id:string|null)=>void;update:(id:string,patch:Partial<Layer>)=>void;replaceLayerImage:(id:string,a:Asset)=>void;remove:(id:string)=>void;move:(id:string,dir:number)=>void;arrange:()=>void;generateRandom:(assets:Asset[])=>void;clear:()=>void};
export const useCollageStore=create<State>((set)=>({
 assets:[],layers:[],selectedId:null,
 addAssets:(assets)=>set(s=>({assets:[...s.assets,...assets]})),
 addLayer:(a)=>set(s=>{const factor=Math.min(0.55*WIDTH/a.width,0.5*HEIGHT/a.height,1);const width=Math.max(1,a.width*factor),height=Math.max(1,a.height*factor);const layer:Layer={id:crypto.randomUUID(),name:a.name,src:a.src,x:(WIDTH-width)/2,y:(HEIGHT-height)/2,width,height,rotation:0,visible:true,opacity:1};return {layers:[...s.layers,layer],selectedId:layer.id}}),
 select:(id)=>set({selectedId:id}),
 update:(id,patch)=>set(s=>({layers:s.layers.map(l=>l.id===id?{...l,...patch}:l)})),
 replaceLayerImage:(id,a)=>set(s=>({layers:s.layers.map(l=>l.id===id?{...l,src:a.src,name:a.name,width:a.width,height:a.height}:l)})),
 remove:(id)=>set(s=>({layers:s.layers.filter(l=>l.id!==id),selectedId:s.selectedId===id?null:s.selectedId})),
 move:(id,dir)=>set(s=>{const layers=[...s.layers],i=layers.findIndex(l=>l.id===id),j=i+dir;if(i>=0&&j>=0&&j<layers.length)[layers[i],layers[j]]=[layers[j],layers[i]];return {layers}}),
 arrange:()=>set(s=>({layers:autoArrange(s.layers)})),
 generateRandom:(assets)=>set({layers:randomCollage(assets),selectedId:null}),
 clear:()=>set({layers:[],selectedId:null})
}));
