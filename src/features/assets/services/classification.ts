import type {Asset,AssetClassification} from '../../../types/collage';
export const KINDS=['sin clasificar','persona','personaje','animal','herramienta','vehículo','número','letra','símbolo','edificio','planta','alimento','objeto','paisaje','otro'];
export const STYLES=['sin clasificar','fotografía','ilustración','pixel art','3D','dibujo','icono','meme','tipografía','otro'];
export const ROLES=['sin clasificar','sujeto','fondo','decoración','textura','marco','tipografía'];
const patterns:[string,RegExp][]=[['número',/\b(number|numero|digit|[0-9]{1,3})\b/i],['persona',/person|human|portrait|retrato|mujer|hombre/i],['personaje',/character|personaje|anime|mascot/i],['animal',/cat|dog|fish|bird|pez|gato|perro|animal/i],['herramienta',/tool|hammer|drill|martillo|herramienta/i],['vehículo',/car|truck|vehicle|auto|coche|avion/i],['edificio',/house|building|casa|edificio|templo/i],['planta',/flower|tree|plant|flor|arbol/i],['alimento',/food|fruit|pizza|comida|fruta/i],['símbolo',/symbol|sigil|simbolo|logo/i]];
export function suggestClassification(asset:Asset):AssetClassification {
 const name=asset.name.toLowerCase();const kind=patterns.find(([,r])=>r.test(name))?.[0]||'sin clasificar';
 const style=/pixel/.test(name)?'pixel art':/illustrat|ilustr|drawing/.test(name)?'ilustración':/meme/.test(name)?'meme':/icon|logo/.test(name)?'icono':'sin clasificar';
 const role=/background|fondo|wallpaper/.test(name)?'fondo':/texture|textura/.test(name)?'textura':kind==='número'?'tipografía':kind!=='sin clasificar'?'sujeto':'sin clasificar';
 return {kind,style,role,tags:[],source:'suggested',updatedAt:Date.now()};
}
export function normalizeClassification(c:AssetClassification):AssetClassification {return {...c,tags:[...new Set(c.tags.map(t=>t.trim().toLowerCase()).filter(Boolean))].slice(0,30),updatedAt:Date.now()}}
