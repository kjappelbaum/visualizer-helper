'use strict';

define(['superagent', 'uri/URI'], function (superagent, URI) {
    class Printer {
        constructor(url) {
            this.url = new URI(url).normalize().href();
        }

        async print(format, data) {
            const url = new URI(this.url).segment('print').href();
            return await superagent
                .post(url)
                .send({
                    format, data
                });
        }

        async ports() {
            const url = new URI(this.url).segment('ports').href();
            return await superagent.get(url);
        }

        async deleteFormat(format) {
            const url = new URI(this.url).segment('db/format').segmentCoded(format).href();
            return await superagent.del(url);
        }

        async saveFormat(key, value) {
            const url = new URI(this.url).segment('db/format').href();
            return await superagent.put(url).send({key, value})
        }

        async getFormat(format) {
            const url = new URI(this.url).segment('db/format').segmentCoded(format).href();
            return await superagent.get(url);
        }

        async getAllFormats() {
            const url = new URI(this.url).segment('db/format').href();
            return await superagent.get(url);
        }
    }

    return Printer;
});

