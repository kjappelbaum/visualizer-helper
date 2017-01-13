'use strict';

define(['superagent', 'uri/URI'], function (superagent, URI) {
    class PrintServer {
        constructor(server, opts) {
            this.opts = Object.assign({}, opts);
            this.macAddress = String(server.macAddress);
            this.url = new URI(String(server.url)).normalize().href();
        }

        getDeviceIds() {
            const url = new URI(this.url).segment('devices/id').href();
            return getData(url);
        }

        async print(id, printData) {
            if(this.opts.proxy) {
                var url = new URI(this.opts.proxy).addSearch('mac', this.macAddress);
            } else {
                url = new URI(this.url);
            }

            url = url.segment('send').segmentCoded(id).normalize().href();

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