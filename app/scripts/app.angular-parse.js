myApp.factory('parseTool', function($http, $templateCache, $ionicLoading) {
    var _parserUrl = 'https://api.parse.com/1';
    var _headers = {
        "X-Parse-Application-Id": "z39X1sdsnSsvrVoLImYSM68aC25XtEcCuTZ20huZ",
        "X-Parse-REST-API-Key": "dqQbjnA8zNr6FawBq8C7Hi44Ar3IaURuqBE5p0HU",
        "X-Parse-Session-Token" : storage.get('SessionToken'),
        //'Content-Type': 'application/x-www-form-urlencoded'
    };

    var _exts = {
      jpg : 'image/jpeg',
      txt : 'text/plain'
    }
    
    var request = function(method, url, options, successFunc, errorFunc, hideLoading) {
      if (!hideLoading) {
        $ionicLoading.show({
          template: 'Loading...'
        });
      }

      var config = {method: method, url: url, cache: false, headers: _headers};
      
      for (var key in options) {
        config[key] = angular.extend(config[key] || {}, options[key]);
      }
      
      $http(config).
        success(function(data, status) {
          $ionicLoading.hide();
          if (successFunc) {
            successFunc(data, status);
          } else {
            alert('success! ' + JSON.stringify(data));
          }
        }).
        error(function(data, status) {
          $ionicLoading.hide();
          if (errorFunc) {
            errorFunc(data, status || "Request failed");
          } else {
            alert('error! ' + JSON.stringify(data));
          }
      });
    }

    return {
      //request: request,

      callFunc: function (functionName, data, successFunc, errorFunc){
        request('POST', _parserUrl + '/functions/' + functionName, {data: data || null, headers: {'Content-Type': 'application/json'}}, successFunc, errorFunc);
      },

      installations: {
        uploading: function(successFunc, errorFunc) {
          var os = null;
          if ((navigator.userAgent.indexOf('iPhone') > 0 
                || navigator.userAgent.indexOf('iPad') > 0)
                || navigator.userAgent.indexOf('iPod') > 0) {
            os = 'ios';
          } else if (navigator.userAgent.indexOf('Android') > 0) {
            os = 'android';
          } else {
            os = 'pc';
          }
          request('POST', _parserUrl + '/installations', {data: {deviceType: os, installationId: 'dummy'}, headers: {'Content-Type': 'application/json'}}, function(data, status) {
            storage.set('installation', data);
            successFunc(data, status);
          }, errorFunc, true);
        },
        
        retrieving: function(successFunc, errorFunc) {
          var installations = storage.get('installations');
          if (!installations || !installations.objectId) {
            errorFunc(null, 'デバイス記録情報なし');
            return;
          }
          request('GET', _parserUrl + '/installations/' + installations.objectId, null, successFunc, errorFunc);
        },

      },
      
      user: {
        signup: function(user, successFunc, errorFunc){
          request('POST', _parserUrl + '/users', {data: user, headers: {'Content-Type': 'application/json'}}, successFunc, errorFunc);
        },
        update: function(user, successFunc, errorFunc) {
          request('PUT', _parserUrl + '/users/' + user.objectId, {data: user, headers: {'Content-Type': 'application/json'}}, successFunc, errorFunc);
        },
        delete: function(customerOid, successFunc, errorFunc) {
          request('DELETE ', _parserUrl + '/users/' + user.objectId, null, successFunc, errorFunc);
        },
        login: function(id, password, successFunc, errorFunc) {
          request('GET', _parserUrl + '/login', {params: {username: id, password: password}}, function(data, status) {
            _headers['X-Parse-Session-Token'] = data.sessionToken;
            storage.set('SessionToken', data.sessionToken);
            storage.set('loginUser', data);
            successFunc(data, status);
          }, errorFunc);
          //$http.get(_parserUrl + '/login', {username: id, password: password}, _headers);
        },
        logout: function(func) {
          delete localStorage['SessionToken'];
          delete _headers['X-Parse-Session-Token'];
          func();
        },
        
        sessionCheck: function(successFunc, errorFunc) {
          request('GET', _parserUrl + '/users/me', null, successFunc, errorFunc, true);
        }
      },

      file: {

        upload: function(name, data, successFunc, errorFunc) {
          var contentType = _exts[name.split('.')[1]];
          //https://api.parse.com/1/files
          request('POST', _parserUrl + '/files/' + name, {data: user, headers: {'Content-Type': contentType}}, successFunc, errorFunc);

        }

      },

      reqList: function(className, query, successFunc, errorFunc) {
        //JSON.stringify(query)//
        if (query) {
          var value = null;
          for (var key in query) {
            value = query[key];
            query[key] = angular.isObject(value) ? JSON.stringify(value) : value;
          }
        }

        request('GET', _parserUrl + '/classes/' + className, {params: query || null}, successFunc, errorFunc);
      },
      
      reqData: function(className, oid, successFunc, errorFunc) {
        request('GET', _parserUrl + '/classes/' + className + '/' + oid, null, successFunc, errorFunc);
      },
      
      newData: function(className, data, successFunc, errorFunc) {
        data.ACL = {};
        data.ACL[storage.get('loginUser').objectId] = {read:true, write:true};

        request('POST', _parserUrl + '/classes/' + className, {data: data}, successFunc, errorFunc);
      },
      
      updateData: function(className, oid, data, successFunc, errorFunc) {
        request('PUT', _parserUrl + '/classes/' + className + '/' + oid, {data: data}, successFunc, errorFunc);
      },

      deleteData: function(className, oid, successFunc, errorFunc) {
          request('DELETE', _parserUrl + '/classes/' + className + '/' + oid, null, successFunc, errorFunc);
      },
/*
      reqOrg: function(successFunc, errorFunc) {
        var org = storage.get('loginUser');
        this.reqData('Org', org.objectId, successFunc, errorFunc);
      },
*/
      getCustomerClassName: function() {
        return storage.get('loginUser').customerClassName;
      },
      getCareClassName: function() {
        return storage.get('loginUser').careClassName;
      }
    };
});


myApp.filter('modelParser', function($sce) {
  return function(input, model, data, $scope) {
    if (!input) {
      return;
    }
    if (model && model.write) {
      input = model.write(input, data, $scope);
    }
    if (input.__type == 'Date') {
      input = input.iso.replace('T', ' ').replace('.000Z', '').replace(' 00:00:00', '');
    }
    return input;
  };
});


