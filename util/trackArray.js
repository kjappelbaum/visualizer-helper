'use strict';

define(['src/util/api', 'lodash'], function (API, _) {

    function track(localName, defaultValue) {
        if (API.getData(localName)) return;
        var localValue = [];
        try {
            localValue = JSON.parse(window.localStorage.getItem(localName)) || [];
            if(!Array.isArray(localValue)) throw new Error('TrackArray expected an array in local storage');
            localValue = localValue.concat(defaultValue);
            localValue = _.uniqWith(localValue, _.isEqual);
        } catch (e) {
            console.error(e);
        }

        API.createData(localName, localValue).then(function(data) {
            data.onChange(function() {
                localStorage.setItem(localName, JSON.stringify(data));
            });
        });
    }

    return track;
});
