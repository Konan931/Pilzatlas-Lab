export type MissionMode = 'trumpet-town' | 'heart' | 'diversity' | 'recon';
export type Disposition = 'HARVEST' | 'RECON' | 'PHOTO_ONLY' | 'VERIFY' | 'DO_NOT_ROUTE';
export type SpeciesKey = 'craterellus' | 'parasol' | 'sparassis' | 'calvatia' | 'boletus' | 'imleria' | 'tubaeformis' | 'agaricus';
export type FeatureKey = 'beech' | 'conifer' | 'mixed' | 'open' | 'rich' | 'acidic' | 'host' | 'nutrient' | 'wet';
export interface Species { key: SpeciesKey; common: string; latin: string; code: string; weights: Partial<Record<FeatureKey, number>>; risk?: 'confusion' }
export interface Region { key: string; name: string; subtitle: string; center: [number, number]; station: string; fallback: string; route: [number, number][]; features: Record<FeatureKey, number>; scenery: number; cycle: number; transit: number; observation: number; conservation: 'OPEN' | 'VERIFY' | 'PHOTO_ONLY' }
export interface Assessment { habitat: number; fruiting: number | null; observation: number; coverage: number; confidence: number; trip: number; mission: number; disposition: Disposition; positives: { label: string; score: number }[]; missing: string[] }
export const SPECIES: Species[] = [
  { key:'craterellus', common:'Totentrompete', latin:'Craterellus cornucopioides', code:'TRUMPET TOWN', weights:{beech:.32,rich:.22,wet:.22,mixed:.14,host:.10} },
  { key:'parasol', common:'Parasol', latin:'Macrolepiota procera', code:'PARASOL ARRAY', weights:{open:.35,mixed:.20,nutrient:.18,wet:.15,rich:.12}, risk:'confusion' },
  { key:'sparassis', common:'Krause Glucke', latin:'Sparassis crispa', code:'GLUCKE HOSTLINK', weights:{host:.40,conifer:.27,wet:.18,acidic:.15} },
  { key:'calvatia', common:'Riesenbovist', latin:'Calvatia gigantea', code:'GIANT PUFF', weights:{open:.36,nutrient:.31,wet:.20,rich:.13} },
  { key:'boletus', common:'Steinpilz', latin:'Boletus edulis agg.', code:'BOLETUS GRID', weights:{host:.27,mixed:.22,beech:.18,conifer:.16,wet:.17} },
  { key:'imleria', common:'Marone', latin:'Imleria badia', code:'BAY BOLETE', weights:{conifer:.34,acidic:.27,wet:.22,host:.17} },
  { key:'tubaeformis', common:'Trompetenpfifferling', latin:'Craterellus tubaeformis', code:'LATE TRUMPET', weights:{wet:.34,conifer:.24,mixed:.22,acidic:.20} },
  { key:'agaricus', common:'Champignon-Gruppe', latin:'Agaricus spp.', code:'CONFUSION GRAPH', weights:{open:.30,nutrient:.25,rich:.20,wet:.15,mixed:.10}, risk:'confusion' }
];
export const REGIONS: Region[] = [
  { key:'bad-freienwalde', name:'Bad Freienwalde / Oderbruchkante', subtitle:'evidence-backed Trumpet Town candidate', center:[14.03,52.79], station:'Bad Freienwalde', fallback:'Eberswalde', route:[[14.03,52.79],[13.96,52.82],[13.89,52.84],[13.82,52.83]], features:{beech:.88,conifer:.35,mixed:.78,open:.30,rich:.83,acidic:.25,host:.69,nutrient:.44,wet:.68}, scenery:.91,cycle:.78,transit:.86,observation:.42,conservation:'VERIFY' },
  { key:'maerkische-schweiz', name:'Märkische Schweiz', subtitle:'HEART / HERBSTTRIP candidate', center:[14.07,52.57], station:'Müncheberg (Mark)', fallback:'Strausberg', route:[[14.13,52.52],[14.10,52.55],[14.07,52.57],[14.02,52.58]], features:{beech:.68,conifer:.60,mixed:.82,open:.58,rich:.62,acidic:.48,host:.66,nutrient:.52,wet:.74}, scenery:.98,cycle:.76,transit:.67,observation:.41,conservation:'VERIFY' },
  { key:'grumsin', name:'Grumsin / Schorfheide-Chorin', subtitle:'ecology reference · protected', center:[13.89,53.00], station:'Angermünde', fallback:'Chorin', route:[[13.99,53.02],[13.94,53.01],[13.89,53.00],[13.86,52.90]], features:{beech:.97,conifer:.18,mixed:.74,open:.16,rich:.89,acidic:.18,host:.70,nutrient:.38,wet:.76}, scenery:1,cycle:.55,transit:.64,observation:.38,conservation:'PHOTO_ONLY' },
  { key:'biesenthal', name:'Biesenthal / Schorfheide', subtitle:'conifer-diversity corridor', center:[13.70,52.79], station:'Biesenthal', fallback:'Eberswalde', route:[[13.63,52.77],[13.68,52.79],[13.74,52.81],[13.82,52.83]], features:{beech:.48,conifer:.86,mixed:.76,open:.42,rich:.42,acidic:.80,host:.82,nutrient:.34,wet:.58}, scenery:.91,cycle:.90,transit:.82,observation:.50,conservation:'OPEN' }
];
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const pct=(n:number)=>Math.round(clamp(n)*100);
export function assess(species: Species, region: Region, mode: MissionMode, weatherLoaded=false): Assessment {
  const parts=Object.entries(species.weights).map(([key,w])=>({key:key as FeatureKey,w:w as number,value:region.features[key as FeatureKey]*(w as number)}));
  const total=parts.reduce((s,p)=>s+p.w,0)||1;
  const habitat=parts.reduce((s,p)=>s+p.value,0)/total;
  const fruiting=weatherLoaded ? clamp(.55*region.features.wet+.45*.65) : null;
  const trip=clamp(.36*region.scenery+.22*region.cycle+.30*region.transit+.12*.8);
  const obs=region.observation;
  const baseFruiting=fruiting ?? .5;
  const mission=mode==='heart' ? .32*habitat+.12*baseFruiting+.08*obs+.48*trip : mode==='recon' ? .56*habitat+.06*baseFruiting+.05*obs+.33*trip : .51*habitat+.25*baseFruiting+.14*obs+.10*trip;
  const disposition: Disposition = region.conservation==='PHOTO_ONLY' ? 'PHOTO_ONLY' : region.conservation==='VERIFY' ? 'VERIFY' : fruiting==null ? 'RECON' : 'HARVEST';
  return { habitat:pct(habitat), fruiting:fruiting==null?null:pct(fruiting), observation:pct(obs), coverage:weatherLoaded?72:56, confidence:weatherLoaded?82:74, trip:pct(trip), mission:pct(mission), disposition, positives:parts.sort((a,b)=>b.value-a.value).slice(0,5).map(p=>({label:p.key,score:Math.round(p.value/total*100)})), missing:[...(weatherLoaded?[]:['cell-level current moisture']), 'independent same-week observations', ...(region.conservation==='VERIFY'?['site-specific ordinance check']:[])] };
}
