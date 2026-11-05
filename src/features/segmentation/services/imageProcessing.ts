import type { Asset } from '../../../types/collage';
export type Crop = {left:number;top:number;right:number;bottom:number};
export const fullCrop:Crop={left:0,top:0,right:0,bottom:0};
export function loadImage(src:string):Promise<HTMLImageElement>{return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('No se pudo abrir la imagen'));img.src=src})}
export async function processImage(asset:Asset, options:{crop?:Crop;removeWhite?:boolean;tolerance?:number}):Promise<Asset>{
 const img=await loadImage(asset.src);const crop=options.crop??fullCrop;
 const left=Math.round(img.naturalWidth*crop.left/100),top=Math.round(img.naturalHeight*crop.top/100);
 const width=Math.max(1,img.naturalWidth-left-Math.round(img.naturalWidth*crop.right/100));
 const height=Math.max(1,img.naturalHeight-top-Math.round(img.naturalHeight*crop.bottom/100));
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)throw new Error('Canvas no disponible');
 ctx.drawImage(img,left,top,width,height,0,0,width,height);
 if(options.removeWhite){const image=ctx.getImageData(0,0,width,height);const d=image.data;
 // Flood fill: only near-white regions connected to image borders. Interior white details remain intact.
 const visited=new Uint8Array(width*height);const queue=new Int32Array(width*height);let head=0,tail=0;
 const tol=options.tolerance??35;
 const white=(i:number)=>{const p=i*4;return d[p]>=255-tol&&d[p+1]>=255-tol&&d[p+2]>=255-tol&&d[p+3]>0};
 const push=(i:number)=>{if(!visited[i]&&white(i)){visited[i]=1;queue[tail++]=i}};
 for(let x=0;x<width;x++){push(x);push((height-1)*width+x)}
 for(let y=0;y<height;y++){push(y*width);push(y*width+width-1)}
 while(head<tail){const i=queue[head++],x=i%width,y=Math.floor(i/width);if(x>0)push(i-1);if(x<width-1)push(i+1);if(y>0)push(i-width);if(y<height-1)push(i+width)}
 // Feather a thin boundary for softer edges, without removing white interiors.
 for(let i=0;i<visited.length;i++)if(visited[i])d[i*4+3]=0;
 ctx.putImageData(image,0,0);
 }
 return {...asset,id:crypto.randomUUID(),name:asset.name.replace(/(\.[^.]+)?$/,'-recorte.png'),src:canvas.toDataURL('image/png'),width,height};
}
