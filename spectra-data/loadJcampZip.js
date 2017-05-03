'use strict';

import API from 'src/util/api';

module.exports = async function loadZips(zipURLs, options = {}) {
    const JSZip = await API.require('jszip');
    const superagent = await API.require('superagent');
    const SD = await API.require('https://www.lactame.com/lib/spectra-data/3.0.7/spectra-data.min.js');
    var jszip = new JSZip();
    var spectraDataSet = [];
    for (let zipURL of zipURLs) {
        let zipFiles = await superagent.get(zipURL)
            .withCredentials()
            .responseType('blob');
        var zip = await jszip.loadAsync(zipFiles.body);
        let filesToProcess = Object.keys(zip.files).filter( filename => filename.match(/jdx$/));
        for (const filename of filesToProcess) {
            let jcamp = await zip.files[filename].async('string');
            let spectrum = SD.NMR.fromJcamp(jcamp, {});
            spectrum.sd.filename = filename.replace(/.jdx$/,'');
            if (options.filter) options.filter(spectrum);
            spectraDataSet.push(spectrum);
        }
    }
    return spectraDataSet;
}