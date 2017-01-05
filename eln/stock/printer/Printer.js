'use strict';

define(['src/util/util', './PrintServer', './printProcessors'], function (Util, PrintServer, processors) {

    class Printer {
        constructor(printer, printServer) {
            this.url = String(printServer.url);
            this.id = String(printer.id);
            this.printServer = new PrintServer(this.url);

        }

        async print(printFormat, data) {
            if(!processors[printFormat.processor]) throw new Error('processor does not exist');
            processData(printFormat, data);
            const printData = await processors[String(printFormat.processor)].call(null, printFormat, data);
            return await this.printServer.print(this.id, printData);
        }
    }

    function processData(printFormat, data) {
        switch(printFormat.type) {
            case 'sample': {
                data.uuidShort = data._id.substring(0,12);
                data.b64Short = Util.hexToBase64(data.uuidShort);
                data.line1 = data.$content.general.description.substring(0,60);
                data.line2 = data.$content.general.description.substring(60,120);
                data.id = data.$id.join(' ');
                break;
            }
            case 'location': {
                break;
            }
            default: {
                throw new Error('Printer could not process data');
            }
        }
    }

    return Printer;
});