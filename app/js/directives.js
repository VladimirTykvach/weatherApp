(function () {
    'use strict';

    /* Directives */

    angular.module('weatherApp.directives', [])

        .directive('appNameWithVersion', ['APP_CONFIG', function (APP_CONFIG) {
            return function (scope, elm, attrs) {
                elm.text(APP_CONFIG.appName + ' ' + APP_CONFIG.appVersion);
            };
        }])

        .directive('weatherPanel', [function () {
            return {
                restrict: 'EA',

                scope: {
                    dailyForecast: '=dailyData',
                    forecast: '=weatherPanel'
                },

                templateUrl: 'templates/dailyPanel.html',

                link: function (scope, element, attrs) {

                    scope.getIconImageUrl = function (iconName) {
                        return (iconName ? 'http://openweathermap.org/img/w/' + iconName + '.png' : '');
                    };

                    scope.parseDate = function (time) {
                        return (time ? new Date(time * 1000) : new Date());
                    };
                }
            }
        }])
        .directive('todayPanel', [function () {
        return {
            restrict: 'EA',

            scope: {
                dailyForecast: '=dailyData',
                forecast: '=weatherPanel'
            },

            templateUrl: 'templates/todayPanel.html',

            link: function (scope, element, attrs) {

                scope.getIconImageUrl = function (iconName) {
                    return (iconName ? 'http://openweathermap.org/img/w/' + iconName + '.png' : '');
                };

                scope.parseDate = function (time) {
                    return (time ? new Date(time * 1000) : new Date());
                };
            }
        }
    }])

})();

