import type { Shelter, WebR } from 'webr';


// Create a `/data` directory for IDBFS and mount it
await webR.FS.mkdir('/data');
await webR.FS.mount('IDBFS', {}, '/data');

// Populate the `/data` directory from IndexedDB. The first time, this will be empty
await webR.FS.syncfs(true);

// Install R packages to `/data/library`
// NOTE: The `mount = FALSE` argument is very important here
await webR.evalRVoid("webr::install('dplyr', lib = '/data/library', mount = FALSE)")

// Synchronise to write the packages' file data to IndexedDB
await webR.FS.syncfs(false);