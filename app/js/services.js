(function () {
    'use strict';

    /* Services */

    angular.module('weatherApp.services', ['ngResource', 'ngStorage'])
        .config(['$localStorageProvider',
            function ($localStorageProvider) {
                $localStorageProvider.setKeyPrefix('weatherApp');
            }]
        )
        .factory('openWeatherMapService', ['$http', 'APP_CONFIG', function ($http, APP_CONFIG) {
            return {
                getForecast: getForecast
            };

            function getForecast(params) {
                var query,
                    apiKey = APP_CONFIG.apiKey,
                    base = APP_CONFIG.apiBaseUrl;

                if (params.lat && params.lon) {
                    query = 'lat=' + params.lat + '&lon=' + params.lon;
                }

                if (params.city) {
                    query = 'q=' + params.city;
                }

                var requestUrl = base + "?APPID=" + apiKey + "&lang=en" + '&units=metric' + '&cnt=5&' + query;
                return $http.get(requestUrl)
                    .then(getForecastComplete)
                    .catch(getForecastFailed);

                function getForecastComplete(response) {
                    return response.data;
                }

                function getForecastFailed(error) {
                    return error;
                }
            }
        }])

        .factory("geolocationService", ['$q', '$window', '$rootScope', function ($q, $window, $rootScope) {
            return function () {
                var deferred = $q.defer();
                if (!$window.navigator) {
                    $rootScope.$apply(function () {
                        deferred.reject(new Error("You browser in not supported geolocation"));
                    });
                } else {
                    $window.navigator.geolocation.getCurrentPosition(function (position) {
                        $rootScope.$apply(function () {
                            deferred.resolve(position);
                        });
                    }, function (error) {
                        $rootScope.$apply(function () {
                            deferred.reject(error);
                        });
                    });
                }

                return deferred.promise;
            }
        }])

        .factory('localStorageService', ['$localStorage', function ($localStorage) {
            return {
                getItem: getItem,
                setItem: setItem,
                removeItem: removeItem,
                isSet: isSet,
                clear: clear
            };

            function getItem(key) {
                return $localStorage[key];
            }

            function setItem(key, value) {
                return $localStorage[key] = value;
            }

            function removeItem(key) {
                delete $localStorage[key];
            }

            function isSet(key) {
                return ($localStorage[key]) ? true : false;
            }

            function clear() {
                return $localStorage.$reset();
            }

        }])

        .factory('manageCitiesService', function () {
            return {
                getDefault: getDefault,
                setDefault: setDefault,
                isEmpty: isEmpty,
                isContain: isContain,
                removeByIndex: removeByIndex,
                addItem: addItem
            };

            function getDefault(items) {
                for (var i = 0; i < items.length; i++) {
                    if (items[i].default) {
                        return i;
                    }
                }
                return false;
            }

            function setDefault(index, items) {
                items = items || [];
                items = items.map(function (item) {
                    item.default = false;
                    return item;
                });
                items[index].default = true;
                return items;
            }

            function isEmpty(items) {
                return (items.length === 0);
            }

            function isContain(name, value, items) {
                items = items || [];
                var findArr = items.filter(function (item) {
                    return item[name] === value;
                });
                return (findArr.length > 0);
            }

            function removeByIndex(index, items) {
                items.splice(index, 1)
                return items;
            }

            function addItem(item, items) {
                items = items || [];
                if (isContain('name', item, items)) {
                    return items;
                }

                var city = {
                    name: item,
                    default: false
                };

                if (isEmpty(items) || getDefault(items) === false) {
                    city.default = true;
                }

                items.unshift(city);
                return items;
            }
        })

        .factory('errorsService', function () {
            var errorsList = {
                getAccess: 'Please give access to geolocation or input city manually.',
                notDetect: 'Browser can\'t detect your position. Please input city  manually.',
                setDefault: 'Please set default city from list.',
                emptyList: 'Cities list is empty. Please add city.',
                notFound: 'Unfortunately forecast not found.'
            };

            return {
                reset: resetErrors,
                set: setErrorMessage
            };

            function get(messageName) {
                return (errorsList[messageName]) ? errorsList[messageName] : 'Unknown error';
            }

            function resetErrors() {
                return {
                    message: '',
                    class: '',
                    showWeather: true
                };
            }

            function setErrorMessage(messageName) {
                return {
                    message: get(messageName),
                    class: 'alert-danger',
                    showWeather: false
                };
            }

        })
})();
