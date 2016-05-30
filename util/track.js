/*
In the general preferences you should put something like:
require(['Track'], function(Track) {
    Track('massOptions');
})
*/

define(['src/util/api', 'src/util/versioning'], function (API, Versioning) {
    function track(cookieName, defaultValue) {
        if (API.getData(cookieName)) return;
        var options = {};
        try {
            options = JSON.parse(window.localStorage.getItem(cookieName)) || {};
            if (defaultValue) options = $.extend(true, defaultValue, options);
        } catch (e) {
            console.log(e);
        }

        return API.createData(cookieName, options).then(function(result) {
            var data = Versioning.getData();
            data.onChange(function (evt) {
                if (evt.jpath.length == 1 && evt.jpath[0] == cookieName) {
                    localStorage.setItem(cookieName, JSON.stringify(evt.target));
                }
            });
        });
    }

    return track;
});

