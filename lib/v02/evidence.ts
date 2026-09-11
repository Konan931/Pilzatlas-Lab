export type EvidenceKind='official'|'expert'|'biodiversity-record'|'community'|'private-field-note'|'model-inference'|'dwp-lore';
export type EvidenceState='observed'|'supported'|'unknown'|'contradicted'|'not-applicable';
export interface EvidenceRecord { id:string; kind:EvidenceKind; state:EvidenceState; label:string; sourceUrl?:string; retrievedAt:string; observedAt?:string; spatialResolution?:string; confidence:number; limitations:string[] }
export const temporalWeight=(days:number,halfLifeDays:number)=>halfLifeDays>0?2**(-Math.max(0,days)/halfLifeDays):0;
export function positiveObservationSignal(count:number):number|null { if(count<=0)return null; return Math.min(1,Math.log2(count+1)/5); }
