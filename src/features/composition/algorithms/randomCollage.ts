import type {Asset,Layer} from '../../../types/collage';
import {WIDTH,HEIGHT} from '../../../types/collage';
const rand=(min:number,max:number)=>min+Math.random()*(max-min);
export function randomCollage(assets:Asset[]):Layer[]{return assets.flatMap((asset,index)=>{
 const repeats=assets.length<5?3:assets.length<12?2:1;
 return Array.from({length:repeats},(_,j)=>{
  const scale=rand(.15,.48)*Math.min(WIDTH/asset.width,HEIGHT/asset.height);
  const width=Math.max(1,asset.width*scale),height=Math.max(1,asset.height*scale);
  return {id:crypto.randomUUID(),name:`${asset.name} ${index+1}.${j+1}`,src:asset.src,
   x:rand(-width*.35,WIDTH-width*.65),y:rand(-height*.35,HEIGHT-height*.65),
   width,height,rotation:rand(-65,65),visible:true,opacity:rand(.83,1)};
 });
})}
