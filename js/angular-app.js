var application = angular.module('razor', ['ngRoute']);


application.controller('logs', function ($scope, $routeParams, $http) {
 console.log($routeParams);	
 $http.get(config.server + '/api/collections/nodes/'+$routeParams.node+'/log').success(function (data){
 	$scope.data = data.items;
 });
});

application.controller('collection', function ($scope, collections, commands, $interval, $http, $routeParams) {
	$scope.data=[];
	console.log($routeParams.name);
	collections.getData($routeParams.name).then(function (result){
		console.log(result);
		angular.forEach(result.items, function (value, key){
			console.log(value);
			$http.get(value.id).success(function(data){
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

application.service('commands', function ($http,$q) {
	return {
		exec : function (command, object) {
			var data = angular.toJson(object);
			console.log(command, data);
			$http.post(config.server+'/api/commands/'+command, object).success(function(data){
				console.log(data);
				if (data.result) {
					$('#notify')
						.removeClass('alert-info alert-danger')
						.addClass('alert-info')
						.text(data.result);
				}
			}).error(function (response){
				console.log(response);
				if(response.error){
					$('#notify')
						.removeClass('alert-info alert-danger')
						.addClass('label-danger')
						.text(response.error);
				}
			})
		}
	}
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
