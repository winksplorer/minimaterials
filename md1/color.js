window.md1  = window.md1 || {};
md1.roles = ['primary', 'secondary']
md1.rgb2hex = ([r,g,b]) => '#' + [r,g,b].map(x => x.toString(16).padStart(2, '0')).join('');
md1.shadeId = i => i < 10 ? (i * 100).toString() : 'a' + [100,200,400,700][i-10];
md1.getColorClass = (joined, role) => (joined.match(new RegExp(`\\bmm-${role}-([^\\s]+)`)) || [])[1] || null;
md1.shouldUseWhiteText = hex => {
    const [r, g, b] = hex.match(/\w\w/g).map(x => parseInt(x, 16));
    return (r * 299 + g * 587 + b * 114) / 1000 < 128;
};

md1.encodedColors = `
A3JlZA7/6+7/zdLvmprlc3PvU1D0QzblOTXTLy/GKCi3HBz/ioD/UlL/F0TVAAAEcGluaw785Oz4u9D0j7HwYpLsQHrpHmPYG2DCGFutFFeIDk//gKv/QIH1
AFfFEWIGcHVycGxlDvPl9eG+586T2LpoyKtHvJwnsI4kqnsfomobmkoUjOqA/OBA+9UA+aoA/wtkZWVwLXB1cnBsZQ7t5/bRxOmznduVdc1+V8JnOrdeNbFR
LahFJ6AxG5KziP98Tf9lH/9iAOoGaW5kaWdvDujq9sXK6Z+o2nmGy1xrwD9RtTlJqzA/nyg1kxojfoye/1Nt/j1a/jBP/gRibHVlDuPy/bve+5DK+WS19kKl
9SGW8x6I5Rl20hVlwA1HoYKx/0SK/yl5/yli/wpsaWdodC1ibHVlDuH1/rPl/IHU+k/D9ym29gOp9AOb5QKI0QJ3vQFXm4DY/0DE/wCw/wCR6gRjeWFuDuD3
+rLr8oDe6k3Q4SbG2gC81ACswQCXpwCDjwBgZIT//xj//wDl/wC41AR0ZWFsDuDy8bLf24DLxE22rCammgCWiACJewB5awBpXABNQKf/62T/2h3ptgC/pQVn
cmVlbg7o9enI5sml1qeBx4Rmu2pMr1BDoEc4jjwufTIbXiC59spp8K4A5nYAyFMLbGlnaHQtZ3JlZW4O8fjp3O3IxeGlrtWBnMxli8NKfLNCaJ84VYsvM2ke
zP+Qsv9Zdv8DZN0XBGxpbWUO+fvn8PTD5u6c3Od11OFXzdw5wMozr7Qrnp0kgncX9P+B7v9Bxv8AruoABnllbGxvdw7//ef/+cT/9Z3/8Xb/7lj/6zv92DX7
wC35qCX1fxf//43//wD/6gD/1gAFYW1iZXIO//jh/+yz/+CC/9VP/8oo/8EH/7MA/6AA/48A/28A/+V//9dA/8QA/6sABm9yYW5nZQ7/8+D/4LL/zID/t03/
pyb/mAD7jAD1fADvbADmUQD/0YD/q0D/kQD/bQALZGVlcC1vcmFuZ2UO++nn/8y8/6uR/4pl/3BD/1ci9FEe5koZ2EMVvzYM/56A/25A/z0A3SwABWJyb3du
Cu/r6dfMyLyqpKGIf41uY3lVSG1MQV1AN040Lj4nIwRncmF5Cvr6+vX19e7u7uDg4L29vZ6ennV1dWFhYUJCQiEhIQlibHVlLWdyYXkK7O/xz9jcsL7FkKSu
eJCcYH2LVG56RVpkN0dPJjI4`.trim();

md1.colors = md1.colors || {};
md1.updatePalette = function(role) {
    // check for valid role, and get the requested family
    if (!md1.roles.includes(role)) throw new Error(`minimaterials: cannot update ${role} colors, as the role does not exist`);
    let family = md1.getColorClass(document.body.className, role);

    // check if the family exists
    if (!(family in md1.colors)) throw new Error(`minimaterials: cannot update ${role} colors, as colorfamily '${family}' does not exist`);

    // set css vars accordingly
    for (const shade of Object.keys(md1.colors[family])) {
        document.body.style.setProperty(`--mm-${role}-${shade}`, md1.colors[family][shade]);
        document.body.style.setProperty(`--mm-on-${role}-${shade}`, md1.shouldUseWhiteText(md1.colors[family][shade]) ? '#fff' : "#000");
    }
}

md1.bodyObserver = new MutationObserver(muts => {
    for (const mut of muts) {
        // check if we need to update colors
        for (const role of md1.roles) {
            if (md1.getColorClass(mut.oldValue, role) !== md1.getColorClass(mut.target.className, role))
                md1.updatePalette(role);
        }
    }
});

(function(){
    const payload = Uint8Array.from(atob(md1.encodedColors), c => c.charCodeAt(0));
    const view = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);

    // initial load - "cache" all color data in object notation
    for (let off = 0; off < payload.length-1;) {
        // get colorfamily name (and it's length)
        const familyNameLength = view.getUint8(off++);
        const familyName = (new TextDecoder()).decode(payload.subarray(off, off+familyNameLength));
        off += familyNameLength;

        md1.colors[familyName] = md1.colors[familyName] || {};

        // go through shades and repack them into string hex (they were encoded as literal hex)
        for (let shade = 0, familyShades = view.getUint8(off++); shade < familyShades; shade++)
            md1.colors[familyName][md1.shadeId(shade)] = md1.rgb2hex([
                view.getUint8(off++), // r
                view.getUint8(off++), // g
                view.getUint8(off++)  // b
            ]);
    }

    // set up observer
    md1.bodyObserver.observe(document.body, {
        attributes: true,
        attributeOldValue: true,
        attributeFilter: ['class']
    });

    // fucking AWFUL hack: disable transitions before setting initial palettes
    const style = document.createElement('style');
    style.textContent = `* { transition: none !important; }`;
    document.head.appendChild(style);

    // load inital palettes
    for (const role of md1.roles) md1.updatePalette(role);
    
    // re-enable transitions
    requestAnimationFrame(() => style.remove());
})()