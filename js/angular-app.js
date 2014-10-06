var application = angular.module('razor', ['ngRoute', 'ui.bootstrap','ui.select']);


application.controller('logs', function ($scope, $routeParams, $http) {
 console.log($routeParams);	
 $http.get(config.server + '/api/collections/nodes/'+$routeParams.node+'/log').success(function (data){
 	$scope.data = data.items;
 });
});


application.config(function(uiSelectConfig) {
  uiSelectConfig.theme = 'select2';
});

application.controller('collection', function ($interval, $scope, collections, commands, $interval, $http, $routeParams) {
	$scope.data=[];
	console.log($scope);
	// $interval(function (){
	//  	//$scope.$apply;
	//  	$http.get(config.server+'/api/collections/'+$routeParams.name).success(function (data){
	//  		console.log($scope.data);
	//  		angular.forEach(data.items, function (value, key){
	//  			$http.get(value.id).success(function (res){
	//  				console.log(value.name, res.last_checkin);
	//  				angular.forEach($scope.data, function (a, b){
	//  					if(a.name == value.name){
	//  						console.log(Date.parse(a.last_checkin), Date.parse(res.last_checkin));
	//  						if(Date.parse(a.last_checkin) < Date.parse(res.last_checkin)){
	//  							console.log('THERS IS NEW A SHERRIF IN TOWN', res.name, b, key);
	//  							$scope.data.splice(b,0,res);
	//  							continue;
	//  						}
	//  					}
	//  				})
	//  			});
	 		
	//  		});
	//  	});
	//  },3000);
	collections.getData($routeParams.name).then(function (result){
		var now = new Date().getTime();
		angular.forEach(result.items, function (value, key){
			$http.get(value.id).success(function(data){
				if(data.last_checkin){
					data['unix'] = Date.parse(data.last_checkin);
					data['new'] = false;
					if( (now - data.unix) < 60000 ){
						data.new = true;
					}
					//if(data.unix - )
				}
				console.log(data);
				$scope.data.push(data);
			});
		});
	});
	$scope.command = function (command,name){
		commands.exec(command,name);
	}		
});

application.service('collections', function ($http, $q){
    return{
      getData: function(collection){
        var deferred = $q.defer();
 
        $http.get(config.server+'/api/collections/'+collection).success(function(data){
          deferred.resolve(data);
      	}).error(function(){
 
        deferred.reject("An error occured while fetching items");
      });
 		console.log(deferred.promise);
      return deferred.promise;
    }
  }
});

application.filter('propsFilter', function() {
  return function(items, props) {
    var out = [];

    if (angular.isArray(items)) {
      items.forEach(function(item) {
        var itemMatches = false;

        var keys = Object.keys(props);
        for (var i = 0; i < keys.length; i++) {
          var prop = keys[i];
          var text = props[prop].toLowerCase();
          if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
            itemMatches = true;
            break;
          }
        }

        if (itemMatches) {
          out.push(item);
        }
      });
    } else {
      // Let the output be the input untouched
      out = items;
    }

    return out;
  };
});


application.controller('EditModal', function ($scope, $modal, $log) {
	$scope.inputs = { 
		action : false
	};

	  $scope.open = function (size, selected, name) {

	    var modalInstance = $modal.open({
	      templateUrl: 'views/modals/'+selected+'-modal.html',
	      controller: 'ModalInstanceCtrl',
	      size: size,
	      resolve: {
	        inputs: function () {
	        	console.log(name, $scope.inputs);
	        	if(name){
	        		$scope.inputs.selected = selected;
	        		$scope.inputs.action = { name : name, selected : selected };
	        	}else{
	        		
	        		$scope.inputs={};
	        		$scope.inputs.selected = selected;
	        	}
	        	
	        	return $scope.inputs;
	        	
	        }
	      }
	    });

	    modalInstance.result.then(function (selectedItem) {
	      $scope.selected = selectedItem;
	      console.log(angular.toJson(selectedItem));
	    }, function () {
	      $log.info('Modal dismissed at: ' + new Date());
	    });
	  };
});


application.controller('ModalInstanceCtrl', function ($http, $scope, $modalInstance, inputs) {
  $scope.availableTags = [];
	
  // $scope.multipleDemo = {};
  // $scope.multipleDemo.colors = ['Blue','Red'];
  $scope.inputs = inputs;
  $scope.inputs.header = 'Create';
  console.log('INPUTS: :: ',inputs);
  if(inputs.action ) {
  	
  	$http.get(config.server + '/api/collections/' + inputs.action.selected + '/' + inputs.action.name).success(function (data){
  		if(data.iso_url) {
  			data['iso-url'] = data.iso_url;
  		}

  		if(data.spec){
  			delete data.spec;
  		}
  		if(data.id){
  			delete data.id;
  		}
  		if(inputs.selected == 'tags'){
  			delete data.policies;
  			delete data.nodes;
  		}
  		data['header'] = 'Update';
  		if(data.tags){
  			var tagsArr=[];
  			angular.forEach(data.tags, function (value){
  				tagsArr.push(value.name);
  			});
  			data.tags=tagsArr;
  		}

  		
  		console.log($scope.inputs);
  		$scope.inputs = data;
  	});
  }
    if(inputs.selected == 'policies'){
		$http.get(config.server + '/api/collections/tags').success(function (res){
			console.log('TAGS:::',res.items);
			angular.forEach(res.items, function (value, key){
				console.log(value.name);
				$scope.availableTags.push(value.name);
			});
		});
  	}
  $scope.ok = function () {
    $modalInstance.close($scope.inputs);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});


application.service('commands', function ($http,$q) {
	return {
		exec : function (command, object) {
			var data = angular.toJson(object);
			tools.notify('meadf','alert-info');
			$http.post(config.server+'/api/commands/'+command, object).success(function(response){
				if (response.result) {
					tools.notify(response.result, 'alert-info');
				}
			}).error(function (response){
				if(response.error){
					tools.notify(response.error, 'alert-danger');
				}
			})
		}
	}
});

application.controller('GetAvailableRepos', function ($scope, $http) {
	$scope.repos = [];
	$http.get(config.server + '/api/collections/repos').success(function (data){
		angular.forEach(data.items, function (value){
			$scope.repos.push(value.name);
		});
		
	});
});

application.controller('GetAvilableBrokers', function ($scope, $http) {
	$scope.brokers = [];
	$http.get(config.server + '/api/collections/brokers').success(function (data){
		angular.forEach(data.items, function (value){
			$scope.brokers.push(value.name);
		});
	});
});

application.controller('GetAvailableTasks', function ($scope, $http) {
	$scope.tasks = [];
	$http.get(config.server + '/api/collections/tasks').success(function (data){
		angular.forEach(data.items, function (value){
			$scope.tasks.push(value.name);
		});
	});
});

application.config(function ($routeProvider) {
	$routeProvider
		.when('/', {
			controller : ''
		})
		.when('/:name', {
			templateUrl : function (params) {
				return 'views/'+params.name+'.html';
			},
			controller : 'collection'
		})
		.when('/logs/:node', {
			templateUrl : 'views/logs.html',
			controller : 'logs'
		})
		.otherwise({ redirectTo: '/' });
});

var tools = {
	notify : function (msg, css) {
		angular
			.element('#notify')
			.removeClass('hidden alert-info alert-danger')
			.addClass(css)
			.text(msg);
		setTimeout(function () {
			angular
				.element('#notify')
				.addClass('hidden');
		}, 5000)
	}
}