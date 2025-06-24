window.md1  = window.md1 || {};
md1.rgb2hex = ([r,g,b]) => '#'+[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('');
md1.shadeId = i => i < 10 ? (i * 100).toString() : 'a' + [100,200,400,700][i-10];
md1.encodedColors = `
A3JlZA7/6+7/zdLvmprlc3PvU1D0QzblOTXTLy/GKCi3HBz/ioD/UlL/F0TVAAAEcGluaw785Oz4u9D0j7HwYpLsQHrpHmPYG2DCGFutFFeIDk//gKv/QIH1AFfFEWIGcHVycGxlDvPl9eG+586T2Lpo
yKtHvJwnsI4kqnsfomobmkoUjOqA/OBA+9UA+aoA/wtkZWVwLXB1cnBsZQ7t5/bRxOmznduVdc1+V8JnOrdeNbFRLahFJ6AxG5KziP98Tf9lH/9iAOoGaW5kaWdvDujq9sXK6Z+o2nmGy1xrwD9RtTlJ
qzA/nyg1kxojfoye/1Nt/j1a/jBP/gRibHVlDuPy/bve+5DK+WS19kKl9SGW8x6I5Rl20hVlwA1HoYKx/0SK/yl5/yli/wpsaWdodC1ibHVlDuH1/rPl/IHU+k/D9ym29gOp9AOb5QKI0QJ3vQFXm4DY
/0DE/wCw/wCR6gRjeWFuDuD3+rLr8oDe6k3Q4SbG2gC81ACswQCXpwCDjwBgZIT//xj//wDl/wC41AR0ZWFsDuDy8bLf24DLxE22rCammgCWiACJewB5awBpXABNQKf/62T/2h3ptgC/pQVncmVlbg7o
9enI5sml1qeBx4Rmu2pMr1BDoEc4jjwufTIbXiC59spp8K4A5nYAyFMLbGlnaHQtZ3JlZW4O8fjp3O3IxeGlrtWBnMxli8NKfLNCaJ84VYsvM2kezP+Qsv9Zdv8DZN0XBGxpbWUO+fvn8PTD5u6c3Od1
1OFXzdw5wMozr7Qrnp0kgncX9P+B7v9Bxv8AruoABnllbGxvdw7//ef/+cT/9Z3/8Xb/7lj/6zv92DX7wC35qCX1fxf//43//wD/6gD/1gAFYW1iZXIO//jh/+yz/+CC/9VP/8oo/8EH/7MA/6AA/48A
/28A/+V//9dA/8QA/6sABm9yYW5nZQ7/8+D/4LL/zID/t03/pyb/mAD7jAD1fADvbADmUQD/0YD/q0D/kQD/bQALZGVlcC1vcmFuZ2UO++nn/8y8/6uR/4pl/3BD/1ci9FEe5koZ2EMVvzYM/56A/25A
/z0A3SwABWJyb3duCu/r6dfMyLyqpKGIf41uY3lVSG1MQV1AN040Lj4nIwRncmF5Cvr6+vX19e7u7uDg4L29vZ6ennV1dWFhYUJCQiEhIQlibHVlLWdyYXkK7O/xz9jcsL7FkKSueJCcYH2LVG56RVpk
N0dPJjI4+A==`.trim();



const payload = Uint8Array.from(atob(md1.encodedColors), c => c.charCodeAt(0));
const view = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
const dec = new TextDecoder();

let checksum = 0;
for (const byte of payload) checksum ^= byte;
if (checksum !== 0) throw new Error('colors are corrupted');

for (let off = 0; off < payload.length-1;) {
    let familyNameLength = view.getUint8(off++);
    let familyName = dec.decode(payload.subarray(off, off+familyNameLength));
    off += familyNameLength;

    let familyShades = view.getUint8(off++);
    console.log(`decoded color family "${familyName}" has ${familyShades} shades`);
    for (let shade = 0; shade < familyShades; shade++) {
        let r = view.getUint8(off++);
        let g = view.getUint8(off++);
        let b = view.getUint8(off++);

        console.log(`\x1b[38;2;${r};${g};${b}m${md1.shadeId(shade)}: ${md1.rgb2hex([r,g,b])}\x1b[0m`);
    }
    // off += familyShades*3;
}