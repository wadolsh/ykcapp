Bridge.angularModules.push(
  function(setting) {
    setting.angularApp.filter('modelParser', function($sce) {
      return function(input, model, data, $scope) {

        return model.write ? model.write(input, data, $scope) : input;
      };
    });
  }
);

