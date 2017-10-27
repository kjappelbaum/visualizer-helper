
// returns a Mysql formatted date, very practical to get a string with dthe date
define([], function () {

    function twoDigits(d) {
        if (0 <= d && d < 10) return '0' + d.toString();
        if (-10 < d && d < 0) return '-0' + (-1 * d).toString();
        return d.toString();
    }

    function create(date) {
        if (!date) date = new Date();
        return date.getUTCFullYear() + '-' + twoDigits(1 + date.getUTCMonth()) + '-' + twoDigits(date.getUTCDate()) + ' ' + twoDigits(date.getUTCHours()) + ':' + twoDigits(date.getUTCMinutes()) + ':' + twoDigits(date.getUTCSeconds());
    }

    return create;
});
