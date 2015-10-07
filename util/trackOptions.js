define(['src/util/api'], function (API) {

    function init(cookieName) {
        var options = {};
        try {
            options = JSON.parse(window.localStorage.getItem(cookieName)) || {};
        } catch (e) {
            console.log(e);
        }
        ;
        API.createData(cookieName, options);

        var data = require('src/util/versioning').getData();
        data.onChange(function (evt) {
            if (evt.jpath.length == 1 && evt.jpath[0] == cookieName) {
                localStorage.setItem(cookieName, JSON.stringify(evt.target));
            }
        });
    }

    return init;
});

