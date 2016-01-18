define(['src/util/api'], function (API) {

    function track(cookieName, defaultValue) {
        if (API.getData(cookieName)) return;
        var options = [];
        try {
            options = JSON.parse(window.localStorage.getItem(cookieName)) || [];
            if (defaultValue) options = $.extend(true, defaultValue, options);
        } catch (e) {
            console.error(e);
        }
        ;
        API.createData(cookieName, options);

        
        var data = require('src/util/versioning').getData();
        data.onChange(function (evt) {
            // If any part of the object changes, we resave the entire object
            if (evt.jpath[0] == cookieName) {
                var target = API.getData(cookieName);
                localStorage.setItem(cookieName, JSON.stringify(target));
            }
        });
    }

    return track;
});
