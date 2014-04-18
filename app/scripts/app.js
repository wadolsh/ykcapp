'use strict';

angular
  .module('ykcApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/tms', {
          templateUrl: 'views/tms.html',
          controller: 'TmsCtrl'
      })
      .when('/smp', {
            templateUrl: 'views/smp.html',
            controller: 'SmpCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
