export type MaskPoint={x:number;y:number};
export type MaskStroke={points:MaskPoint[];size:number;mode:'add'|'erase'};
export type SavedMask={id:string;name:string;width:number;height:number;path:MaskPoint[];strokes:MaskStroke[];createdAt:number;updatedAt:number};
