var setting = {
  idName: 'objectId',
  dataToolsName: 'parseTool',
  templateDir: 'templates/ionic/',
  struts: {
    objectId: {
      input: {
        type: 'hidden',
      },
    }
  },
  strutsModels: {
    careType: {
      struts: {
        food: {
          label: '食事',
          columnName: 'food',
          write: function(datas) {
            var strutsModel = setting.strutsModels.careFood.strutsSet.content;
            var str = datas['foodType'] + ": " + datas['foodContents'];
            str += datas['mainVolume'] ? ", 主(" + datas['mainVolume'] + ")" : "";
            str += datas['sideVolume'] ? ", 副(" + datas['sideVolume'] + ")" : "";
            str += datas['supplement'] ? ", 補助(" + datas['supplement'] + ")" : "";
            str += datas['note'] ? ", 備考: " + datas['note'] : "";
            return str;
          }
        },
        bath: {
          label: '入浴',
          columnName: 'bath',
          disabled: true
        },
        excr: {
          label: '排泄',
          columnName: 'excr',
          disabled: true
        },
        drink: {
          label: '水分',
          columnName: 'drink',
          disabled: true
        },
        vital: {
          label: 'バイタル',
          columnName: 'vital',
          disabled: true
        }
      },
      strutsSet: {
        tabs: ['food', 'bath', 'excr', 'drink', 'vital']
      }
    },
    user: {
      className: 'user',
      struts: {
        username: {
          label: '',
          placeholder: 'ユーザー名',
          attrs: {
            required: true,
            'ng-change': 'formObj.username.$setValidity("alreadyTakenUserName", true);',
            'ng-pattern': '/^[a-zA-Z0-9_]*$/'
          },
          validateMsg: {
            pattern: '半角英数のみ'
          }
        },
        email: {
          label: '',
          placeholder: 'メールアドレス',
          input: {
            type: 'email'
          },
          attrs: {
            required: true,
            'ng-change': 'formObj.email.$setValidity("alreadyTakenEmail", true);formObj.email.$setValidity("email", true);'
          }
        },
        password: {
          label: '',
          placeholder: 'パスワード',
          input: {
            type: 'password'
          },
          attrs: {
            required: true,
            'ng-minlength' : 6,
            'ng-change': 'passwordCheck(formObj);',
            'ng-pattern': '/^[a-zA-Z0-9_]*$/'
          },
          validateMsg: {
            pattern: '半角英数のみ'
          }
        },
        password2: {
          label: '',
          placeholder: 'パスワード確認',
          input: {
            type: 'password'
          },
          attrs: {
            required: true,
            'ng-change': 'passwordCheck(formObj)',
            'ng-pattern': '/^[a-zA-Z0-9_]*$/'
          },
          validateMsg: {
            pattern: '半角英数のみ'
          }
        },
      },
      classStruts: ['objectId', 'username', 'email', 'password'],
      strutsSet: {
        //table: ['username', 'email', 'password', 'password2', {label: ''}],
        form: ['objectId', 'username', 'email', 'password', 'password2']
      },
    },

    customer: {
      className: function($scope, model, dataTool) {
        return dataTool.getCustomerClassName();
      },
      struts: {
        lastName: {
          label: '姓',
          attrs: {
            required: 'true'
          }
        },
        firstName : {
          label: '名',
          attrs: {
            required: 'true'
          }
        },
        gender: {
          label: '性別',
          input: {
            tag: 'select',
            options: [
              //{label: '', value: ''},
              {label: '男', value: '男'},
              {label: '女', value: '女'}
            ]
          },
          attrs: {
            required: true
          }
        },
        roomName: {
          label: '部屋名',
        },
        foodAdl: {
          label: '食事ADL',
          input: {
            tag: 'select',
            options: [
              {label: '', value: ''},
              {label: '自立', value: '自立'},
              {label: '一部介助', value: '一部介助'},
              {label: '全介助', value: '全介助'},
              {label: '経管', value: '経管'}
            ]
          },
        },
        customerPhoto: {
          label: '写真',
          input: {
            tag: 'image',
          },
          read: parse.file.read,
          write: parse.file.write,
        }
      },
      classStruts: ['objectId', 'firstName', 'lastName', 'gender', 'roomName', 'foodAdl'],
      strutsSet: {
        form: ['objectId', 'lastName', 'firstName', 'gender', 'roomName', 'foodAdl']
      },
    },

    careFood: {
      className: function($scope, model, dataTool) {
        return dataTool.getCareClassName();
      },
      struts: {
        customerOid: {
          label: '利用者Oid',
          input: {
            type: 'hidden',
          }
        },
        checkDateTime: {
          label: '記録日時',
          input: {
            type: 'hidden',
          },
          read: parse.date.read,
          write: parse.date.write,
          attrs: {
            'ng-required': 'true',
          }
        },
        foodAdl: {
          label: 'ADL',
          input: {
            tag: 'label'
          },
          write: function(model, struts, scope) {
            var customer = storage.get('customer');
            return customer ? customer.foodAdl || '未設定' : '';
          },
        },
        'food.foodType': {
          label: '内容',
          input: {
            tag: 'select',
            options: [
              {label: '朝食', value: '朝食'},
              {label: '昼食', value: '昼食'},
              {label: 'おやつ', value: 'おやつ'},
              {label: '夕食', value: '夕食'}
            ]
          },
          attrs: {
            'ng-required': 'true',
          }
        },
        'food.foodContents': {
          label: '',
          input: {
            tag: 'select',
            options: [
              //{label: '', value: ''},
              {label: '済み', value: '済み'},
              {label: '欠食', value: '欠食'},
              {label: '未提供', value: '未提供'}
            ]
          },
          attrs: {
            'ng-required': true,
            //'ng-init': 'struts.watch(struts, this)',
            //'ng-change': 'struts.changeFunc(this.model, this)'
          },
          /*
          watch: function(struts, scope){
            scope.$watch(function() {
              return scope.modelColumn.foodContents;
            }, function(newVal, oldVal) {
              var $timeout = angular.injector(['ng']).get('$timeout');
              $timeout(function() {
                struts.changeFunc(scope.model, scope);
              }, 0);
            });
          },
          */
          changeFunc: function(model, scope) {

            var strutsSet = scope.strutsSet;
            var food = model.food;
            if (!food) {
              return;
            }

            var foodContents = model.food.foodContents;

            if (foodContents == '済み' && model.foodAdl == '経管') {
              food.mainVolume = '';
              food.sideVolume = '';
              food.supplement = '';
              food.note = '経管';
              strutsSet[6].input.tag = 'output';
              strutsSet[7].input.tag = 'output';
              strutsSet[8].input.tag = 'output';
              strutsSet[9].input.tag = 'output';

            } else if (foodContents == '欠食') {
              food.mainVolume = '';
              food.sideVolume = '';
              strutsSet[6].input.tag = 'output';
              strutsSet[7].input.tag = 'output';
              strutsSet[8].input.tag = 'select';
              strutsSet[9].input.tag = 'select';

            } else if (foodContents == '未提供') {
              food.mainVolume = '';
              food.sideVolume = '';
              food.supplement = '';
              food.note = '';

              strutsSet[6].input.tag = 'output';
              strutsSet[7].input.tag = 'output';
              strutsSet[8].input.tag = 'output';
              strutsSet[9].input.tag = 'output';
            } else {
              strutsSet[6].input.tag = 'select';
              strutsSet[7].input.tag = 'select';
              strutsSet[8].input.tag = 'select';
              strutsSet[9].input.tag = 'select';
            }

          }
        },
        'food.mainVolume': {
          label: '主食量',
          input: {
            tag: 'select',
            icon: {
              start: 'ion-android-more',
              end:'ion-android-sort'
            },
            options: [
              {label: '', value: ''},
              {label: 1, value: 1},
              {label: 2, value: 2},
              {label: 3, value: 3},
              {label: 4, value: 4},
              {label: 5, value: 5},
              {label: 6, value: 6},
              {label: 7, value: 7},
              {label: 8, value: 8},
              {label: 9, value: 9},
              {label: 10, value: 10}
            ]
          },
          attrs: {}
        },
        'food.sideVolume': {
          label: '副食量',
          input: {
            tag: 'select',
            icon: {
              start: 'ion-android-more',
              end:'ion-android-sort'
            },
            options: [
              {label: '', value: ''},
              {label: 1, value: 1},
              {label: 2, value: 2},
              {label: 3, value: 3},
              {label: 4, value: 4},
              {label: 5, value: 5},
              {label: 6, value: 6},
              {label: 7, value: 7},
              {label: 8, value: 8},
              {label: 9, value: 9},
              {label: 10, value: 10}
            ]
          },
          attrs: {}
        },
        'food.supplement': {
          label: '補助食',
          input: {
            tag: 'select',
            options: [
              {label: '', value: ''},
              {label: '濃厚流動×1', value: '濃厚流動×1'},
              {label: '濃厚流動×2', value: '濃厚流動×2'},
              {label: '代替食', value: '代替食'}
            ]
          },
          attrs: {}
        },
        'food.note': {
          label: '備考',
          input: {
            tag: 'select',
            options: [
              {label: '', value: ''},
              {label: '配膳', value: '配膳'},
              {label: '経管', value: '経管'}
            ]
          },
          attrs: {}
        },
      },
      classStruts: ['objectId', 'customerOid', 'checkDateTime', 'food'],
      strutsSet: {
        form: ['objectId', 'customerOid', 'checkDateTime', 'foodAdl', 'food.foodContents', 'food.foodType', 'food.mainVolume', 'food.sideVolume', 'food.supplement', 'food.note'],
        content: ['food.foodType', 'food.foodContents', 'food.mainVolume', 'food.sideVolume', 'food.supplement', 'food.note']
      }
    }
  }
};

var strutsModels = setting.strutsModels;

angular.forEach(setting.strutsModels, function(strutsModel, modelKey){
  angular.forEach(strutsModel.strutsSet, function(strutsSet, strutsSetKey){
    angular.forEach(strutsSet, function(value, key){
      if (angular.isString(value)) {
        var struts = strutsSet[key] = angular.extend(strutsModel.struts[value] || setting.struts[value] || {}, {key: value});
//        if (!struts.$option && struts.option) {
//          var str = [];
//          angular.forEach(struts.option, function(val, key) {
//            str.push('ng-' + key + '="' + val + '"');
//          });
//          struts.$option = str.join(' ');
//        }
      }
    });
  });

  angular.forEach(strutsModel.classStruts, function(value, key){
    if (angular.isString(value)) {
      strutsModel.classStruts[key] = angular.extend(strutsModel.struts[value] || setting.struts[value] || {}, {key: value});
    }
  });
});