
import ui from 'src/util/ui';
import API from 'src/util/api';

module.exports = {
    async setup(printer, types) {
        API.cache('printer', printer);
        let varFormats = types.map(() => []);
        const printers = await printer.getPrinters();
        for (let i = 0; i < printers.length; i++) {
            for (let j = 0; j < types.length; j++) {
                const sFormats = (await printer.getFormats(printers[i], types[j])).map(f => ({
                    printer: printers[i],
                    format: f
                }));
                varFormats[j] = varFormats[j].concat(sFormats);
            }
        }


        for (let j = 0; j < types.length; j++) {
            API.createData(types[j] + 'Formats', varFormats[j]);
        }
    },

    async askPrintEntry(entry, type) {
        const info = await module.exports.askFormat(type);
        if (info) {
            return await module.exports.printEntry(entry, info);
        }
    },

    async printEntry(entry, info) {
        const printer = API.cache('printer');
        if (!printer) {
            throw new Error('Printer not setup');
        }

        if (typeof info === 'string') {
            info = info.split(';');
            if (info.length < 2) {
                throw new Error('Print entry: bad arguments');
            } else {
                info = {
                    printer: info[0],
                    format: info[1]
                };
            }
        } else if (typeof info !== 'object') {
            throw new Error('Print entry: bad arguments');
        }

        if (!info.printer || !info.format) {
            throw new Error('Print entry: bad arguments');
        }

        if (info.printer === 'none') return;

        await printer.print(info.printer, info.format, entry);
    },
    async askFormat(type) {
        var f = {};
        const formats = API.getData(type + 'Formats').resurrect();
        if (!formats) throw new Error('No printer formats available');
        await ui.form(`
            <div>
                <form>
                <table>
                    <tr>
                        <td>Printer</td>
                        <td>
                            <select name="printer">
                                {% for format in formats %}
                                    <option value="{{ format.printer._id }};{{ format.format._id }}">{{ format.printer["$content"].name }} - {{ format.format["$content"].name }}</option>
                                {% endfor %}
                             </select>
                        </td>
                    </tr>
                </table>
                <input type="submit"/>
                </form>
            </div>
    `, f, {twig: {formats}});
        if (!f.printer) return f.printer;
        return String(f.printer);
    }
};
