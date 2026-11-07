export type Layer={id:string;name:string;src:string;x:number;y:number;width:number;height:number;rotation:number;visible:boolean;opacity:number};
export type ColorProfile={dominant:string;palette:string[];average:string;brightness:number;saturation:number;temperature:'warm'|'cool'|'neutral';analyzedAt:number};
export type Asset={id:string;name:string;src:string;width:number;height:number;segmented?:boolean;colorProfile?:ColorProfile};
export const WIDTH=1080,HEIGHT=1350;
