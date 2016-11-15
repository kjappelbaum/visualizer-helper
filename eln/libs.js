"use strict";


define([
    'https://www.lactame.com/lib/openchemlib-extended/1.12.1/openchemlib-extended.js',
    'https://www.lactame.com/lib/sdv/0.1.20/sdv.js',
    'https://www.lactame.com/lib/chemcalc-extended/1.27.0/chemcalc-extended.js',
    'https://www.lactame.com/lib/eln-plugin/0.0.2/eln-plugin.js',
    'https://www.lactame.com/github/cheminfo-js/visualizer-helper/934a42d027671e51be62d84ced8db66b391746d1/rest-on-couch/Roc.js'
], function (OCLE, SD, CCE, elnPlugin, Roc) {

    return {
        OCLE,
        SD,
        CCE,
        elnPlugin,
        Roc
    }
});
