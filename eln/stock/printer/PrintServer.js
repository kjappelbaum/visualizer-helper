'use strict';

define(['superagent', 'uri/URI'], function (superagent, URI) {
    class PrintServer {
        constructor(url) {
            this.url = new URI(url).normalize().href();
        }

        getDeviceIds() {
            const url = new URI(this.url).segment('devices/id').href();
            return getData(url);
        }

        async print(id, printData) {
            const url = new URI(this.url).segment('send').segmentCoded(id).href();
            return (await superagent
                .post(url)
                .set('Content-Type', typeof printData === 'string' ? 'text/plain' : 'application/octet-stream')
                .send(printData));
        }
    }

    async function getData(url) {
        return (await superagent.get(url)).body;
    }

    return PrintServer;
});