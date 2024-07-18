import  WebR from "webr";

globalThis.webR = new WebR.WebR();
await globalThis.webR.init();
console.log( "webr init");

await globalThis.webR.FS.mkdir('/library')
await globalThis.webR.FS.mount('NODEFS', { root: './packages_ggplot2' }, '/library');
await globalThis.webR.evalR(".libPaths(\"/library\")");
await globalThis.webR.evalR("webr::install(\"ggplot2\", mount = FALSE)");

console.log( "ggplot2 installed");