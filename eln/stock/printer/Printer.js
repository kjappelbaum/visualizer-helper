'use strict';

define(['./PrintServer', './printProcessors'], function (PrintServer, processors) {

    class Printer {
        constructor(printer, printServer) {
            this.url = String(printServer.url);
            this.id = String(printer.id);
            this.printServer = new PrintServer(this.url);

        }

        async print(printFormat, data) {
            if(!processors[printFormat.processor]) throw new Error('processor does not exist');
            const printData = await processors[String(printFormat.processor)].call(null, printFormat, data);
            return await this.printServer.print(this.id, printData);
        }
    }

    return Printer;
});