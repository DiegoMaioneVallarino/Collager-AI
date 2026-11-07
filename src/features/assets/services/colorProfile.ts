import type {ColorProfile} from '../../../types/collage';
import {loadImage} from '../../segmentation/services/imageProcessing';
const hex=(r:number,g:number,b:number)=>'#'+[r,g,b].map(v=>Math.round(v).toString(16).padStart(2,'0')).join('').toUpperCase();
export async function analyzeColorProfile(src:string):Promise<ColorProfile>{
 const img=await loadImage(src);const canvas=document.createElement('canvas');const ratio=Math.min(1,160/Math.max(img.naturalWidth,img.naturalHeight));canvas.width=Math.max(1,Math.round(img.naturalWidth*ratio));canvas.height=Math.max(1,Math.round(img.naturalHeight*ratio));const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)throw new Error('Canvas no disponible');ctx.drawImage(img,0,0,canvas.width,canvas.height);const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;
 const bins=new Map<number,{weight:number,r:number,g:number,b:number}>();let sumR=0,sumG=0,sumB=0,total=0,brightness=0,saturation=0,warmth=0;
 for(let i=0;i<data.length;i+=4){const a=data[i+3]/255;if(a<.12)continue;const r=data[i],g=data[i+1],b=data[i+2];const key=((r>>5)<<6)|((g>>5)<<3)|(b>>5);const bin=bins.get(key)||{weight:0,r:0,g:0,b:0};bin.weight+=a;bin.r+=r*a;bin.g+=g*a;bin.b+=b*a;bins.set(key,bin);sumR+=r*a;sumG+=g*a;sumB+=b*a;total+=a;brightness+=(.2126*r+.7152*g+.0722*b)/255*a;saturation+=(Math.max(r,g,b)-Math.min(r,g,b))/255*a;warmth+=(r-b)*a}
 if(total===0)throw new Error('La imagen es totalmente transparente');
 const ranked=[...bins.values()].sort((a,b)=>b.weight-a.weight);const palette=ranked.slice(0,5).map(v=>hex(v.r/v.weight,v.g/v.weight,v.b/v.weight));const average=hex(sumR/total,sumG/total,sumB/total);return {dominant:palette[0]||average,palette,average,brightness:Math.round(brightness/total*100),saturation:Math.round(saturation/total*100),temperature:warmth/total>12?'warm':warmth/total< -12?'cool':'neutral',analyzedAt:Date.now()};
}
