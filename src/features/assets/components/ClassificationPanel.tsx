import {useEffect,useState} from 'react';
import type {Asset,AssetClassification} from '../../../types/collage';
import {useCollageStore} from '../../../store/useCollageStore';
import {KINDS,STYLES,ROLES,suggestClassification} from '../services/classification';
export function ClassificationPanel({asset,onClose}:{asset:Asset;onClose:()=>void}){
 const save=useCollageStore(s=>s.classifyAsset);
 const [form,setForm]=useState<AssetClassification>(asset.classification||suggestClassification(asset));
 const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 useEffect(()=>{setForm(asset.classification||suggestClassification(asset))},[asset]);
 const field=(label:string,key:'kind'|'style'|'role',options:string[])=><label className="field">{label}<select value={form[key]} onChange={e=>setForm(v=>({...v,[key]:e.target.value,source:'manual'}))}>{options.map(v=><option key={v} value={v}>{v}</option>)}</select></label>;
 return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><div className="crop-modal classification-modal"><div className="modal-heading"><h2>Clasificar recurso</h2><button onClick={onClose}>×</button></div><div className="classification-preview"><img src={asset.src} alt={asset.name}/><div><strong>{asset.name}</strong><p className="hint">{asset.segmented?'✓ Segmentado · permanente':'Original temporal'}</p><p className="hint">Las sugerencias iniciales usan el nombre del archivo, no reconocimiento visual.</p></div></div><div className="classification-fields">{field('Tipo de objeto','kind',KINDS)}{field('Estilo visual','style',STYLES)}{field('Función en collage','role',ROLES)}</div><label className="field">Etiquetas (separadas por coma)<input value={form.tags.join(', ')} onChange={e=>setForm(v=>({...v,tags:e.target.value.split(','),source:'manual'}))} placeholder="espacial, azul, retro, y2k"/></label>{error&&<p className="error">{error}</p>}<div className="modal-actions"><button onClick={onClose}>Cancelar</button><button className="primary" disabled={busy} onClick={async()=>{setBusy(true);try{await save(asset.id,{...form,source:'manual'});onClose()}catch(e){setError(String(e))}finally{setBusy(false)}}}>{busy?'Guardando…':'Guardar clasificación'}</button></div></div></div>
}
