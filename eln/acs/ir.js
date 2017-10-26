function toHTML(value) {
    var acsString = '';
    if (value && value.peak) {
        acsString += 'IR (cm<sup>-1</sup>): ';
        acsString += value.peak.map(a => Math.round(a.wavelength) + (a.kind ? '<i>' + a.kind + '</i>' : '')).join(', ');
    }
    return acsString;
}

module.exports = toHTML;
