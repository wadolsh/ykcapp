var se = setting;

myApp.directive('bridgeTable', ['$templateCache', se.dataToolsName, function($templateCache, dataTool) {
  //arguments
  return {
    restrict: 'AE',
    // scope: {
    //   model: '='
    // },
    templateUrl: function(element, attrs) {
      return se.templateDir + (attrs.templateUrl || 'bridge-table.html');
    },
    transclude: true,
    link: function (scope, element, attrs) {
      var strutsModel = se.strutsModels[attrs.strutsModel];
      if (strutsModel.strutsSet.table) {
        scope.strutsSet = strutsModel.strutsSet.table;
      } else {
        console.log(attrs.model + ' 構成情報がありません。');
      }
    }
  };
}])


myApp.directive('bridgeInput', ['$templateCache', se.dataToolsName, function($templateCache, dataTool) {
  //arguments
  return {
    priority: 10,
    restrict: 'AE',
    templateUrl: function(element, attrs) {
      return se.templateDir + (attrs.templateUrl || 'bridge-input.html');
    },
    transclude: true,
    link: function (scope, element, attrs) {
      var strutsModel = se.strutsModels[attrs.strutsModel];
      var column = attrs.column;
      var item = scope.item = strutsModel.struts[column] || se.struts[column];

      scope.$watch(function() {
        if (attrs.modelColumn) {
          scope.modelColumn = attrs.modelColumn;
//          if (item.write) {
//            scope.modelColumn = item.write(scope.modelColumn);
//          }
        } else {
          var splitColumn = column.split('.');
          if (splitColumn.length > 1) {
            var modelColumn = scope.model;
            var size = splitColumn.length - 2;
            var tempColumn = null;
            for (var ind in splitColumn) {
              if (!modelColumn) {
                break;
              }

              tempColumn = modelColumn[splitColumn[ind]];
              if (!tempColumn) {
                modelColumn[splitColumn[ind]] = {};
              }
              modelColumn = modelColumn[splitColumn[ind]];
              if (size == ind) {
                scope.modelColumn = modelColumn;
                scope.keyName = splitColumn[parseInt(ind) + 1];
                break;
              }
            }
          } else {
            scope.modelColumn = scope.model;
            scope.keyName = column;
          }
//          if (item.write) {
//            scope.modelColumn[scope.keyName] = item.write(scope.modelColumn[scope.keyName]);
//          }
        }
      });

    }
  };
}])

.directive('bridgeForm', ['$templateCache', se.dataToolsName, '$rootScope', function($templateCache, dataTool, $rootScope) {
  //arguments
  return {
    restrict: 'AE',
    //require: 'ngModel',
    //require: 'form',
    templateUrl: function(element, attrs) {
      return se.templateDir + (attrs.templateUrl || 'bridge-form.html');
    },
    transclude: true,
//    controller :  function($scope, $element, $attrs){
//      console.log('controller');
//    },
    link: function (scope, element, attrs, formCtrl) {
      if (!scope.$parent.model) {
        scope.$parent.model = {};
      }

      var strutsModel = null;
      if (!scope.$parent.strutsModel) {
        var strutsModelKey = scope.$parent.strutsModelKey = attrs.strutsModel;
        strutsModel = scope.$parent.strutsModel = angular.copy(se.strutsModels[strutsModelKey]);
      } else {
        strutsModel = scope.$parent.strutsModel;
      }

      //scope.modelColumn = scope.model;
      scope.validate = validate;

      if (strutsModel.strutsSet.form) {
        scope.$parent.strutsSet = strutsModel.strutsSet.form;
        scope.modelColumn = settingTools.toViewModel(scope.strutsSet, scope.model);
        scope.$watch('model', function(newValue, oldValue) {
          if (newValue != oldValue) {
            scope.model = settingTools.toViewModel(scope.strutsSet, newValue);
            scope.modelColumn = scope.model;
          }
        });
        if (!scope.regist) {
          scope.regist = function(model) {
            model = settingTools.toClass(strutsModel, model);
            
            if (strutsModel.regist) {
              strutsModel.regist(scope, model, dataTool);
              return;
            }
            var className = strutsModel.className;
            if (angular.isFunction(className)) {
              className = className(scope, model, dataTool);
            }

            if (model[se.idName]) {
              dataTool.updateData(className, model[se.idName], model,
                  scope.successFuncRegist || strutsModel.successFuncRegist || se.successFunc,
                  scope.errorFuncRegist || strutsModel.errorFuncRegist || se.errorFunc);
            } else {
              dataTool.newData(className, model,
                  scope.successFuncRegist || strutsModel.successFuncRegist || se.successFunc,
                  scope.errorFuncRegist || strutsModel.errorFuncRegist || se.errorFunc);
            }
          }
        }
        
      } else {
        console.log(attrs.model + ' 構成情報がありません。');
      }
    }
  };
}])


.directive('brInclude', ['$templateCache', se.dataToolsName, function($templateCache, dataTool) {
  //arguments
  return {
    restrict: 'AE',
    templateUrl: function(element, attrs) {
      return se.templateDir + (attrs.brInclude || attrs.src);
    },
    transclude: true,
    link: function (scope, element, attrs) {

    }
  };
}])



.directive('brHtml', function($sce, $parse) {
return {
    restrict: 'AE',
    //transclude: true,
    link: function (scope, element, attrs) {
      element[0].innerHTML = $sce.trustAsHtml(attrs.brHtml);
    }
  };
})

.directive('dynamicInput', ["$parse", "$compile", function($parse, $compile) {
  return {
    restrict: 'A',
    priority: 101,
    require: '^form',
    controller :  function($scope, $element, $attrs){
      var struts = $scope.struts;//$parse($attrs.dynamicInput)($scope);
      delete($attrs['dynamicInput']);

      //struts.scope = $scope;

      //$element.removeAttr('data-dynamic-input');
      $element.removeAttr('dynamic-input');
      $attrs.$set("name", struts.key);
      //$attrs.$set("ngInit", '%s = struts.write ? struts.write(%s, struts, this) : %s'.replace(/%s/g, $attrs.ngModel));
    },
    link: function(scope, element, attrs, formCtrl) {

      var elementClone = element.clone();
      var struts = scope.struts;
      angular.forEach(struts.attrs, function(val, key) {
          elementClone.attr(key, val);
      });

      elementClone = $compile(elementClone)(scope);
      element.replaceWith(elementClone);
    }
  };
}])



.filter('modelParser', function($sce) {
  return function(input, model, data, scope) {

    return model.write ? model.write(input, data, scope) : input;
  };
})

.filter('parse', function($sce) {
  return function(input, type, method, option) {
    return parse[type][method](input, option);
  };
});


