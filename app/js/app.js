(function () {
    'use strict';

    angular.module('weatherApp', [
            'ngRoute',
            'weatherApp.controllers',
            'weatherApp.services',
            'weatherApp.directives',
            'weatherApp.filters'
        ])
        .constant('APP_CONFIG', {
            appName: 'Weather App',
            appVersion: '1.0',
            apiKey: 'd01adf2953eb7e5f8a719ec58268d5ef',
            apiBaseUrl: 'http://api.openweathermap.org/data/2.5/forecast/daily/',
            cacheLifetime: 10800000, //in milliseconds (3 hours)
            storagePrefix: 'weatherApp'
        })
        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/', {
                templateUrl: 'templates/weatherApp.html',
                controller: 'WeatherCtrl',
                controllerAs: 'vm'
            });
            $routeProvider.otherwise({redirectTo: '/'});
        }]);
})();