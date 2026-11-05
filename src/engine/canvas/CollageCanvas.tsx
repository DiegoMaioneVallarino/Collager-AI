import { useEffect,useRef,useState } from 'react';
import { useCollageStore } from '../../store/useCollageStore';
import { WIDTH,HEIGHT } from '../../types/collage';
import type { Layer } from '../../types/collage';
const cache=new Map<string,HTMLImageElement>();
function getImage(src:string,redraw:()=>void){let img=cache.get(src);if(!img){img=new Image();img.onload=redraw;img.src=src;cache.set(src,img)}return img}
function drawLayer(ctx:CanvasRenderingContext2D,l:Layer,redraw:()=>void){if(!l.visible)return;const img=getImage(l.src,redraw);if(!img.complete||!img.naturalWidth)return;ctx.save();ctx.globalAlpha=l.opacity;ctx.translate(l.x+l.width/2,l.y+l.height/2);ctx.rotate(l.rotation*Math.PI/180);ctx.drawImage(img,-l.width/2,-l.height/2,l.width,l.height);ctx.restore()}
export function CollageCanvas(){const ref=useRef<HTMLCanvasElement>(null);const layers=useCollageStore(s=>s.layers),selectedId=useCollageStore(s=>s.selectedId),select=useCollageStore(s=>s.select),update=useCollageStore(s=>s.update);const [version,redraw]=useState(0);const drag=useRef<{id:string;dx:number;dy:number}|null>(null);
 useEffect(()=>{const c=ref.current,ctx=c?.getContext('2d');if(!c||!ctx)return;ctx.fillStyle='#f3f0eb';ctx.fillRect(0,0,WIDTH,HEIGHT);layers.forEach(l=>drawLayer(ctx,l,()=>redraw(v=>v+1)));const l=layers.find(l=>l.id===selectedId);if(l&&l.visible){ctx.save();ctx.translate(l.x+l.width/2,l.y+l.height/2);ctx.rotate(l.rotation*Math.PI/180);ctx.strokeStyle='#a78bfa';ctx.lineWidth=5;ctx.setLineDash([14,8]);ctx.strokeRect(-l.width/2,-l.height/2,l.width,l.height);ctx.restore()}},[layers,selectedId,version]);
 const point=(e:React.PointerEvent<HTMLCanvasElement>)=>{const r=e.currentTarget.getBoundingClientRect();return {x:(e.clientX-r.left)*WIDTH/r.width,y:(e.clientY-r.top)*HEIGHT/r.height}};
 const hit=(l:Layer,p:{x:number;y:number})=>{if(!l.visible)return false;const a=-l.rotation*Math.PI/180,dx=p.x-l.x-l.width/2,dy=p.y-l.y-l.height/2;const x=dx*Math.cos(a)-dy*Math.sin(a),y=dx*Math.sin(a)+dy*Math.cos(a);return Math.abs(x)<=l.width/2&&Math.abs(y)<=l.height/2};
 const down=(e:React.PointerEvent<HTMLCanvasElement>)=>{const p=point(e);const found=[...layers].reverse().find(l=>hit(l,p));select(found?.id??null);if(found){drag.current={id:found.id,dx:p.x-found.x,dy:p.y-found.y};e.currentTarget.setPointerCapture(e.pointerId)}};
 const move=(e:React.PointerEvent<HTMLCanvasElement>)=>{if(!drag.current)return;const p=point(e);update(drag.current.id,{x:p.x-drag.current.dx,y:p.y-drag.current.dy})};
 const stop=()=>{drag.current=null};
 return <canvas ref={ref} width={WIDTH} height={HEIGHT} className="artboard" onPointerDown={down} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} />
}
export function exportPNG(layers:Layer[]){const canvas=document.createElement('canvas');canvas.width=WIDTH;canvas.height=HEIGHT;const ctx=canvas.getContext('2d');if(!ctx)return;ctx.fillStyle='#f3f0eb';ctx.fillRect(0,0,WIDTH,HEIGHT);layers.forEach(l=>drawLayer(ctx,l,()=>{}));const a=document.createElement('a');a.download='collager-ai.png';a.href=canvas.toDataURL('image/png');a.click()}
