define([
    'src/main/datas',
    'src/util/api',
    'src/util/ui',
    'browserified/twig/twig',
    'canvg',
    'https://www.lactame.com/lib/image-js/0.9.1/image.js',
    'src/util/typerenderer',
    'jquery',
    'https://www.lactame.com/lib/openchemlib-extended/2.2.0/openchemlib-extended.js'
], function (Datas, API, UI, twig, canvg, IJS, typerenderer, $, OCL) {
    const DataObject = Datas.DataObject;
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// Use a lookup table to find the index.
    let lookup = new Uint8Array(256);
    for (let i = 0; i < chars.length; i++) {
        lookup[chars.charCodeAt(i)] = i;
    }
    return {
        twig: async function (printFormat, data) {
            if (printFormat.customFields && printFormat.customFields.length) {
                const res = await fillFields(printFormat.customFields, data);
                if(res === null) return;
            }
            if (!printFormat.twig) throw new Error('twig processor expect twig property in format');
            var template = twig.twig({
                data: DataObject.resurrect(printFormat.twig)
            });

            //Render molfile if exists
            var text = template.render(DataObject.resurrect(data));
            if (data.molfile && printFormat.molfileOptions && printFormat.molfileOptions.width) {
                const encoder = new TextEncoder();
                text = text.replace(/END\s*$/, '');
                text += `GRAPHIC BMP ${printFormat.molfileOptions.x || 0} ${printFormat.molfileOptions.y || 0}\n`;
                const mol = await getMolBmp(data.molfile, printFormat.molfileOptions);
                const end = '\n!+ 0 100 200 1\nEND\n';
                return Promise.resolve(concatenate(Uint8Array, encoder.encode(text), mol, encoder.encode(end)));

            } else {
                return Promise.resolve(text);
            }
        },

        molecule: async function (printFormat, data) {
            const mol = await getMolBmp(data.molfile);
            const encoder = new TextEncoder();
            const part1 = encoder.encode('! 0 90 193 1\nVARIABLE DARKNESS 500\nPITCH 200\nWIDTH 240\nGRAPHIC BMP 100 93\n');
            const part2 = encoder.encode('!+ 0 100 200 1\nEND\n');
            const toSend = concatenate(Uint8Array, part1, mol, part2);
            return toSend;
        }
    };

    async function getMolBmp(molfile, options) {
        const defaultMolOptions = {
            width: 100
        };
        options = Object.assign({}, defaultMolOptions, options);
        if (!options.height) options.height = options.width;
        const mol = OCL.Molecule.fromMolfile(molfile);
        const svgString = mol.toSVG(options.width, options.height, '', {
            noImplicitAtomLabelColors: true,
            suppressChiralText: true,
            bold: true,
            strokeWidth: 2
        });
        const canvas = document.createElement('canvas');
        canvg(canvas, svgString);

        var pngUrl = canvas.toDataURL('png');

        var image = await IJS.load(pngUrl);
        var mask = image.grey({keepAlpha: true}).mask();
        const bmp = mask.toBase64('bmp');
        return decode(bmp);
    }

    function concatenate(resultConstructor, ...arrays) {
        let totalLength = 0;
        for (let arr of arrays) {
            totalLength += arr.length;
        }
        let result = new resultConstructor(totalLength);
        let offset = 0;
        for (let arr of arrays) {
            result.set(arr, offset);
            offset += arr.length;
        }
        return result;
    }

    function decode(base64) {
        let bufferLength = base64.length * 0.75;
        let len = base64.length;
        let i;
        let p = 0;
        let encoded1, encoded2, encoded3, encoded4;

        if (base64[base64.length - 1] === '=') {
            bufferLength--;
            if (base64[base64.length - 2] === '=') {
                bufferLength--;
            }
        }

        const bytes = new Uint8Array(bufferLength);

        for (i = 0; i < len; i += 4) {
            encoded1 = lookup[base64.charCodeAt(i)];
            encoded2 = lookup[base64.charCodeAt(i + 1)];
            encoded3 = lookup[base64.charCodeAt(i + 2)];
            encoded4 = lookup[base64.charCodeAt(i + 3)];

            bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
            bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
            bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
        }

        return bytes;
    }

    function fillFields(fields, data) {
        return UI.form(`
            <div>
                <form>
                <table>
                    ${fields.map(renderField)}
                </table>
                <input type="submit"/>
                </form>
            </div>
    `, data);
    }

    function renderField(field) {
        return `
            <tr>
                <td>${field.label}</td>
                <td>
                    <input type="text" name="${field.name}" />   
                </td>
            </tr>
        `;
    }
});
