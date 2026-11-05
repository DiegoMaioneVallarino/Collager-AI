import type { Layer } from '../../../types/collage';
import { WIDTH, HEIGHT } from '../../../types/collage';
export function autoArrange(layers:Layer[]):Layer[]{
 const n=layers.length;if(!n)return [];
 const cols=Math.ceil(Math.sqrt(n*WIDTH/HEIGHT)),rows=Math.ceil(n/cols);
 const cellW=WIDTH/cols,cellH=HEIGHT/rows;
 return layers.map((l,i)=>{const factor=Math.min(cellW*.88/l.width,cellH*.88/l.height);const width=l.width*factor,height=l.height*factor;return {...l,width,height,x:(i%cols)*cellW+(cellW-width)/2,y:Math.floor(i/cols)*cellH+(cellH-height)/2,rotation:0}});
}
