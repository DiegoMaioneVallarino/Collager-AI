import {useState} from 'react';
import {AssetPanel} from './features/assets/components/AssetPanel';
import {LayersPanel} from './features/editor/components/LayersPanel';
import {PropertiesPanel} from './features/editor/components/PropertiesPanel';
import {CollageCanvas,exportPNG} from './engine/canvas/CollageCanvas';
import {useCollageStore} from './store/useCollageStore';
import {processImage} from './features/segmentation/services/imageProcessing';
import './App.css';
export default function App(){const layers=useCollageStore(s=>s.layers),assets=useCollageStore(s=>s.assets),addAssets=useCollageStore(s=>s.addAssets),generateRandom=useCollageStore(s=>s.generateRandom),arrange=useCollageStore(s=>s.arrange),clear=useCollageStore(s=>s.clear),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function generate(){if(!assets.length)return;setBusy(true);setError('');try{const processed=[];for(const a of assets){processed.push(await processImage(a,{removeWhite:true,tolerance:35}));await new Promise<void>(resolve=>setTimeout(resolve,0))}addAssets(processed);generateRandom(processed)}catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}}
 return <div className="app"><header className="topbar"><div className="brand"><span className="brand-icon">✳</span> Collager<span className="accent">AI</span></div><div className="top-actions"><span className="status">1080 × 1350</span><button onClick={arrange} disabled={!layers.length}>▦ Auto organizar</button><button className="primary" onClick={()=>void generate()} disabled={!assets.length||busy}>{busy?'Procesando imágenes…':'✦ Recortar + Collage aleatorio'}</button><button onClick={clear} disabled={!layers.length}>Limpiar</button><button onClick={()=>exportPNG(layers)} disabled={!layers.length}>↓ Exportar PNG</button></div></header><main className="workspace"><aside className="sidebar left"><AssetPanel/></aside><section className="stage"><div className="stage-label">LIENZO · Arrastra imágenes para moverlas</div><div className="canvas-wrap"><CollageCanvas/></div><p className="stage-note">✂ Recorte manual · Fondo blanco automático · Composición aleatoria (cada clic crea otra distribución)</p>{error&&<p className="error">{error}</p>}</section><aside className="sidebar right"><LayersPanel/><PropertiesPanel/></aside></main></div>
}
