/**
 * choish
 */
(function(){
  var root = this;
  var Bridge = root.Bridge = {};
  var angularModules = Bridge.angularModules = [];
  var setting = Bridge.setting = {dir : '', angularApp : null};
  
  Bridge.init = function(setting) {
    Bridge.setting = setting;
    for (var ind in angularModules) {
      angularModules[ind](setting);
    }
    
    /*
    var tableItem = null;
    angular.forEach(setting.models, function(model, modelKey){
      if (model.table) {
        angular.forEach(model.table, function(value, key){
          if (angular.isString(value)) {
            tableItem = model.table[key] = extend(model.struts[value] || {}, {key: value});
          }
        });
      }
    });
    */
    
    angular.forEach(setting.strutsModels, function(strutsModel, modelKey){
      angular.forEach(strutsModel.strutsSet, function(strutsSet, strutsSetKey){
        angular.forEach(strutsSet, function(value, key){
          if (angular.isString(value)) {
            var struts = strutsSet[key] = angular.extend(strutsModel.struts[value] || setting.struts[value] || {}, {key: value});
          }
        });
      });
    
      angular.forEach(strutsModel.classStruts, function(value, key){
        if (angular.isString(value)) {
          strutsModel.classStruts[key] = angular.extend(strutsModel.struts[value] || setting.struts[value] || {}, {key: value});
        }
      });
    });
  };
  
  var log = root.log = function(str) {
      console.log(str);
  };
  
  var extend = Bridge.extend = angular.extend;
  
  /*
  var PanelView = Bridge.PanelView = function(config) {
		this.$area = config.$area;
		this.init();
	}
	
	extend(Bridge.PanelView.prototype, {
		init : function() {
		},
		
		render : function() {
		}
	});
	*/
  
  
  var ls = Bridge.ls = {
    set: function(key, data) {
        localStorage[key] = angular.toJson(data, false);
    },
    get: function(key) {
      try {
        return angular.fromJson(localStorage[key] || null);
      } catch (e) {
        return localStorage[key];
      }
        
    },
    remove: function(key) {
        delete localStorage[key];
    },
    clear: function () {
      localStorage.clear();
    }
  };

  
  
  
  /** サーバーとの通信を担当 */
  var Connector = Bridge.Connector = function(config) {
      this.config = config || {};
      this.dataName = config.dataName || Bridge.dataName;
      this.url = config.url || Bridge.url ||"/bridge";
      this.idName = config.idName || Bridge.idName || "id";
      this.baseParm = config.baseParm;
      
      this.beforeFunc = config.beforeFunc;
      this.afterFunc = config.afterFunc;
      
      this.queueData = [];
  };
  
  extend(Bridge.Connector.prototype, {
      
      addId : function (obj, id) {
          obj[this.idName] = id;
          return obj;
      },
      
      /** 既存作業を初期化 */
      reset : function() {
          this.queueData.length = 0;
          this.dataName = this.config.dataName || Bridge.dataName;
          return this;
      },
      
      request : function(callBack) {
          var conn = this;
          $.post(this.url, {req : this.queueData}, function (data, textStatus, jqXHR) {
              if (conn.beforeFunc && !conn.beforeFunc(data, textStatus, jqXHR)) {
                  return false;
              }
              callBack(data, textStatus, jqXHR);
              if (conn.afterFunc) {
                  conn.afterFunc(data, textStatus, jqXHR);
              }
          }, "json");
          
          this.reset();
      },

      dataName :function(dataName) {
          this.dataName = dataName;
      },
      
      combine : function (data) {
          this.queueData.push(JSON.stringify(extend(data, {"dataName" : this.dataName}, this.baseParm)));
      },
      
      /** メタ情報要求 */
      reqMetaData : function(key) {
          this.combine({
              "key" : key,
              "method" : "reqMetaData"
          });
          return this;
      },
      /** 一つのデートのみ要求（あくまでインタペース的な意味） */
      reqData : function (key, id, query) {
          query = query || {};
          this.combine(extend(this.addId({
              "key" : key,
              "method" : "reqData",
              "parm" : query,
          }, id)));
          return this;
      },
      reqList : function (key, query) {
          query = query || {};
          this.combine({
              "key" : key,
              "method" : "reqList",
              "parm" : query,
          });
          return this;
      },
      reqMovePage : function (key, query) {
          query = query || {};
          this.combine({
              "key" : key,
              "method" : "reqMovePage",
              "parm" : query,
          });
          return this;
      },
      reqInsert : function (key, data) {
          this.combine({
              "key" : key,
              "method" : "reqInsert",
              "data" : data
          });
          return this;
      },
      reqUpdate : function (key, id, data) {
          this.combine({
              "key" : key,
              "method" : "reqUpdate",
              "data" : this.addId(data, id)
          });
          return this;
      },
      reqSave : function (key, data) {
          this.combine(extend({
              "key" : key,
              "method" : "reqSave",
              "data" : data
          }));
          return this;
      },
      reqDelete : function (key, id) {
          this.combine(this.addId({
              "key" : key,
              "method" : "reqDelete"
          }, id));
          return this;
      },
      reqExecMethod : function (key, method, data) {
          this.combine({
              "key" : key,
              "method" : method,
              "data" : data
          });
          return this;
      },
  });
  
  
  var validateTool = Bridge.validateTool = {
    isNullAble : function(messageObj, value, sw) {
        if (!sw && !value) {
            // messageObj.message.push("必須項目です。");
            return "必須項目です。";
        }
        return; 
    },
    
    patterns : {
        Digits: {patten : /^\d+$/, message : "数字のみ入力してください。"},
        Email: {patten : /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i,
                message : "メールアドレスを入力してください。"},
        Number: {patten : /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/,
                 message : "数字のみ入力してください。"},
        // Date :
    },
    
    typeName : function(messageObj, value, type) {
        if (!value || this.type != 'text' || type == "String") {
            return;
        }
        
        if (type == "isDate") {
            if (isNaN(new Date(value))) {
                return  "日付の入力が正しくありません。";
            }
            return;
        }
        
        if (!value.toString().match(this.validateTool.patterns[type].patten)) {
            return this.validateTool.patterns[type].message;
        }
        return;
    },
    size : function(messageObj, value, size) {
        if (!size || size < 1 || !value) {
            return;
        } else if (value.toString().length > size) {
            // messageObj.message.push("サイズを超えました。");
            return "サイズを超えました。";
        }
        return;
    }
  };
  
  
  Connector.extend = function(src) {
    var obj = extend(this);
    obj.prototype = extend(this.prototype, src);
    return obj;
  };
}).call(this);

