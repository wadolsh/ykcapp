'use strict';
var ykcApp = angular
  .module('ykcApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'kendo.directives'
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
      .when('/kmt', {
            templateUrl: 'views/kmt.html',
            controller: 'KmtCtrl'
      })
      .when('/kmt1', {
            templateUrl: 'views/kmt1.html',
            controller: 'Kmt1Ctrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });




Bridge.init({
  idName: 'objectId',
  dir: 'bridge_bootstrap3/',
  angularApp : ykcApp,
  connection: {
    "X-Parse-Application-Id": "vwq8p9y2Lem8baKzHYpkoHFiKHtanFUl1KPNrvQ4",
    "X-Parse-REST-API-Key": "QfFXTiH7E7TMXwmNdQT4R77D6dkanpo2zFe2MhvO",
    //"X-Parse-Session-Token" : localStorage.get('SessionToken'),
  },
  strutsModels: {
    oprs: {
      struts: {
        tms: {
          label: "神権宣教学校",
        },
        smp: {
          label: "奉仕会",
        },
        kmt: {
          label: "区域管理",
          sub: {
            kmt: {
              label: "区域管理",
            },
            kmt1: {
              label: "区域管理:印刷用"
            }
          }
        }
      },
      strutsSet: {
        //menu: ['tms', 'smp', 'kmt'],
        menu: ['kmt'],
      }
      
    },
    tms: {
      dataName : 'Theocratic_Ministry_School',
      struts: {
        objectId: {
          show: 'hidden'
        },
        date: {
          label: '日付',
          valid: {
            date: {pattern: 'yyyy-MM-dd'}
          },
        },
        class1: {
          label: '1番'
        },
        class2: {
          label: '2番',
          write: function(obj, data, $scope) {
            //return $sce.parseAsHtml(obj.main.name + '<br/>' + obj.sub.name);
            return obj.main.name + '<br/>' + obj.sub.name;
          }
        },
        class3: {
          label: '3番'
        }
      },
      table: ['date', 'class1', 'class2', 'class3', {label: ''}],
      form: [Bridge.extend('objectId', {key: 'objectId', show: 'readonly'}), 'date', 'class1', 'class2', 'class3']
    }
  }
});
