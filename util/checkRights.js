'use strict';


module.exports = function checkRights(usernames, rights='', defaultValue=false) {
    if (! rights) return defaultValue;
    if (! usernames) return false;
    if (! Array.isArray(usernames)) usernames=[usernames];
    var alloweds=rights.split(/[ ,;\r\n]+/).filter(a => a);

    for (let username of usernames) {
        for (let allowed of alloweds) {
            if (username.endsWith(allowed)) return true;
        }
    }
    return false;
}