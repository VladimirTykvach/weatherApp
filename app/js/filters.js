(function () {
    'use strict';

    /* Filters */

    angular.module('weatherApp.filters', [])
        .filter('toMmHg', function () {
            return function (value) {
                var ratio = 133.3224;
                return (value * 100 / ratio);
            }
        })
})();