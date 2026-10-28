export const regions = [
  {name:'Bad Freienwalde',center:[14.03,52.79],hint:'Oderbruchkante · Beispielgebiet'},
  {name:'Märkische Schweiz',center:[14.07,52.57],hint:'Wald- und Seenlandschaft · Beispielgebiet'},
  {name:'Grumsin',center:[13.89,53],hint:'Schutzgebiet · nur Beobachtung auf erlaubten Wegen'},
  {name:'Biesenthal',center:[13.70,52.79],hint:'Waldlandschaft · Beispielgebiet'}
];
export const species = ['Totentrompete','Parasol','Krause Glucke','Steinpilz','Marone','Trompetenpfifferling'];
export function validateNote(note){
  return note && typeof note.id==='string' && typeof note.species==='string' && typeof note.text==='string' && note.text.length<=2000 && Array.isArray(note.coordinates) && note.coordinates.length===2 && note.coordinates.every(Number.isFinite) && Math.abs(note.coordinates[0])<=180 && Math.abs(note.coordinates[1])<=90;
}
export function parseNotes(raw){const data=JSON.parse(raw);if(!Array.isArray(data)||data.length>1000||!data.every(validateNote))throw new Error('Ungültige Notizdaten');return data;}
export function geojson(notes){return {type:'FeatureCollection',features:notes.filter(validateNote).map(n=>({type:'Feature',geometry:{type:'Point',coordinates:n.coordinates},properties:{id:n.id,species:n.species,note:n.text,createdAt:n.createdAt,evidence:'user_note_unverified'}}))};}
export const bbkTiles='https://inspire.brandenburg.de/services/bbk_wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=biot_ausb_fl&STYLES=&SRS=EPSG:3857&BBOX={bbox-epsg-3857}&WIDTH=512&HEIGHT=512&FORMAT=image/png&TRANSPARENT=TRUE';
