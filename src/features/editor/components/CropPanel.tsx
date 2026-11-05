import {useState} from 'react';
import type {Asset} from '../../../types/collage';
import {fullCrop,processImage} from '../../segmentation/services/imageProcessing';
import type {Crop} from '../../segmentation/services/imageProcessing';
import {useCollageStore} from '../../../store/useCollageStore';
export function CropPanel({asset,onClose,layerId}:{asset:Asset;onClose:()=>void;layerId?:string}){
 const [crop,setCrop]=useState<Crop>({...fullCrop});const [white,setWhite]=useState(true);const [tolerance,setTolerance]=useState(35);
 const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 const addAssets=useCollageStore(s=>s.addAssets),replace=useCollageStore(s=>s.replaceLayerImage);
 async function apply(){setBusy(true);setError('');try{const result=await processImage(asset,{crop,removeWhite:white,tolerance});addAssets([result]);if(layerId)replace(layerId,result);onClose()}catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}}
 const keys:(keyof Crop)[]=['left','top','right','bottom'];const labels=['Izquierda','Arriba','Derecha','Abajo'];
 return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><div className="crop-modal" role="dialog" aria-modal="true" aria-label="Recortar imagen"><div className="modal-heading"><h2>Recortar y quitar fondo</h2><button onClick={onClose}>✕</button></div>
 <div className="crop-preview"><img src={asset.src} alt={asset.name} style={{clipPath:`inset(${crop.top}% ${crop.right}% ${crop.bottom}% ${crop.left}%)`}}/></div>
 <p className="hint">Ajusta los bordes del recorte. El área visible será la imagen resultante.</p>
 <div className="crop-controls">{keys.map((key,i)=><label key={key}>{labels[i]}: {crop[key]}%<input type="range" min="0" max={key==='left'||key==='right'?95-crop[key==='left'?'right':'left']:95-crop[key==='top'?'bottom':'top']} value={crop[key]} onChange={e=>setCrop(s=>({...s,[key]:Number(e.target.value)}))}/></label>)}</div>
 <label className="toggle"><input type="checkbox" checked={white} onChange={e=>setWhite(e.target.checked)}/> Quitar fondo blanco conectado a los bordes</label>
 {white&&<label className="slider-field">Tolerancia: {tolerance}<input type="range" min="5" max="90" value={tolerance} onChange={e=>setTolerance(Number(e.target.value))}/></label>}
 {error&&<p className="error">{error}</p>}<div className="modal-actions"><button onClick={onClose}>Cancelar</button><button className="primary" disabled={busy} onClick={()=>void apply()}>{busy?'Procesando…':'Aplicar recorte'}</button></div></div></div>
}
