Bridge.angularModules.push(
  function(setting) {
    setting.angularApp.directive('bridgeTable', function($sce, $http, $templateCache) {
      //arguments
      return {
        restrict: 'AE',
        scope: {
          model: '='
        },
        templateUrl: setting.dir + ('bridge-table.html'),
        transclude: true,
        link: function (scope, element, attrs) {
          var model = Bridge.setting.models[attrs.model];
          if (!scope.connector) {
            scope.connector = new Bridge.Connector({
              dataName: model.dataName,
              $http: $http
            });
          }
          //scope.$sce = $sce;
          if (model.table) {
            scope.table = model.table;
          } else {
            
          }
          scope.connector.reqList(model.dataName + 'ReqList', '').request(function(datas, status) {
            scope.datas = datas;
          });
          
        }
      };
    });
  }
);

Bridge.angularModules.push(function(setting) {
  setting.angularApp.directive('brHtml', function($sce, $parse, $templateCache) {
    return {
        restrict: 'AE',
        //transclude: true,
        link: function (scope, element, attrs) {
          // attrs.model
          element[0].innerHTML = $sce.trustAsHtml(attrs.brHtml);
        }
      };
  });
});


Bridge.angularModules.push(function(setting) {
  setting.angularApp.directive('googleMap', function() {
    return {
        restrict: 'AE',
        //transclude: true,
        link: function (scope, element, attrs) {
          element[0].innerHTML = $sce.trustAsHtml(attrs.brHtml);
        }
      };
  });
});
