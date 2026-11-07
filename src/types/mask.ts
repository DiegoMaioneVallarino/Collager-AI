export type MaskPoint={x:number;y:number};
export type MaskStroke={points:MaskPoint[];size:number;mode:'add'|'erase'};
export type SavedMask={text?:TextMaskDefinition;id:string;name:string;width:number;height:number;path:MaskPoint[];strokes:MaskStroke[];createdAt:number;updatedAt:number};

export type TextMaskDefinition={content:string;fontFamily:string;fontSize:number;fontWeight:number;lineHeight:number;letterSpacing:number;align:'left'|'center'|'right';x:number;y:number;rotation:number};
