const fs    = require('fs');
const vars  = [...fs.readFileSync(process.argv[2] || 'color-definitions.css', 'utf8')
                    .matchAll(/--mm-(\w+|\w+-\w+)-(\d+|a\d+):\s*(#[0-9a-f]{6});/gi)];
const enc   = new TextEncoder();
let colors  = {};
const bytes = [];

const hex2rgb = hex => hex.match(/\w\w/g).map(x => parseInt(x, 16));
const rgb2hsl = ([r, g, b]) => {
    r /= 255; g /= 255; b /= 255;
    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let d = max - min;
    let h;
    if (d === 0) h = 0;
    else if (max === r) h = (g - b) / d % 6;
    else if (max === g) h = (b - r) / d + 2;
    else if (max === b) h = (r - g) / d + 4;
    let l = (min + max) / 2;
    let s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    return [(h * 60).toFixed(2), s.toFixed(2), l.toFixed(2)];
}

const median = (values)  => {
    if (!values.length) return 0;
    values = [...values].sort((a, b) => a - b);
    const half = Math.floor(values.length / 2);
    return (values.length % 2 ? values[half] : (values[half - 1] + values[half]) / 2);
}



for (const [,family,shade,hex] of vars) {
    colors[family] ??= {};
    colors[family][shade] = rgb2hsl(hex2rgb(hex));
}

for (const family of Object.keys(colors)) {
    // get median h and s
    let hVals = [], sVals = [];
    for (const shade of Object.keys(colors[family])) {
        hVals.push(parseFloat(colors[family][shade][0]));
        sVals.push(parseFloat(colors[family][shade][1]));
    }

    const h8 = Math.round(median(hVals) * 256 / 360) & 0xFF // decode: hue = h8 * 360 / 256
    const s8 = Math.round(median(sVals)*100) // decode: s = s8/100

    bytes.push(
        family.length, // characters in color family name
        ...enc.encode(family), // color family name encoded in utf-8
        Object.keys(colors[family]).length, // the amount of shades in the color family
        h8, // average h (hsl)
        s8 // average s (hsl)
    );

    for (const shade of Object.keys(colors[family])) bytes.push(Math.round(colors[family][shade][2]*100));
}

console.log(bytes);

fs.writeFileSync('colors.bin', Uint8Array.from(bytes), null);