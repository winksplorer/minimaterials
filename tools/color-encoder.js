const fs    = require('fs');
const vars  = [...fs.readFileSync(process.argv[2] || 'color-definitions.css', 'utf8')
                    .matchAll(/--mm-(\w+|\w+-\w+)-(\d+|a\d+):\s*(#[0-9a-f]{6});/gi)];
const enc   = new TextEncoder();
let colors  = {};
const bytes = [];

const hex2rgb = hex => hex.match(/\w\w/g).map(x => parseInt(x, 16));

for (const [,family,shade,hex] of vars) {
    colors[family] ??= {};
    colors[family][shade] = hex2rgb(hex);
}

for (const family of Object.keys(colors)) {
    bytes.push(
        family.length, // characters in color family name
        ...enc.encode(family), // color family name encoded in utf-8
        Object.keys(colors[family]).length // the amount of shades in the color family
    );

    for (const shade of Object.keys(colors[family])) {
        for (const channel of colors[family][shade]) bytes.push(channel);
    }
}

let checksum = 0;
for (const byte of bytes) checksum ^= byte;
bytes.push(checksum);

fs.writeFileSync('colors.bin', Uint8Array.from(bytes), null);