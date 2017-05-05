'use strict';

import API from 'src/util/api';

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

function onDataFocus(dataId, tabId) {
    return function(data) {
        console.log('data focus', data);
        if(data.type === 'tab.focus') {
            console.log('focus, send data');
            const data = API.cache(dataId);
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
    sendDataOnFocus(dataId, tabId) {
        IframeBridge.onMessage(onDataFocus(dataId, tabId));
    },
    sendVariableOnChange(data, tabId) {
        data.onChange(event => {
            console.log('data change');
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
        console.log('open tab');
        IframeBridge.postMessage('tab.open', data)
    },
    // register callback to handle message, without info about the sender
    onMessage(cb) {
        IframeBridge.onMessage(function(data) {
            if(data.type === 'tab.message') {
                console.log('ok');
                cb(data.message);
            }
        });
    }
};