function toHTML(peaks, options={}) {
    var acsString='IR (cm<sup>-1</sup>): ';
    acsString += peaks.map(a => Math.round(a.wavelength) + (a.kind ? '<i>' + a.kind+'</i>':'')).join(', ');
    return acsString;
}

module.exports=toHTML;
