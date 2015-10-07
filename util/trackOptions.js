function init(cookieName) {
    var options = {};
    try {
        options = JSON.parse(window.localStorage.getItem(cookieName)) || {};
    } catch(e) {
        console.log(e);
    };
    API.createData('options', options);

    var data = require('src/util/versioning').getData();
    data.onChange(function (evt) {
        if(evt.jpath.length==1 && evt.jpath[0]=='options') {
            localStorage.setItem(cookieName, JSON.stringify(evt.target));
        }
    });
};

exports.init = init;
