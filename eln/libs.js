"use strict";


define([
    'https://www.lactame.com/lib/openchemlib-extended/1.12.1/openchemlib-extended.js',
    'https://www.lactame.com/lib/spectra-data/HEAD/spectra-data.js',
    'https://www.lactame.com/lib/chemcalc-extended/1.27.0/chemcalc-extended.js',
    'https://www.lactame.com/lib/eln-plugin/0.0.2/eln-plugin.js',
    'https://www.lactame.com/github/cheminfo-js/visualizer-helper/fbbf28649f34169eee925d920d3a5161676d5bb0/rest-on-couch/Roc.js'
], function (OCLE, SD, CCE, elnPlugin, Roc) {

    return {
        OCLE,
        SD,
        CCE,
        elnPlugin,
        Roc
    }
});
