'use strict';

define([
    'src/util/api',
    'browserified/twig/twig',
    'canvg',
    'https://www.lactame.com/lib/image-js/0.9.1/image.js',
    'src/util/typerenderer',
    'jquery'
], function (API, twig, canvg, IJS, typerenderer, $) {
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// Use a lookup table to find the index.
    let lookup = new Uint8Array(256);
    for (let i = 0; i < chars.length; i++) {
        lookup[chars.charCodeAt(i)] = i;
    }
    return {
        twig: async function (printFormat, data) {
            if (!printFormat.twig) throw new Error('twig processor expect twig property in format');
            var template = twig.twig({
                data: printFormat.twig
            });
            return Promise.resolve(template.render(data));
        },

        molecule: async function (printFormat, data) {
            var molfile = data.molfile;
            const $el = $('<div>').css({width: 190, height: 190}).appendTo($('body'));
            // const $el = $('<div>');
            await typerenderer.render($el, molfile, {forceType: 'mol2d'});

            const $svg = $el.find('svg');
            let svg = $svg[0];
            if (!svg) throw new Error('Could not generate svg');
            //
            const canvas = document.createElement('canvas');
            const width = svg.width.baseVal.value | 0;
            const height = svg.height.baseVal.value | 0;
            const svgString = $svg.clone().wrap('<div>').parent().html().replace(/rgb\(\d+,\d+,\d+\)/g, 'rgb(0,0,0)');
            //
            canvg(canvas, svgString, {
                scaleWidth: width,
                scaleHeight: height
            });

            var pngUrl = canvas.toDataURL('png');
            $el.remove();
            API.createData('png', pngUrl);

            var image = await IJS.load(pngUrl);
            var mask = image.grey({keepAlpha: true}).mask();
            const bmp = mask.toBase64('bmp');
            const encoder = new TextEncoder();
            const bmpArr = decode(bmp);
            const part1 = encoder.encode(`! 0 90 193 1\nVARIABLE DARKNESS 500\nPITCH 200\nWIDTH 240\nGRAPHIC BMP 1 1\n`);
            const part2 = encoder.encode('!+ 0 100 200 1\nEND');
            const toSend = concatenate(Uint8Array, part1, bmpArr, part2);
            return toSend;
        }
    };

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
        let bufferLength = base64.length * 0.75,
            len = base64.length, i, p = 0,
            encoded1, encoded2, encoded3, encoded4;

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
});