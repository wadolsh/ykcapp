var br = Bridge;
function pushMarker(obj) {
  if (!obj['緯度']) {
    return;
  }
  
  //var lv = labelVisible | true; 
  
  obj.latLng = new google.maps.LatLng(obj["緯度"], obj["経度"]);
  //obj.marker = new google.maps.Marker({
  obj.marker = new MarkerWithLabel({
      //icon : 'https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=' + obj["ID"] + '|00a8e6|000000',
      //icon : 'https://chart.googleapis.com/chart?chst=d_simple_text_icon_above&chld=' + obj["ID"] + '|12|000000|glyphish_map-marker|24|E60000|00a8e6',
      //map: aMap,
      position: obj.latLng,
      labelVisible: true,
      labelContent: obj["ID"],
      labelAnchor: new google.maps.Point(55, -4),
      labelClass: "labels", // the CSS class for the label
      labelStyle: {opacity: 0.75},
  });
  google.maps.event.addListener(obj.marker, 'click', function() {
      aMap.setCenter(obj.latLng);
  });
}


ykcApp.controller('SidemenuCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {
  $rootScope.Bridge = Bridge;
  $scope.panelBarOptions = {};
}]);

ykcApp.controller('MainCtrl', ['$scope', function ($scope) {
  $scope.$parent.activeMenu='main';
}]);

ykcApp.controller('TmsCtrl', ['$scope', function ($scope) {
  $scope.$parent.activeMenu='tms';
  $scope.data=[{class1: 'aaaa'}];
  
}]);

ykcApp.controller('SmpCtrl', ['$scope', function ($scope) {
  $scope.$parent.activeMenu='smp';
}]);

ykcApp.controller('Kmt1Ctrl', ['$scope', '$timeout', function ($scope, $timeout) {
  $scope.$parent.activeMenu='kmt';
  var datas = br.ls.get("kmtOldTypeMapJsons");
  var areaData = br.ls.get("kmtAreaDataJsons");


  $scope.pageSize = 100;
  $scope.$watch('pageSize', function(newValue, oldValue) {
    $scope.source.pageSize(newValue);
    pagerChange();
  });

  var dataSource = new kendo.data.DataSource({
    data: datas,
    pageSize: $scope.pageSize,
  });
  
  dataSource.filter(
    //{ field: "緯度", operator: "neq", value: "" },
    //{ field: "ID", operator: "neq", value: "" },
    { field: "ID重複", operator: "eq", value: "1" }
                    );
                    
  dataSource.group([{ field: "区分名" },
             { field: "地域名" },
             { field: "カード番号" }]);
  
  $scope.source = dataSource;
  
  
  var pager = $("#pager").kendoPager({
      dataSource: dataSource,
      change: function(e) {
        pagerChange();
      },
      //pageSizes: [50, 100, 200, 300, 400, 500]
  });
  
  // $scope.pagerOption = {
  //   dataSource: dataSource,
  //   pageSizes: [50, 100, 200, 300, 400, 500]
  // };
  
  // kendo-pager k-data-source="source" k-options="pagerOption"
  //pager.bind("change", function(e) { // handler for "change" event
  //    pagerChange();
  //});
  
  var pagerChange = function() {
    var pages = [];
    var area1s = dataSource.view();
    for (var area1ind in area1s) {
      var area2s = area1s[area1ind];
      for (var area2ind in area2s.items) {
        var area3s = area2s.items[area2ind];
        for (var area3ind in area3s.items) {
          var area4s = area3s.items[area3ind];
          pages.push(area4s.items);
          angular.forEach(area4s.items, function(data) {
            pushMarker(data, $scope.showLabel);
          });
        }
      }
    }
    
    $timeout(function() {
      $scope.pages = pages;
    });
    
  }
  pagerChange();
  

  
  var mapOptions = {
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    center: new google.maps.LatLng(-34.397, 150.644),
  }
  
  // $scope.$on('$viewContentLoaded', function() {
  //   //$scope.$watch();
  // });
  
  $scope.createMap = function(mapId, datas) {
    $timeout(function() {
      var kMap = new google.maps.Map(document.getElementById(mapId), mapOptions);
      kMap.setCenter(datas[0].latLng);
      for (var ind in datas) {
        datas[ind].marker.setMap(kMap);
      }
    }, 30);
    
  }
  //
  
  
}]);


