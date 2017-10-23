var toHTML=require('../ir').toHTML;


var peaks = [
    {"wavelength":1000,"transmittance":10,"kind":"w"},
    {"wavelength":2000,"transmittance":50,"kind":"m"},
    {"wavelength":3000,"transmittance":100,"kind":"S"}
];


describe('ACS string for IR spectrum', () => {
    it('default options', () => {
        var html=toHTML(peaks);
        expect(html).toBe('IR (cm<sup>-1</sup>): 1000<i>w</i>, 2000<i>m</i>, 3000<i>S</i>');
    });
});
