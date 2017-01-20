'use strict';

define(['superagent', 'uri/URI'], function (superagent, URI) {
    class PrintServer {
        constructor(server, opts) {
            opts = opts || {};
            if(opts.proxy) {
                this.url = new URI(opts.proxy).addSearch('mac', String(server.macAddress)).normalize().href();
            } else {
                this.url = new URI(String(server.url)).normalize().href();
            }

            console.log(this.url);
        }

        getDeviceIds() {
            const url = new URI(this.url).segment('devices/id').href();
            return getData(url);
        }

        async print(id, printData) {
            const url = new URI(this.url).segment('send').segmentCoded(id).normalize().href();

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