import {useState} from 'react';
import {useCollageStore} from '../../../store/useCollageStore';
import type {Layer,Asset} from '../../../types/collage';
import {CropPanel} from './CropPanel';
export function PropertiesPanel(){const layers=useCollageStore(s=>s.layers),id=useCollageStore(s=>s.selectedId),update=useCollageStore(s=>s.update),[editing,setEditing]=useState(false),l=layers.find(x=>x.id===id);if(!l)return <section className="panel"><h2>Propiedades</h2><p className="empty">Selecciona una capa.</p></section>;
 const field=(name:keyof Pick<Layer,'x'|'y'|'width'|'height'|'rotation'|'opacity'>,label:string,step=1)=><label className="field">{label}<input type="number" step={step} value={Number(l[name].toFixed(2))} onChange={e=>{const v=Number(e.target.value);if(Number.isFinite(v))update(l.id,{[name]:name==='opacity'?Math.min(1,Math.max(0,v)):name==='width'||name==='height'?Math.max(1,v):v})}}/></label>;
 const asset:Asset={id:l.id,name:l.name,src:l.src,width:l.width,height:l.height};
 return <section className="panel"><h2>Propiedades</h2><button className="full" onClick={()=>setEditing(true)}>✂ Seleccionar objeto / quitar fondo</button><div className="fields" style={{marginTop:12}}>{field('x','X')}{field('y','Y')}{field('width','Ancho')}{field('height','Alto')}{field('rotation','Rotación °')}{field('opacity','Opacidad (0–1)',.1)}</div>{editing&&<CropPanel asset={asset} layerId={l.id} onClose={()=>setEditing(false)}/>}</section>
}
