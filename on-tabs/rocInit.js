'use strict';

import Roc from '../rest-on-couch/Roc';
import API from 'src/util/api';

if ((typeof IframeBridge) !== 'undefined') {
    IframeBridge.onMessage(onMessage);
    IframeBridge.ready();
} else {
    throw new Error('IframeBridge is not defined');
}

function onMessage(data) {
    if (data.type === 'tab.data') {
        var couchDB = data.message.couchDB;
        if(!couchDB) {
            console.error('couchDB configuration was not passed');
            return;
        }
        var uuid = data.message.uuid;
        API.cache('couchDB', couchDB);
        API.cache('uuid', uuid);
        var roc = new Roc(couchDB);
        API.cache('roc', roc);
        API.doAction('rocInit');
    }
}

