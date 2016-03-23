(function () {
    'use strict';

    /* Controllers */

    angular.module('weatherApp.controllers', [])
        .controller('WeatherCtrl',
            ['$scope', '$window', 'openWeatherMapService', 'geolocationService', 'localStorageService', 'manageCitiesService', 'errorsService', 'APP_CONFIG',
                function ($scope, $window, openWeatherMapService, geolocationService, localStorageService, manageCitiesService, errorsService, APP_CONFIG) {

                    var vm = this;
                    
                    vm.appError = errorsService.reset();
                    vm.forecast = [];
                    vm.location = '';
                    vm.position = undefined;
                    vm.cities = localStorageService.getItem('cities') || [];
                    vm.iconBaseUrl = 'http://openopenWeatherMapService.org/img/w/';

                    vm.setDefault = function (index) {
                        vm.cities = manageCitiesService.setDefault(index, vm.cities);
                        localStorageService.setItem('cities', vm.cities);
                        vm.appError = errorsService.reset();
                    };

                    vm.setLocation = function () {
                        vm.appError.showWeather = true;
                        if (vm.location !== '' && vm.location !== undefined) {
                            vm.location = vm.location.replace(/[`~!@#$%^&*()_|+=?;:,<>\{\}\[\]\\\/]/gi, '');
                            loadForecastByCity(vm.location);
                        }

                    };

                    vm.selectCity = function (index) {
                        vm.appError = errorsService.reset();
                        vm.location = vm.cities[index].name;
                        loadForecastByCity(vm.location);
                        return false;
                    };

                    vm.deleteCity = function (index) {
                        var city = vm.cities[index];
                        localStorageService.removeItem('forecast_' + vm.cities[index].name);
                        vm.cities = manageCitiesService.removeByIndex(index, vm.cities);
                        localStorageService.setItem('cities', vm.cities);

                        if (city.default && !manageCitiesService.isEmpty(vm.cities)) {
                            manageCitiesService.setDefault(0, vm.cities);
                            localStorageService.setItem('cities', vm.cities);
                        }

                        if (manageCitiesService.isEmpty(vm.cities)) {
                            vm.appError = errorsService.set('emptyList');
                            $window.location.reload();
                        }
                    };


                    //check if city exists
                    if (manageCitiesService.isEmpty(vm.cities)) {
                        vm.appError = errorsService.set('getAccess');
                        geolocationService().then(function (position) {
                            vm.position = {
                                lat: position.coords.latitude,
                                lon: position.coords.longitude
                            };
                            loadForecastByPosition(vm.position);
                            vm.appError = errorsService.reset();
                        }, function (error) {
                            var errorName = 'getAccess';
                            if (error.code > 1) {
                                errorName = 'notDetect';
                            }
                            vm.appError = errorsService.set(errorName);
                        });
                    }

                    if (vm.appError.showWeather) {
                        var defaultCity = manageCitiesService.getDefault(vm.cities);
                        if (defaultCity !== false) {
                            loadForecastByCity(vm.cities[defaultCity].name);
                        } else {
                            vm.appError = errorsService.set(setDefault);
                        }
                    }

                    function loadForecastByCity(cityName) {
                        var loadFromCache = false;
                        if (localStorageService.isSet('forecast_' + cityName)) {
                            loadFromCache = isLoadFromCache(localStorageService.getItem('forecast_' + cityName).timestamp);
                        }
                        if (loadFromCache) {
                            vm.forecast = localStorageService.getItem('forecast_' + cityName).data;
                            vm.appError = errorsService.reset();
                        } else {
                            openWeatherMapService.getForecast({
                                city: cityName
                            }).then(function successCallback(data) {
                                    if (data.cod === "404" || data.city === undefined) {
                                        vm.appError = errorsService.set('notFound');
                                    } else {
                                        vm.forecast = data;
                                        vm.appError = errorsService.reset();
                                        localStorageService.setItem(
                                            'forecast_' + cityName,
                                            {
                                                timestamp: new Date().getTime(),
                                                city: cityName,
                                                data: vm.forecast
                                            }
                                        );
                                        vm.cities = manageCitiesService.addItem(cityName, vm.cities);
                                        localStorageService.setItem('cities', vm.cities);
                                    }
                                },
                                function errorCallback(response) {
                                    vm.appError = errorsService.set('notFound');
                                });
                        }
                    }

                    function loadForecastByPosition(position) {
                        return openWeatherMapService.getForecast({
                            lat: position.lat,
                            lon: position.lon
                        }).then(function (data) {
                            if (data.cod === "404") {
                                vm.appError = errorsService.set('notFound');
                            }
                            if (data.city) {
                                vm.forecast = data;
                                vm.appError = errorsService.reset();
                                vm.cities = manageCitiesService.addItem(vm.forecast.city.name, vm.cities);
                                localStorageService.setItem('cities', vm.cities);
                                localStorageService.setItem('forecast_' + vm.forecast.city.name,
                                    {
                                        timestamp: new Date().getTime(),
                                        city: vm.forecast.city,
                                        data: vm.forecast
                                    }
                                );
                            }
                        });
                    }

                    function isLoadFromCache(timestamp) {
                        var current = new Date().getTime(),
                            diffTime,
                            loadFromCache = false;
                        diffTime = current - timestamp;
                        if (diffTime < APP_CONFIG.cacheLifetime) {
                            loadFromCache = true;
                        }
                        return loadFromCache;
                    }
                }]);

})();