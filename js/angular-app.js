var application = angular.module('razor', ['ngRoute']);

application.controller('nodes', function ($scope, collections, commands, $interval, $http) {
	$scope.data=[];
	collections.getData('nodes').then(function (result){
		console.log(result);
		angular.forEach(result.items, function (value, key){
			console.log(value);
			$http.get(value.id).success(function(data){
				$scope.data.push(data);
			})
		});
	});
	$scope.command = function (command,name){
		commands.exec(command,name);
	}		
});


application.controller('tags', function ($scope, collections, commands, $interval, $http) {
	$scope.data=[];
	collections.getData('tags').then(function (result){
		console.log(result);
		angular.forEach(result.items, function (value, key){
			console.log(value);
			$http.get(value.id).success(function(data){
				$scope.data.push(data);
			})
		});
	});		
});


application.controller('brokers', function ($scope, collections, commands, $interval, $http) {
	$scope.data=[];
	collections.getData('brokers').then(function (result){
		console.log(result);
		angular.forEach(result.items, function (value, key){
			console.log(value);
			$http.get(value.id).success(function(data){
				$scope.data.push(data);
			})
		});
	});		
});
application.controller('tasks', function ($scope, collections, commands, $interval, $http) {
	$scope.data=[];
	collections.getData('tasks').then(function (result){
		console.log(result);
		angular.forEach(result.items, function (value, key){
			console.log(value);
			$http.get(value.id).success(function(data){
				$scope.data.push(data);
			})
		});
	});		
});
application.controller('repos', function ($scope, collections, commands, $interval, $http) {
	$scope.data=[];
	collections.getData('repos').then(function (result){
		console.log(result);
		angular.forEach(result.items, function (value, key){
			console.log(value);
			$http.get(value.id).success(function(data){
				$scope.data.push(data);
			})
		});
	});		
});
application.controller('policies', function ($scope, collections, commands, $interval, $http) {
	$scope.data=[];
	collections.getData('policies').then(function (result){
		console.log(result);
		angular.forEach(result.items, function (value, key){
			console.log(value);
			$http.get(value.id).success(function(data){
				$scope.data.push(data);
			})
		});
	});		
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
			$http.post(config.server+'/commands/'+command, object).success(function(data){
				console.log(data);
			});
		}
	}
});

application.config(function ($routeProvider) {
	$routeProvider
		.when('/', {
			controller : ''
		})
		.when('/nodes', {
			templateUrl : 'views/nodes.html',
			controller : 'nodes'
		})
		.when('/tasks', {
			templateUrl : 'views/tasks.html',
			controller : 'tasks'
		})
		.when('/repos', {
			templateUrl : 'views/repos.html',
			controller : 'repos'
		})
		.when('/brokers', {
			templateUrl : 'views/brokers.html',
			controller : 'brokers'
		})
		.when('/policies', {
			templateUrl : 'views/policies.html',
			controller : 'policies'
		})
		.when('/tags', {
			templateUrl : 'views/tags.html',
			controller : 'tags'
		})
		.otherwise({ redirectTo: '/' });
});
