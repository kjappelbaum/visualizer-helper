'use strict';

import API from 'src/util/api';
import Roc from '../rest-on-couch/Roc';

if(typeof IframeBridge === 'undefined') {
    throw new Error('IframeBridge not loaded');
}


function onRocInit(data) {
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

function onDataFocus(dataId, tabId, type) {
    return function(data) {
        if(data.type === 'tab.focus') {
            let data;
            if(type === 'data') data = API.getData(dataId);
            else if(type === 'cache') data = API.cache(dataId);
            IframeBridge.postMessage('tab.message', {
                id: tabId,
                message: data
            });
        }
    }
}


module.exports = {
    rocInit() {
        IframeBridge.onMessage(onRocInit);
    },
    sendCacheOnFocus(dataId, tabId) {
        IframeBridge.onMessage(onDataFocus(dataId, tabId, 'cache'));
    },
    sendDataOnFocus(dataId, tabId) {
        IframeBridge.onMessage(onDataFocus(dataId, tabId, 'data'))
    },
    sendVariableOnChange(data, tabId) {
        data.onChange(event => {
            IframeBridge.postMessage('tab.message', {
                id: tabId,
                message: {
                    event: event,
                    data: data
                }
            });
        });
    },
    ready() {
        IframeBridge.ready();
    },
    openTab(data) {
        IframeBridge.postMessage('tab.open', data)
    },
    // register callback to handle message of type 'message', without info about the sender
    onMessage(cb) {
        IframeBridge.onMessage(function(data) {
            if(data.type === 'tab.message') {
                cb(data.message);
            }
        });
    },
    // Send a message of type 'message'
    sendMessage(tabId, data) {
        IframeBridge.postMessage('tab.message', {
            id: tabId,
            message: data
        });
    }
};