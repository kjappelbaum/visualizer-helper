'use strict';

import Roc from './Roc';

module.exports = function(opts) {
    const factory = new EventEmitter();
    if(IframeBridge) {
        IframeBridge.onMessage(function(data) {
            if(data.type === 'tab.data') {
                if(data.message.couchDB) {
                    const options = Object.assign({}, data.message.couchDB, opts);
                    var roc = new Roc(options);
                    factory.emit('roc', roc);
                }
            }
        });
        IframeBridge.ready();
        return factory;
    }
};