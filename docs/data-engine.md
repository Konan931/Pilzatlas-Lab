# Holy Mycelia Data Engine

The data engine progressively replaces coarse model seeds with real, timestamped evidence. Target materializations are COG for rasters, GeoParquet for analytical features and PMTiles for large static vector layers.

Sources: DWD vegetation-specific soil moisture; LfU BBK; LBGR/LGB soil and substrate; LfU protected areas; GBIF occurrences; VBB transit; private field notes.

A missing feature or record is `unknown`, never ecological zero. Do not create fake GeoParquet/PMTiles outputs when upstream data have not actually been downloaded and processed.
