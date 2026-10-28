import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import {gridDisk,latLngToCell,cellToBoundary,isValidCell} from 'h3-js';
import {H3HexagonLayer} from '@deck.gl/geo-layers';
import {MapLibreOverlay} from '@deck.gl/maplibre';
import {regions,parseNotes,geojson,bbkTiles} from '../public/playground/model.mjs';
const note={id:'test',species:'unverified',text:'<script>alert(1)</script>',coordinates:[14.03,52.79],createdAt:'2026-10-28T12:00:00Z'};
test('field notes round trip as unverified GeoJSON with longitude first',()=>{
 const notes=parseNotes(JSON.stringify([note]));const feature=geojson(notes).features[0];
 assert.deepEqual(feature.geometry.coordinates,[14.03,52.79]);assert.equal(feature.properties.note,note.text);assert.equal(feature.properties.evidence,'user_note_unverified');
});
test('malformed stored notes cannot become coordinates or unbounded payloads',()=>{
 for(const input of ['{}','[null]',JSON.stringify([{...note,coordinates:[181,52]}]),JSON.stringify([{...note,text:'x'.repeat(2001)}])])assert.throws(()=>parseNotes(input));
 assert.equal(geojson([{...note,coordinates:[null,52]}]).features.length,0);
});
test('every playground region produces 61 valid H3 R8 cells consumable by deck.gl',()=>{
 for(const r of regions){const cells=gridDisk(latLngToCell(r.center[1],r.center[0],8),4);assert.equal(cells.length,61);assert(cells.every(isValidCell));assert(cellToBoundary(cells[0],true).every(p=>p[0]>12&&p[0]<15&&p[1]>51&&p[1]<54));const layer=new H3HexagonLayer({id:'test',data:cells,getHexagon:d=>d});assert.equal(layer.props.getHexagon(cells[0]),cells[0]);const overlay=new MapLibreOverlay({interleaved:true,layers:[layer]});assert.equal(typeof overlay.setProps,'function');overlay.finalize();}
});
test('standalone BBK uses projected bbox for WMS 1.1.1',()=>{const url=new URL(bbkTiles.replace('{bbox-epsg-3857}','1,2,3,4'));assert.equal(url.searchParams.get('SRS'),'EPSG:3857');assert.equal(url.searchParams.get('VERSION'),'1.1.1');assert.equal(url.searchParams.get('LAYERS'),'biot_ausb_fl');});
const source=readFileSync(new URL('../app/api/wms/biotope/[z]/[x]/[y]/route.ts',import.meta.url),'utf8');
const output=stripTypeScriptTypes(source);
const {GET}=await import(`data:text/javascript;base64,${Buffer.from(output).toString('base64')}`);
test('existing BBK proxy rejects invalid zoom and preserves PNG/error responses',async()=>{
 const original=globalThis.fetch;let requested;
 try{
 globalThis.fetch=async url=>{requested=new URL(url);return new Response(new Uint8Array([137,80,78,71]),{headers:{'Content-Type':'image/png'}});};
 const call=(z,x,y)=>GET(new Request('https://local.test'),{params:Promise.resolve({z,x,y})});
 assert.equal((await call('2','1','1')).status,400);assert.equal(requested,undefined);
 const response=await call('8','137','83.png');assert.equal(response.status,200);assert.equal(response.headers.get('Content-Type'),'image/png');assert.equal(requested.searchParams.get('SRS'),'EPSG:4326');const bbox=requested.searchParams.get('BBOX').split(',').map(Number);assert(bbox[0]<bbox[2]&&bbox[1]<bbox[3]);assert.deepEqual([...new Uint8Array(await response.arrayBuffer())],[137,80,78,71]);
 globalThis.fetch=async()=>new Response('upstream unavailable',{status:503});assert.equal((await call('8','137','83')).status,502);
 }finally{globalThis.fetch=original;}
});
