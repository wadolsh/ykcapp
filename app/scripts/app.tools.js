var parse = {
  deviceDate: {
    getNowHHMM: function() {
      var now = new Date();
      now.setSeconds(0, 0);
      return now;
    }
  },
  date: {
    /** 日付をUTCで処理 */
    addZeroArray: function(arr) {
      var val = null;
      for (var i in arr) {
        val = arr[i];
        if ((angular.isNumber(val) && val < 10) || val.length < 2) {
          arr[i] = ('0' + val).slice(-2)
        }
      }
      return arr;
    },
    read: function(value) {
      return value ? {
        __type: 'Date',
        iso: (angular.isDate(value) ? value.toJSON() : new Date(value.replace('T', ' ')).toJSON())
      } : null;
    },
    write: function(dataObj) {
      if (dataObj && dataObj.__type == 'Date') {
        return parse.date.getDate(dataObj) + "T" + parse.date.getTime(dataObj);
      }
      return dataObj;
    },
    getDate: function(dataObj) {
      if (dataObj && dataObj.__type == 'Date') {
        var date = new Date(dataObj.iso);
        return parse.date.addZeroArray([date.getFullYear(), date.getMonth() + 1, date.getDate()]).join( '-' );
      }
      return dataObj;
    },
    getMMDD: function(dataObj) {
      if (dataObj && dataObj.__type == 'Date') {
        var date = new Date(dataObj.iso);
        return parse.date.addZeroArray([date.getMonth() + 1, date.getDate()]).join( '-' );
      }
      return dataObj;
    },
    getTime: function(dataObj) {
      if (dataObj && dataObj.__type == 'Date') {
        var date = new Date(dataObj.iso);
        return parse.date.addZeroArray([date.getHours(), date.getMinutes(), date.getSeconds()]).join( ':' );
      }
      return dataObj;
    },
    getHHMM: function(dataObj) {
      if (dataObj && dataObj.__type == 'Date') {
        var date = new Date(dataObj.iso);
        return parse.date.addZeroArray([date.getHours(), date.getMinutes()]).join( ':' );
      }
      return dataObj;
    },
    addDate: function(days, date) {
      var beforeOneWeek = date || new Date();
      beforeOneWeek.setDate(beforeOneWeek.getDate() + days);
      return beforeOneWeek;
    }
  },

  dateLocal: {
    /** 日付をあるままで処理する */
    read: function(value) {
      return value ? {
        __type: 'Date',
        iso: (angular.isDate(value) ? value.toJSON() : new Date(value).toJSON())
      } : null;
    },
    write: function(dataObj) {
      if (dataObj && dataObj.__type == 'Date') {
        return dataObj.iso.replace('.000Z', '');
      }
      return dataObj;
    },
    getDate: function(dataObj) {
      if (dataObj && dataObj.__type == 'Date') {
        return dataObj.iso.split('T')[0];
      }
      return dataObj;
    },
    getMMDD: function(dataObj) {
      if (dataObj && dataObj.__type == 'Date') {
        return dataObj.iso.split('T')[0].substr(5,8);
      }
      return dataObj;
    },
    getTime: function(dataObj) {
      if (dataObj && dataObj.__type == 'Date') {
        return dataObj.iso.split('T')[1].replace('.000Z', '');
      }
      return dataObj;
    },
    getHHMM: function(dataObj) {
      if (dataObj && dataObj.__type == 'Date') {
        return dataObj.iso.split('T')[1].replace('.000Z', '').replace(/:00$/, '');
      }
      return dataObj;
    },
    addDate: function(days, date) {
      var beforeOneWeek = date || new Date();
      beforeOneWeek.setDate(beforeOneWeek.getDate() + days);
      return beforeOneWeek;
    },
  },
  pointer: {
    write: function(dataObj) {
      if (dataObj && dataObj.__type == 'Pointer') {
        return dataObj.objectId;
      }
    },
    read: function(val, className){
      return val ? {"__type": "Pointer", "className": className, "objectId": val} : null;
    }
  },

  file: {
    write: function(dataObj) {
      if (dataObj && dataObj.__type == 'File') {
        return dataObj.name;
      }
    },
    read: function(val, className){
      return val ? {"__type": "File", "name": val} : null;
    }
  },

  Object: {
    isEmpty: function(obj) {
      return !obj ? false : Object.keys(obj).length > 0 ? false : true;
    }
  }
};

var storage = {
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
  }
};


var settingTools = {
  toClass: function(strutsModel, model) {
    var settingTools = this;
    if (strutsModel.classStruts) {
      var original = model;
      model = {};
      angular.forEach(strutsModel.classStruts, function(struts, skey) {
        var modelData = settingTools.modelFinder(original, struts.key);
        if (modelData && struts.read) {
          model[modelData.key] = struts.read(modelData.model[modelData.key]);
        } else {
          model[struts.key] = original[struts.key];
        }
      });
    }
    return model;
  },
  toViewModel: function(strutsSet, model) {

    if (strutsSet) {
      angular.forEach(strutsSet, function(struts, skey) {
        var modelData = settingTools.modelFinder(model, struts.key);
        if (modelData && struts.write) {
          modelData.model[modelData.key] = struts.write(modelData.model[modelData.key]);
        }
      });
    }
    return model;
  },
  modelFinder: function(model, keyString) {
    var splitkey = keyString.split('.');
    if (splitkey.length > 1) {
      var returnModel = model;
      var size = splitkey.length - 2;
      if (returnModel) {
        for (var ind in splitkey) {
          returnModel = returnModel[splitkey[ind]];
          if (size == ind) {
            return {key: splitkey[parseInt(ind) + 1], model: returnModel}
          }
        }
      } else {
        return null;
      }
    } else {
      return {key: keyString, model: model};
    }
  }
};


var validate = {
  message: function($error, struts) {
    var strs = [];
    angular.forEach($error, function(val, key) {
      if(val) {
        strs.push(validate.msgs[key](struts, $error));
      }
    });
    return strs.length > 0 ? strs.join(' ・ ') : '';
  },
  msgs: {
    required: function(struts) {
      return '必須'
    },
    pattern: function(struts) {
      return struts.validateMsg.pattern || '入力不可文字あり';
    },
    minlength : function(struts, val) {
      return (struts.attrs['ng-minlength']) + ' 桁以上入力';
    },
    email: function(struts) {
      return 'E-mail形式';
    },
    passwordCheck: function(struts) {
      return 'パスワード不一致';
    },
    alreadyTakenUserName: function(struts) {
      return '存在するユーザー名';
    },
    alreadyTakenEmail: function(struts) {
      return '使用中のメールアドレス';
    },
    emailVerifiedFail: function(struts) {
      return 'メールアドレスの認証が終わっていません。ユーザー登録時のメールアドレスから認証メールを確認してください。';
    },
    diffPasswordId: function(struts) {
      return  'ユーザー名またはパスワードが正しくありません。';
    }
  }
};


var ls = {
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
