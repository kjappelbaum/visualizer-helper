"use strict";


define([
    'https://www.lactame.com/lib/openchemlib-extended/1.11.0/openchemlib-extended.js',
    'https://www.lactame.com/lib/sdv/0.1.12/sdv.js',
    'https://www.lactame.com/lib/chemcalc-extended/1.27.0/chemcalc-extended.js',
    'https://www.lactame.com/lib/eln-plugin/0.0.2/eln-plugin.js',
    'https://www.lactame.com/github/cheminfo-js/visualizer-helper/7f9c4d2c296389ed263a43826bafeba1164d13de/rest-on-couch/Roc.js'
], function (OCLE, SD, CCE, elnPlugin, Roc) {

    return {
        OCLE,
        SD,
        CCE,
        elnPlugin,
        Roc
    }
});
