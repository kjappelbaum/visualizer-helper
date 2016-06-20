/*
In the general preferences you should put something like:
require(['Track'], function(Track) {
    Track('massOptions');
})
*/

define(['src/util/api', 'src/util/versioning'], function (API, Versioning) {
    function track(cookieName, defaultValue, options) {
        options = options || {};
        var varName = options.varName || cookieName;
        if (API.getData(varName)) return Promise.resolve();
        var data = {};
        try {
            data = JSON.parse(window.localStorage.getItem(cookieName)) || {};
            if (defaultValue) data = $.extend(true, defaultValue, data);
        } catch (e) {
            return Promise.reject(e);
        }

        return API.createData(varName, data).then(function(result) {
            var mainData = Versioning.getData();
            mainData.onChange(function (evt) {
                if (evt.jpath.length == 1 && evt.jpath[0] == varName) {
                    localStorage.setItem(cookieName, JSON.stringify(evt.target));
                }
            });
            return result;
        });
    }

    return track;
});

