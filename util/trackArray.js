define(['src/util/api', 'lodash'], function (API, _) {

    function track(cookieName, defaultValue) {
        if (API.getData(cookieName)) return;
        var options = [];
        try {
            options = JSON.parse(window.localStorage.getItem(cookieName)) || [];
            if(!Array.isArray(options)) throw new Error('TrackArray expected an array in local storage');
            options = options.concat(defaultValue);
            options = _.uniqWith(options, _.isEqual);
        } catch (e) {
            console.error(e);
        }

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
