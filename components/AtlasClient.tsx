'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Map as MapLibreMap, NavigationControl, AttributionControl } from 'maplibre-gl';
import { MapLibreOverlay } from '@deck.gl/maplibre';
import { H3HexagonLayer } from '@deck.gl/geo-layers';
import { PathLayer } from '@deck.gl/layers';
import { gridDisk, latLngToCell } from 'h3-js';
import { assess, REGIONS, SPECIES, type MissionMode, type Region, type Species } from '@/lib/atlas';

const modeLabel: Record<MissionMode,string>={ 'trumpet-town':'TRUMPET TOWN', heart:'♥ HERBSTTRIP', diversity:'DIVERSITY', recon:'RECON' };
function color(score:number, alpha=170):[number,number,number,number]{ const t=Math.max(0,Math.min(1,score/100)); return [Math.round(122+(231-122)*t),Math.round(90+(217-90)*t),Math.round(143+(91-143)*t),alpha]; }

export function AtlasClient(){
  const [species,setSpecies]=useState<Species>(SPECIES[0]); const [mode,setMode]=useState<MissionMode>('trumpet-town'); const [region,setRegion]=useState<Region>(REGIONS[0]); const [bbk,setBbk]=useState(true);
  const assessment=useMemo(()=>assess(species,region,mode,false),[species,region,mode]);
  return <main className="atlas">
    <aside className="rail panel"><header><div className="toad">T</div><div><span>DWP FIELD SYSTEM</span><b>Agent Toad</b></div></header><p className="micro">MISSION SPECIES</p>{SPECIES.map(s=><button key={s.key} className={s.key===species.key?'active':''} onClick={()=>setSpecies(s)}><b>{s.common}</b><small>{s.latin}</small></button>)}<footer>HOLY MYCELIA · NO PROBABILITY COSPLAY</footer></aside>
    <section className="work"><header className="top panel"><div><span>BERLIN · BRANDENBURG · 2026</span><h1>{species.common}</h1><em>{species.latin}</em></div><div className="mission"><span>MISSION</span><b>{modeLabel[mode]}</b></div><label><input type="checkbox" checked={bbk} onChange={e=>setBbk(e.target.checked)}/> BBK overlay</label></header>
      <MapView region={region} species={species} score={assessment.mission} bbk={bbk}/>
      <div className="modes panel">{(Object.keys(modeLabel) as MissionMode[]).map(m=><button key={m} className={m===mode?'active':''} onClick={()=>setMode(m)}>{modeLabel[m]}</button>)}</div>
    </section>
    <aside className="dock"><section className="panel inspect"><div className="score"><span>MISSION</span><strong>{assessment.mission}</strong></div><span className={`state ${assessment.disposition.toLowerCase()}`}>{assessment.disposition}</span><h2>{region.name}</h2><p>{region.subtitle}</p><div className="metrics">{[['Habitat',assessment.habitat],['Fruiting',assessment.fruiting],['Observation',assessment.observation],['Confidence',assessment.confidence],['Trip',assessment.trip]].map(([k,v])=><div key={String(k)}><span>{k}</span><b>{v==null?'UNKNOWN':v}</b></div>)}</div><h3>WHY</h3>{assessment.positives.map(p=><div className="why" key={p.label}><b>+{p.score}</b><span>{p.label}</span></div>)}<h3>MISSING SIGNALS</h3>{assessment.missing.map(x=><p className="missing" key={x}>◐ {x}</p>)}<p className="boundary">MODEL ≠ OCCURRENCE ≠ EDIBILITY</p></section>
      <section className="panel regions"><h3>EXPEDITION RANKING</h3>{REGIONS.map(r=>{const a=assess(species,r,mode,false);return <button key={r.key} className={r.key===region.key?'active':''} onClick={()=>setRegion(r)}><span><b>{r.name}</b><small>{r.station} → {r.fallback}</small></span><strong>{a.mission}</strong><em>{a.disposition}</em></button>})}</section>
      {species.risk&&<section className="panel warning"><b>CONFUSION GRAPH REQUIRED</b><p>Remote ID is decision support only. Missing decisive characters ⇒ NOT CLEARED FOR CONSUMPTION.</p></section>}
    </aside><footer className="foot">Digital Welfare Productions™ Unltd. · Pilzatlas BB v0.2-alpha · FIELD EVIDENCE / MODEL INFERENCE / DWP LORE remain separate</footer>
  </main>;
}

function MapView({region,species,score,bbk}:{region:Region;species:Species;score:number;bbk:boolean}){
  const host=useRef<HTMLDivElement|null>(null); const mapRef=useRef<MapLibreMap|null>(null); const overlayRef=useRef<MapLibreOverlay|null>(null);
  useEffect(()=>{if(!host.current||mapRef.current)return; const map=new MapLibreMap({container:host.current,style:process.env.NEXT_PUBLIC_MAP_STYLE_URL||'https://tiles.openfreemap.org/styles/liberty',center:region.center,zoom:9.2,attributionControl:false}); map.addControl(new NavigationControl(),'bottom-right'); map.addControl(new AttributionControl({compact:true}),'bottom-left'); map.on('load',()=>{map.addSource('bbk',{type:'raster',tiles:['/api/wms/biotope/{z}/{x}/{y}'],tileSize:512});map.addLayer({id:'bbk',type:'raster',source:'bbk',layout:{visibility:bbk?'visible':'none'},paint:{'raster-opacity':.34}})}); mapRef.current=map; return()=>{overlayRef.current?.finalize();map.remove();mapRef.current=null}},[]);
  useEffect(()=>{const map=mapRef.current;if(!map)return; map.easeTo({center:region.center,zoom:9.2,duration:650})},[region.center]);
  useEffect(()=>{const map=mapRef.current;if(map?.getLayer('bbk'))map.setLayoutProperty('bbk','visibility',bbk?'visible':'none')},[bbk]);
  useEffect(()=>{const map=mapRef.current;if(!map)return; const center=latLngToCell(region.center[1],region.center[0],8); const hexes=gridDisk(center,4).map((h,i)=>({h,score:Math.max(0,Math.min(100,score+(i%9-4)*2))})); const overlay=new MapLibreOverlay({interleaved:true,layers:[new H3HexagonLayer({id:'mission',data:hexes,getHexagon:(d:any)=>d.h,getFillColor:(d:any)=>color(d.score,48),getLineColor:(d:any)=>color(d.score,155),filled:true,wireframe:true,lineWidthMinPixels:1,pickable:true}),new PathLayer({id:'route',data:[region.route],getPath:(d:any)=>d,getColor:[216,210,196,230],getWidth:3,widthMinPixels:2})]}); overlayRef.current?.finalize(); overlayRef.current=overlay; map.addControl(overlay as any); return()=>{try{map.removeControl(overlay as any)}catch{} overlay.finalize()}},[region, species.key, score]);
  return <div className="map"><div ref={host} className="maphost"/><div className="maptag">MODEL SEED · H3 R8</div><div className="legend"><b>{species.code}</b><div/><span>lower suitability</span><span>higher suitability</span></div></div>;
}