ykcApp.controller('KmtCtrl', ['$scope', '$timeout',function ($scope, $timeout) {
  $scope.$parent.activeMenu='kmt';
  
  
  var mapOptions = {
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      center: new google.maps.LatLng(-34.397, 150.644),
  }
  
  var aMap = aMap = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);;
  $timeout(function() {
    //aMap = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
    google.maps.event.trigger(aMap, 'resize'); 
  });
  
  //
  var aMapMarkers = [];
  
  var initData = function(datas) {
    areaData = {};
    for (var ind in datas) {
      var obj = datas[ind];
      var a1 = obj['区分名'];
  	  var a2 = obj['地域名'];
  	  var a3 = obj['カード番号'];
  	  if (!areaData[a1]) {
  	    areaData[a1] = {};
  	  }
  	  if (!areaData[a1][a2]) {
  	    areaData[a1][a2] = [];
  	  }
  	  if (areaData[a1][a2].indexOf(a3) < 0) {
  	    areaData[a1][a2].push(a3);
  	  }
    }
    
      //$scope.source.filter({ field: "Price", operator: "lt", value: parseInt(f) });
      //$scope.source.filter({});
      //$scope.source.sort({ field: f, dir: "asc" });
      //$scope.source.sort({});
    
    $scope.areaOption1 = areaData;
    $scope.source.data(datas);
  }
  
  
  
  var datas = br.ls.get("kmtOldTypeMapJsons") || [];
  var areaData = {};
  
  $scope.csvToJson = function(csvText) {
    var lines=csvText.split("\n");
    var datas = [];
    var headers=lines[0].split(",");
    
    for(var i=1;i<lines.length;i++){
  	  var obj = {};
  	  var currentline=lines[i].split(",");
  	  for(var j=0;j<headers.length;j++){
  		  obj[headers[j]] = currentline[j];
  	  }
  	  datas.push(obj);
    }
    
    br.ls.set("kmtOldTypeMapJsons", datas);
    br.ls.set("kmtAreaDataJsons", areaData);
    
    initData(datas);
    
  }
  
  $scope.showLabel = true;
  $scope.changeLabel = function() {
    $scope.showLabel = !$scope.showLabel;
    for(var ind in aMapMarkers) {
      aMapMarkers[ind];
      //aMapMarkers[ind].labelVisible = $scope.showLabel;
      aMapMarkers[ind].set("labelVisible", $scope.showLabel);
    }
    //$scope.source.trigger("change");
  }
  $scope.showAll = function() {
    $scope.source.filter({});
    $scope.source.trigger("change");
  }
  
  $scope.$watch('areaSelect1', function(newValue, oldValue) {
    $scope.areaOption2 = areaData[newValue];
    $scope.areaOption3 = null;
    if (newValue) {
      $scope.source.filter({ field: "区分名", operator: "eq", value: $scope.areaSelect1 });
    } else {
      $scope.source.filter({});
    }
    
  });
  $scope.$watch('areaSelect2', function(newValue, oldValue) {
    $scope.areaOption3 = areaData[$scope.areaSelect1][newValue];
    $scope.source.filter([{ field: "区分名", operator: "eq", value: $scope.areaSelect1 },
                          { field: "地域名", operator: "eq", value: $scope.areaSelect2 }]);
  });
  $scope.$watch('areaSelect3', function(newValue, oldValue) {
    $scope.source.filter([{ field: "区分名", operator: "eq", value: $scope.areaSelect1 },
                          { field: "地域名", operator: "eq", value: $scope.areaSelect2 },
                          { field: "カード番号", operator: "eq", value: $scope.areaSelect3 }]);
  });


  $scope.pagerOption = {
    dataSource: $scope.source,
    //pageSizes: [50, 100, 200, 300, 400, 500],
    change : function(e) { // handler for "change" event
      google.maps.event.trigger(aMap, 'resize');
    }
  };  

  $scope.pageSize = 100;
  $scope.$watch('pageSize', function(newValue, oldValue) {
    $scope.source.pageSize(newValue);
  });
  
  $scope.source = new kendo.data.DataSource({
    //data: datas,
    pageSize: $scope.pageSize,
    change: function(e) {
      
      var datas = this.view();
      //var datas = this.data();

      while(aMapMarkers.length > 0) {
          aMapMarkers.pop().setMap(null);
      }

      angular.forEach(datas, function(data, ind) {
        
        pushMarker(data, $scope.showLabel);
        if (data.marker) {
          data.marker.setMap(aMap);
          aMapMarkers.push(data.marker);
        }
        
        if (ind == 0 && data.latLng) {
          aMap.setCenter(data.latLng);
        }
      });
      
      //$timeout(function() {
        //google.maps.event.trigger(aMap, 'resize');
      //}, 100);
      
      
      //aMap.setZoom(12);
    }
    
  });//.filter({ field: "緯度", operator: "neq", value: ""  });


  $scope.listViewTemplate = $("#template").html();

  if (datas.length > 0) {
    initData(datas);
  }

}]);

