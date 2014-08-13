var storage = Bridge.ls;

Bridge.angularModules.push(
  function(setting) {
    myApp.factory('parseTool', function($http, $templateCache) {
        var _parserUrl = 'https://api.parse.com/1';
        var _headers = setting.connection; 
        /*
        {
            "X-Parse-Application-Id": "lwXv1vCe0RxxsXoGbne5AmqIzcnn0zh6a2tiIAwa",
            "X-Parse-REST-API-Key": "6GbmZJL5x2CevcQsOvysARM3EtAD50N6HE4v5t8y",
            "X-Parse-Session-Token" : storage.get('SessionToken'),
            //'Content-Type': 'application/x-www-form-urlencoded'
        };
        */
        
        var request = function(method, url, options, successFunc, errorFunc, hideLoading) {
          if (!hideLoading) {
    
          }
    
          var config = {method: method, url: url, cache: false, headers: _headers};
          
          for (var key in options) {
            config[key] = angular.extend(config[key] || {}, options[key]);
          }
          
          $http(config).
            success(function(data, status) {
              if (successFunc) {
                successFunc(data, status);
              } else {
                alert('success! ' + JSON.stringify(data));
              }
            }).
            error(function(data, status) {
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
            request('POST', _parserUrl + '/classes/' + className, {data: data}, successFunc, errorFunc);
          },
          
          updateData: function(className, oid, data, successFunc, errorFunc) {
            request('PUT', _parserUrl + '/classes/' + className + '/' + oid, {data: data}, successFunc, errorFunc);
          },
    
          deleteData: function(className, oid, successFunc, errorFunc) {
              request('DELETE', _parserUrl + '/classes/' + className + '/' + oid, null, successFunc, errorFunc);
          },
    
          batchData: function(data, successFunc, errorFunc) {
            request('POST', _parserUrl + '/batch', {data: data}, successFunc, errorFunc);
          },
    
          reqOrg: function(successFunc, errorFunc) {
            var org = storage.get('loginOrg');
            this.reqData('Org', org.objectId, successFunc, errorFunc);
          },
          
          getCustomerClassName: function() {
            return storage.get('loginOrg').customerClassName;
          },
          getCareClassName: function() {
            return storage.get('loginOrg').careClassName;
          }
        };
    });
    
  }
);

/*
Bridge.Connector = Bridge.Connector.extend({
  request : function(callBack) {
    var conn = this;
    var $http = this.config.$http;
    
    //https://docs.angularjs.org/api/ng/service/$http#get
    
    $http({method: 'GET', url: 'https://api.parse.com/1/classes/' + this.dataName,
        headers: Bridge.setting.connection}).
      success(function(data, status) {
        callBack(data.results, status);
      }).
      error(function(data, status) {
        alert(data.code + ' : ' + data.error);
    });
    
    
    /
    $.post(this.url, {req : this.queueData}, function (data, textStatus, jqXHR) {
        if (conn.beforeFunc && !conn.beforeFunc(data, textStatus, jqXHR)) {
            return false;
        }
        callBack(data, textStatus, jqXHR);
        if (conn.afterFunc) {
            conn.afterFunc(data, textStatus, jqXHR);
        }
    }, "json");
    /
    
  //-H "X-Parse-Application-Id: OI1GuJcgSVGahzWdDNwcHhZcXwzc7ZtOXBIcq4tz" \
  //-H "X-Parse-REST-API-Key: JWMF9R61o27zH0BQoctHzwT7jEv1ccHzL4q25iTF" \
    
    this.reset();
  }
});
*/

Bridge.angularModules.push(
  function(setting) {
    setting.angularApp.filter('modelParser', function($sce) {
      return function(input, model, data, $scope) {
        if (!input) {
          return;
        }
        if (model.write) {
          input = model.write(input, data, $scope);
        }
        if (input.__type == 'Date') {
          input = input.iso.replace('T', ' ').replace('.000Z', '').replace(' 00:00:00', '');
        }
        return input;
      };
    });
  }
);

