"use strict";

define([
    'https://www.lactame.com/lib/openchemlib-extended/1.13.0/openchemlib-extended.js',
    'https://www.lactame.com/lib/spectra-data/2.1.0/spectra-data.js',
    'https://www.lactame.com/lib/chemcalc-extended/1.27.0/chemcalc-extended.js',
    'https://www.lactame.com/lib/eln-plugin/0.0.2/eln-plugin.js',
    '../rest-on-couch/Roc'
], function (OCLE, SD, CCE, elnPlugin, Roc) {
    return {
        OCLE,
        SD,
        CCE,
        elnPlugin,
        Roc
    }
});
