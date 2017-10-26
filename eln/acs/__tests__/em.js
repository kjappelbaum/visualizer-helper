var toHTML = require('../em');


var entry = {
    experiment: 'Accurate mass',
    accurate: {
        mf: 'C22H39N5O4S',
        modification: 'H+',
        value: '470.28215142009054'
    },
    injection: 'direct',
    ionisation: 'ESI',
    mode: 'positive',
    analyzer: 'QTOF',
    instrument: 'Waters XEVO G2-S QTOF'
};


describe('ACS string for EM', () => {
    it('default options', () => {
        var html = toHTML(entry);
        console.log(html);
        expect(html).toBe('IR (cm<sup>-1</sup>): 1000<i>w</i>, 2000<i>m</i>, 3000<i>S</i>');
    });
});
