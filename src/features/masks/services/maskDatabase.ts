import type {SavedMask} from '../../../types/mask';
const DB='collager-ai-library',STORE='masks';
function open():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,2);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('segmented-assets'))r.result.createObjectStore('segmented-assets',{keyPath:'id'});if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE,{keyPath:'id'})};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function operation<T>(mode:IDBTransactionMode,request:(s:IDBObjectStore)=>IDBRequest<T>):Promise<T>{const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,mode);const req=request(tx.objectStore(STORE));req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);tx.oncomplete=()=>db.close();tx.onerror=()=>reject(tx.error)})}
export const readMasks=()=>operation<SavedMask[]>('readonly',s=>s.getAll());
export const saveMask=(mask:SavedMask)=>operation<IDBValidKey>('readwrite',s=>s.put(mask));
export const deleteMask=(id:string)=>operation<undefined>('readwrite',s=>s.delete(id));
