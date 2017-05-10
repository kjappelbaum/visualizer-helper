'use strict';

define([
    'https://www.lactame.com/lib/openchemlib-extended/1.12.1/openchemlib-extended.js',
    'https://www.lactame.com/github/cheminfo-js/visualizer-helper/7f9c4d2c296389ed263a43826bafeba1164d13de/rest-on-couch/Roc.js',
    'https://www.lactame.com/github/cheminfo-js/visualizer-helper/5a751b9e3e56c8727f7115465008feda86f7a8cc/eln/Sample.js'
], function (OCLE, Roc, Sample) {
    return {
        OCLE,
        Roc,
        Sample
    };
});
