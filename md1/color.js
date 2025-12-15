window.md1  = window.md1 || {};
md1.roles = ['primary', 'secondary'];
md1.shadeId = i => i < 10 ? (i * 100).toString() : 'a' + [100,200,400,700][i-10];
md1.getColorClass = (joined, role) => (joined.match(new RegExp(`\\bmm-${role}-([^\\s]+)`)) || [])[1] || null;
md1.cssHsl = (h, s, l) => `hsl(${h}, ${s}%, ${l}%)`;

md1.encodedColors = `
    A3JlZA4AV2BaTUM/OjczLylLQjcqBHBpbmsO8VJeVUxCOzQwKyYdSz8wKgZwdXJwbGUOz0NdU0c8MyooJiMfSz4xMgtkZWVwLXB1cnBsZQ66OF5USj83Ly0qJyJNQTgu
    BmluZGlnbw6kNF5USkA4MC0pJR5NQj47BGJsdWUOlVpeVk1EPTYzLioiSz86OgpsaWdodC1ibHVlDo1iXlVKQDgwLSklH0s/Mi4EY3lhbg6FZF1SRzsyKiYhHBRMNzIq
    BHRlYWwOe2RbT0EzKB0bGBUPU0YzJQVncmVlbg5XKl5USkA5MS0nIhhVRC0nC2xpZ2h0LWdyZWVuDj8zXlZMQzw1MCokGk5DMzAEbGltZQ4vRl9WTUQ9NjIsJh5LPzIu
    BnllbGxvdw4mZF9YUUlDPjw6ODVOMjIyBWFtYmVyDiBkXlVLQTozMjIyMks/MjIGb3JhbmdlDhlkXlVLQTkyMTAvLUs/MjILZGVlcC1vcmFuZ2UOCmRfV05GPzk2Mi4o
    Sz8yKwVicm93bgoLFl1RRTgvJiIdGBMEZ3JheQoAAGJgXVhKPi4mGg0JYmx1ZS1ncmF5Co4RXlRJPjYuKCEaEg==`.trim();

md1.colors = md1.colors || {};
md1.updatePalette = (role) => {
    // check for valid role, and get the requested family
    if (!md1.roles.includes(role)) throw new Error(`mm-md1: ${role}: role does not exist`);
    let family = md1.getColorClass(document.body.className, role);

    // check if the family exists
    if (!(family in md1.colors)) throw new Error(`mm-md1: ${role}: ${family}: color family does not exist`);

    // set css vars accordingly
    Object.keys(md1.colors[family]).forEach(shade => {
        document.body.style.setProperty(`--mm-${role}-${shade}`, md1.colors[family][shade][0]);
        document.body.style.setProperty(`--mm-on-${role}-${shade}`, md1.colors[family][shade][1] ? '#fff' : "#000");
    });
}

md1.bodyObserver = new MutationObserver(muts => {
    muts.forEach(mut => 
        md1.roles.forEach(role => 
            md1.getColorClass(mut.oldValue, role) !== md1.getColorClass(mut.target.className, role) 
                && md1.updatePalette(role)
        )
    );
});

(() => {
    const payload = Uint8Array.from(atob(md1.encodedColors), c => c.charCodeAt(0));
    const view = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
    const dec = new TextDecoder();

    // initial load - "cache" all color data in object notation
    for (let off = 0; off < payload.length-1;) {
        const familyNameLength = view.getUint8(off++), // family name length [number]
            familyName = dec.decode(payload.subarray(off, off+=familyNameLength)), // family name [string]
            familyShades = view.getUint8(off++), // amount of shades in family [number]
            h = view.getUint8(off++) * 360 / 256, // median H [number]
            s = view.getUint8(off++); // median S [number]

        md1.colors[familyName] = md1.colors[familyName] || {};
        
        for (let shade = 0; shade < familyShades; shade++) {
            // store css color string alongside "should use white text"
            const l = view.getUint8(off++);
            md1.colors[familyName][md1.shadeId(shade)] = [md1.cssHsl(h,s,l), (l + 0.25*s * Math.cos((h-120)*Math.PI / 180)) < 50];
        }
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
    md1.roles.forEach(role => md1.updatePalette(role));
    
    // re-enable transitions
    requestAnimationFrame(() => style.remove());
})()