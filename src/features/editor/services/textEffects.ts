export type TextEffects={bevel:boolean;depth:number;lightAngle:number;highlight:number;shadowStrength:number;dropShadow:boolean;shadowDistance:number;shadowBlur:number;shadowOpacity:number;innerShadow:boolean;innerShadowDistance:number;innerGlow:boolean;outerGlow:boolean;glowSize:number;glowColor:string;glowOpacity:number;strokeSize:number;strokeColor:string};
export const defaultTextEffects:TextEffects={bevel:true,depth:5,lightAngle:135,highlight:75,shadowStrength:55,dropShadow:true,shadowDistance:12,shadowBlur:12,shadowOpacity:65,innerShadow:false,innerShadowDistance:4,innerGlow:false,outerGlow:false,glowSize:14,glowColor:'#8c63ff',glowOpacity:75,strokeSize:0,strokeColor:'#ffffff'};
const canvas=(w:number,h:number)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
export function applyTextEffects(fill:HTMLCanvasElement,mask:HTMLCanvasElement,fx:TextEffects){const w=mask.width,h=mask.height;const out=canvas(w,h),ctx=out.getContext('2d')!;const m=mask.getContext('2d')!.getImageData(0,0,w,h).data;const alpha=(x:number,y:number)=>x<0||y<0||x>=w||y>=h?0:m[(Math.floor(y)*w+Math.floor(x))*4+3]/255;
// Outside effects are rendered before the fill and use the alpha silhouette.
if(fx.outerGlow){ctx.save();ctx.shadowColor=fx.glowColor;ctx.shadowBlur=fx.glowSize*2;ctx.globalAlpha=fx.glowOpacity/100;ctx.drawImage(mask,0,0);ctx.restore()}
if(fx.dropShadow){ctx.save();ctx.shadowColor=`rgba(0,0,0,${fx.shadowOpacity/100})`;ctx.shadowBlur=fx.shadowBlur;const a=fx.lightAngle*Math.PI/180;ctx.shadowOffsetX=Math.cos(a)*fx.shadowDistance;ctx.shadowOffsetY=Math.sin(a)*fx.shadowDistance;ctx.drawImage(mask,0,0);ctx.restore()}
if(fx.strokeSize>0){ctx.save();ctx.shadowColor=fx.strokeColor;ctx.shadowBlur=0;ctx.fillStyle=fx.strokeColor;const radius=Math.round(fx.strokeSize);for(let a=0;a<360;a+=Math.max(5,25/radius)){const t=a*Math.PI/180;ctx.drawImage(mask,Math.cos(t)*radius,Math.sin(t)*radius)}ctx.restore()}
ctx.drawImage(fill,0,0);
const overlay=canvas(w,h),o=overlay.getContext('2d')!,im=o.createImageData(w,h),d=im.data;
const rad=fx.lightAngle*Math.PI/180,lx=-Math.cos(rad),ly=-Math.sin(rad),step=Math.max(1,fx.depth);
for(let y=0;y<h;y++)for(let x=0;x<w;x++){const a=alpha(x,y);if(a<.01)continue;const i=(y*w+x)*4;let white=0,black=0;
if(fx.bevel){const dx=alpha(x-step,y)-alpha(x+step,y),dy=alpha(x,y-step)-alpha(x,y+step);const dot=(dx*lx+dy*ly)/Math.SQRT2;white=Math.max(0,dot)*fx.highlight/100;black=Math.max(0,-dot)*fx.shadowStrength/100}
if(fx.innerGlow){const edge=Math.max(0,1-Math.min(alpha(x-fx.glowSize,y),alpha(x+fx.glowSize,y),alpha(x,y-fx.glowSize),alpha(x,y+fx.glowSize)));white=Math.max(white,edge*fx.glowOpacity/180)}
if(fx.innerShadow){const sx=Math.round(Math.cos(rad)*fx.innerShadowDistance),sy=Math.round(Math.sin(rad)*fx.innerShadowDistance);black=Math.max(black,Math.max(0,a-alpha(x-sx,y-sy))*.65)}
if(white>black){d[i]=255;d[i+1]=255;d[i+2]=255;d[i+3]=Math.round(Math.min(1,white-black)*255*a)}else{d[i]=0;d[i+1]=0;d[i+2]=0;d[i+3]=Math.round(Math.min(1,black-white)*255*a)}}
o.putImageData(im,0,0);ctx.drawImage(overlay,0,0);return out}
