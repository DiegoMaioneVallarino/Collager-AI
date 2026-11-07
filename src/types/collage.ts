export type Layer={id:string;name:string;src:string;x:number;y:number;width:number;height:number;rotation:number;visible:boolean;opacity:number};
export type ColorProfile={dominant:string;palette:string[];average:string;brightness:number;saturation:number;temperature:'warm'|'cool'|'neutral';analyzedAt:number};
export type AssetClassification={kind:string;style:string;role:string;tags:string[];source:"manual"|"suggested";updatedAt:number};
export type SemanticAnchors={head?:[number,number];leftHand?:[number,number];rightHand?:[number,number];crown?:[number,number];trunk?:[number,number]};
export type Asset={id:string;name:string;src:string;width:number;height:number;segmented?:boolean;anchors?:SemanticAnchors;colorProfile?:ColorProfile;classification?:AssetClassification};
export const WIDTH=1080,HEIGHT=1350;
