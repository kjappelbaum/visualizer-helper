'use strict';

define(['superagent', 'uri/URI'], function (superagent, URI) {
    class Printer {
        constructor(url) {
            this.url = new URI(url).normalize().href();
        }

        async print(format, data) {
            const url = new URI(this.url).segment('print').href();
            return (await superagent
                .post(url)
                .send({
                    format, data
                })).body;
        }

        async ports() {
            const url = new URI(this.url).segment('ports').href();
            return await getData(url);
        }

        async deleteFormat(format) {
            const url = new URI(this.url).segment('db/format').segmentCoded(format).href();
            return (await superagent.del(url)).body;
        }

        async saveFormat(key, value) {
            const url = new URI(this.url).segment('db/format').href();
            return (await superagent.put(url).send({key, value})).body;
        }

        async getFormat(format) {
            const url = new URI(this.url).segment('db/format').segmentCoded(format).href();
            return await getData(url);
        }

        async getAllFormats() {
            return getFormats();
        }

        async getFormats(kind) {
            if(!kind) {
                const url = new URI(this.url).segment('db/format').href();
                return (await superagent.get(url)).body;
            } else {
                const url = new URI(this.url).segment('db/format/kind').segmentCoded(kind).href();
                return await getData(url);
            }
        }

        async getFormatNames(kind) {
            if(kind) {
                const url = new URI(this.url).segment('db/format/names').href();
                return await getData(url);
            } else {
                const url = new URI(this.url).segment('db/format/kind').segmentCoded(kind).segment('names').href();
                return await getData(url);
            }
        }
    }

    async function getData(url) {
        return (await superagent.get(url)).body;
    }


    return Printer;
});
