'use strict';

define(['src/util/typerenderer'], function (typerenderer) {
    const status = {
        100: 'Order to confirm',
        200: 'Product to order',
        300: 'Product ordered',
        400: 'Product arrived',
        500: 'Product released',
        600: 'Product to revalidate',
        700: 'Product refused',
        800: 'Product expired',
        900: 'Product lost',
        1000: 'Product empty'
    };

    // register type renderer
    function toscreen($element, value, root, options) {
        $element.html(StockHelper.getStatusDescription(+value));
    }

    typerenderer.addType({toscreen});

    const StockHelper = {
        getStatusDescription(code) {
            if(!status[code]) return 'Status does not exist';
            return status[code];
        }
    };

    return StockHelper;
});