import {regions,species,parseNotes,geojson,bbkTiles} from './model.mjs';
const $=id=>document.getElementById(id);
const diagnostic=(id,message)=>{let el=document.getElementById(`diag-${id}`);if(!el){el=document.createElement('li');el.id=`diag-${id}`;$('diagnostics').append(el);}el.textContent=message;};
const state=message=>$('map-state').textContent=message;
const storageKey='pilzatlas-playground-notes-v1';
let notes=[],map,overlay,marker,ready=false,maplibregl;
try{notes=parseNotes(localStorage.getItem(storageKey)||'[]');}catch{ $('note-state').textContent='Gespeicherte Daten nicht lesbar. Bestehende Daten bleiben bis zum nächsten Speichern unverändert.'; }
for(const [i,r] of regions.entries())$('region').add(new Option(r.name,String(i)));
for(const s of species)$('species').add(new Option(s,s));
function region(){return regions[Number($('region').value)];}
function renderNotes(){
  $('count').textContent=String(notes.length);$('notes').replaceChildren();$('export').disabled=!notes.length;
  for(const note of [...notes].reverse()){
    const article=document.createElement('article');article.className='note';
    const title=document.createElement('b');title.textContent=note.species;
    const p=document.createElement('p');p.textContent=note.text;
    const meta=document.createElement('small');meta.textContent=note.coordinates.map(x=>x.toFixed(5)).join(', ');
    const remove=document.createElement('button');remove.type='button';remove.textContent='Entfernen';remove.setAttribute('aria-label',`Notiz ${note.species} entfernen`);
    remove.onclick=()=>saveNotes(notes.filter(n=>n.id!==note.id));article.append(title,remove,p,meta);$('notes').append(article);
  }
  updateLayers();
}
function saveNotes(next){
  try{localStorage.setItem(storageKey,JSON.stringify(next));notes=next;renderNotes();$('note-state').textContent='Lokal gespeichert. Regelmäßig exportieren; Browserdaten können gelöscht werden.';return true;}
  catch{$('note-state').textContent='Speicherung nicht möglich (Speicher gesperrt oder voll). Eingabe bleibt erhalten.';return false;}
}
$('note-form').onsubmit=e=>{e.preventDefault();if(notes.length>=1000){$('note-state').textContent='Limit: 1000 Notizen. Bitte exportieren und einzelne Notizen entfernen.';return;}const note={id:crypto.randomUUID(),species:$('species').value,text:$('note').value.trim(),coordinates:[Number($('lng').value),Number($('lat').value)],createdAt:new Date().toISOString()};if(!note.text)return;if(saveNotes([...notes,note]))$('note').value='';};
$('export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(geojson(notes),null,2)],{type:'application/geo+json'}));const a=document.createElement('a');a.href=url;a.download='pilzatlas-field-notes.geojson';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
function selectPoint(coords){$('lng').value=coords[0].toFixed(5);$('lat').value=coords[1].toFixed(5);if(map){marker??=new maplibregl.Marker({color:'#d6d98e'});marker.setLngLat(coords).addTo(map);}}
function changeRegion(){const r=region();$('region-hint').textContent=r.hint;selectPoint(r.center);if(map)map.easeTo({center:r.center,zoom:10.5,duration:500});updateLayers();}
$('region').onchange=changeRegion;$('reset').onclick=changeRegion;
$('hex').onchange=updateLayers;$('route').onchange=updateLayers;
$('opacity').oninput=()=>{$('opacity-value').textContent=`${$('opacity').value} %`;updateLayers();};
$('bbk').onchange=()=>{if(ready){map.setLayoutProperty('bbk','visibility',$('bbk').checked?'visible':'none');diagnostic('bbk',$('bbk').checked?'BBK: angefordert; Darstellung und CORS werden geprüft.':'BBK: ausgeschaltet');}};
function updateLayers(){
  if(!overlay||!ready)return;
  const center=region().center;
  const cells=h3.gridDisk(h3.latLngToCell(center[1],center[0],8),4).map(hex=>({hex}));
  const alpha=Math.round(Number($('opacity').value)*2.55);
  const layers=[];
  if($('hex').checked)layers.push(new deck.H3HexagonLayer({id:'test-h3',data:cells,getHexagon:d=>d.hex,getFillColor:[214,217,142,alpha],getLineColor:[214,217,142,220],filled:true,stroked:true,lineWidthMinPixels:1,pickable:true,onClick:info=>{if(info.coordinate)selectPoint(info.coordinate.slice(0,2));}}));
  if($('route').checked)layers.push(new deck.PathLayer({id:'demo-path',data:[{path:[[center[0]-.025,center[1]-.015],center,[center[0]+.025,center[1]+.012]]}],getPath:d=>d.path,getColor:[219,154,103,230],getWidth:3,widthUnits:'pixels'}));
  layers.push(new deck.ScatterplotLayer({id:'notes',data:notes,getPosition:d=>d.coordinates,getRadius:45,radiusMinPixels:5,getFillColor:[240,181,117],pickable:true}));
  overlay.setProps({layers});diagnostic('h3',`H3: ${cells.length} synthetische Zellen · R8`);
}
function asset(path,kind='script'){
  const hosts=['https://cdn.jsdelivr.net/npm/','https://unpkg.com/'];
  async function attempt(index){
    try{await new Promise((resolve,reject)=>{const el=document.createElement(kind==='script'?'script':'link');let done=false;const finish=ok=>{if(done)return;done=true;clearTimeout(timer);if(ok)resolve();else{el.remove();reject(new Error(path));}};const timer=setTimeout(()=>finish(false),20000);el.onload=()=>finish(true);el.onerror=()=>finish(false);if(kind==='script'){el.src=hosts[index]+path;el.crossOrigin='anonymous';}else{el.rel='stylesheet';el.href=hosts[index]+path;}document.head.append(el);});diagnostic(path,`${path}: ${index?'unpkg':'jsDelivr'} geladen`);}
    catch(error){if(index===0)return attempt(1);throw error;}
  }return attempt(0);
}
async function loadMapLibre(){
  let lastError;
  for(const host of ['https://cdn.jsdelivr.net/npm/','https://unpkg.com/']){
    try{let timer;try{maplibregl=await Promise.race([import(host+'maplibre-gl@6.10.0/dist/maplibre-gl.mjs'),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('MapLibre CDN timeout')),20000);})]);}finally{clearTimeout(timer);}diagnostic('maplibre','MapLibre 6.10.0: ESM geladen');return;}
    catch(error){lastError=error;}
  }
  throw lastError;
}
async function start(){
  try{
    await Promise.all([loadMapLibre(),asset('maplibre-gl@6.10.0/dist/maplibre-gl.css','style'),asset('h3-js@4.5.0/dist/h3-js.umd.js'),asset('deck.gl@9.4.0/dist.min.js')]);

    map=new maplibregl.Map({container:'map',center:region().center,zoom:10.5,maxZoom:17,style:{version:8,sources:{osm:{type:'raster',tiles:['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],tileSize:256,maxzoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}},layers:[{id:'background',type:'background',paint:{'background-color':'#22372b'}},{id:'osm',type:'raster',source:'osm',paint:{'raster-saturation':-.65,'raster-brightness-max':.65}}]}});
    map.addControl(new maplibregl.NavigationControl(),'bottom-right');
    map.on('error',e=>{const id=e.sourceId==='bbk'?'bbk':'map';diagnostic(id,`${id==='bbk'?'BBK':'Karte'}: Ladefehler – ${e.error?.message||'Netzwerk/CORS/WebGL prüfen'}`);if(id==='map')state('Kartenfehler · Details unter System & Datenquellen');});
    map.on('click',e=>{const p=e.lngLat.wrap();selectPoint([p.lng,p.lat]);});
    map.on('load',()=>{
      map.addSource('bbk',{type:'raster',tiles:[bbkTiles],tileSize:512,minzoom:6,maxzoom:16,attribution:'BBK · LfU Brandenburg'});
      map.addLayer({id:'bbk',type:'raster',source:'bbk',layout:{visibility:$('bbk').checked?'visible':'none'},paint:{'raster-opacity':.45}});
      try{overlay=new deck.MapLibreOverlay({interleaved:true,layers:[],onError:error=>{diagnostic('deck',`deck.gl: ${error.message}`);state('Overlay-Fehler · Notizen bleiben nutzbar');}});map.addControl(overlay);ready=true;updateLayers();diagnostic('deck','deck.gl: Overlay initialisiert (kein geräteübergreifender Kompatibilitätsnachweis)');}
      catch(error){diagnostic('deck',`deck.gl: ${error.message}`);}
      $('reset').disabled=false;state(ready?'Karte bereit · Klick setzt Notizposition':'Basiskarte bereit · Overlay nicht verfügbar');
    });
    map.on('sourcedata',e=>{if(e.sourceId==='bbk'&&e.sourceDataType==='content'&&$('bbk').checked)diagnostic('bbk','BBK: Rasterantwort geladen. Inhalt ist keine Schutzgebiets- oder Sammelfreigabe.');});
    map.getCanvas().addEventListener('webglcontextlost',()=>state('Grafikkontext verloren · Seite neu laden'));
  }catch(error){state('Karte nicht verfügbar · Notizen und Export bleiben nutzbar');diagnostic('startup',`Startfehler: ${error.message}`);}
}
renderNotes();changeRegion();diagnostic('bbk','BBK: ausgeschaltet');start();
