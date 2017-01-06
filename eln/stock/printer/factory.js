'use strict';

import printer from './printer';

module.exports = function(opts, cb) {
    if(typeof opts === 'function') {
        cb = opts;
        opts = {};
    }
    if(typeof IframeBridge !== 'undefined') {
        IframeBridge.onMessage(function(data) {
            if(data.type === 'tab.data') {
                if(data.message.printer && data.message.printer.couchDB) {
                    const options = Object.assign({}, data.message.printer.couchDB, opts);
                    var p = printer(options);
                    cb(p, data.message.printer.couchDB);
                }
            }
        });
    } else {
        cb(null);
    }
};