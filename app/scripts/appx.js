'use strict';

var myApp = angular.module('kanonApp', ['ionic'])
  .value('validate', validate).value('parse', parse).value('setting', setting).value('Object', Object);

myApp.config(['$stateProvider', '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('home', {
      url: "/",
      templateUrl: "templates/home.html",
      controller: 'HomeCtrl',
      authenticate: false
    })
    .state('login', {
      url: "/login",
      templateUrl: "templates/login.html",
      controller: 'LoginCtrl',
      authenticate: false
    })
    .state('logout', {
      url: "/logout",
      //templateUrl: "logout.html",
      controller: 'LogoutCtrl'
    })
    .state('signup', {
      url: "/signup",
      templateUrl: "templates/signup.html",
      controller: 'SignupCtrl'
    })
    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'templates/sideMenu.html',
      controller: 'SideMenuCtrl',
      authenticate: true
    })
    .state('app.customerList', {
      url: "/customerList",
      templateUrl: "templates/customerList.html",
      controller: 'CustomerListCtrl',
      authenticate: true
    })
    .state('app.editCustomer', {
      url: "/editCustomer/:customerOid",
      templateUrl: "templates/editCustomer.html",
      controller: 'EditCustomerCtrl',
      authenticate: true
    })
    .state('app.customerView', {
      url: "/customerView/:customerOid",
      templateUrl: "templates/customerView.html",
      controller: 'CustomerViewCtrl',
      authenticate: true
    })
    .state('app.editCare', {
      url: "/editCare/:tabSelection/:customerOid/:careOid",
      templateUrl: "templates/editCare.html",
      controller: 'EditCareCtrl',
      authenticate: true
    })
    .state('app.careTimeLine', {
      url: "/careTimeLine/:customerOid",
      templateUrl: "templates/careTimeLine.html",
      controller: 'CareTimeLineCtrl',
      authenticate: true
    })
    .state('app.careView', {
      url: "/careView/:tabSelection/:customerOid",
      templateUrl: "templates/careView.html",
      controller: 'CareViewCtrl',
      authenticate: true
    })
  ;
  $urlRouterProvider.otherwise("/");

}])
  // 認証
  .run(['$rootScope', '$state', 'AuthService', '$http', '$templateCache',
  function($rootScope, $state, AuthService, $http, $templateCache) {
    $http.get('templates/ionic/bridge-form.html', { cache: $templateCache });
    $http.get('templates/ionic/bridge-input.html', { cache: $templateCache });
    $http.get('templates/ionic/bridge-objectForm.html', { cache: $templateCache });
    $http.get('templates/ionic/careHeader.html', { cache: $templateCache });
    $http.get('templates/ionic/customerHeader.html', { cache: $templateCache });

    $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {

      if (toState.authenticate && !AuthService.isAuthenticated()) {
        // User isn’t authenticated
        $state.go("login");
        event.preventDefault();
      }
    });

    $rootScope.tools = {
      customerSelect: function ($scope, dataTool, customerOid) {
        var customer = storage.get('customer');
        if (customer && customer.objectId == customerOid) {
          $scope.customer = customer;
          $scope.customerOid = customer.objectId;
          $rootScope.$broadcast('customerData', $scope.customerOid);
        } else {
          dataTool.reqData(dataTool.getCustomerClassName(), customerOid, function (data, status) {
            $scope.customer = data;
            $scope.customerOid = data.objectId;
            storage.set('customer', data);
            $rootScope.$broadcast('customerData', $scope.customerOid);
          });
        }
      }
    }
  }])
;




