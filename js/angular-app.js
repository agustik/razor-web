var application = angular.module('razor', ['ngRoute', 'ui.bootstrap','ui.select','ngSanitize']);


application.controller('dashboard', function ($scope, collections, $http){
	$scope.count = {};
	$scope.nodes = 0;
	$http.get(config.server+'/api').success(function (data){
		console.log(data.collections);
		data.collections.forEach(function (col){
			collections.getData(col.name).then(function (result){
				$scope[col.name] = {
					count: result.items.length
				}
			});
		})
	});
});




application.controller('logs', function ($scope, $routeParams, $http, $interval) {
 //console.log($routeParams);	
 $http.get(config.server + '/api/collections/nodes/'+$routeParams.node+'/log').success(function (data){
 	var arr = [];
 	data.items.forEach(function (log, index){
 		log['unix'] = Date.parse(log.timestamp);
 		arr.push(log);
 	});
 	console.log(arr);
 	$scope.data = arr;
 });

 $interval(function (){
 	 $http.get(config.server + '/api/collections/nodes/'+$routeParams.node+'/log').success(function (data){
 	 	var arr = [], diff=1;
	 	data.items.forEach(function (log, index){
	 		log['unix'] = Date.parse(log.timestamp);
	 		arr.push(log);
	 	});
	 	console.log($scope.data.length, arr.length);
	 	if($scope.data.length !== arr.length){
		 	diff = arr.slice($scope.data.length, arr.length);
		 	diff.forEach(function (value){
		 		$scope.data.push(value);
		 	});
	 	}
	 });	
 },1000);

});


application.config(function(uiSelectConfig) {
  uiSelectConfig.theme = 'bootstrap';
});


function GetProgress(node){
	if('state' in node){
		if ('stage' in node.state){
			if(node.state.installed !== false){
				return 100;
			}else if(node.state.stage == 'boot_local'){
				return 90;
			}else if(node.state.stage == 'boot_install'){
				return 30;
			}else if(node.state.stage == 'bootint'){
				return 10;
			}
		}
	}
	return 0;
}

application.controller('collection', function (tools, $interval, $scope, collections, commands, $interval, $http, $routeParams, $filter) {
	$scope.data=[];
	var orderBy = $filter('orderBy');
	$scope.theorder = 'name';
	$scope.reverse = false;
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
				}
				if($routeParams.name == 'nodes'){
					data.percentage = GetProgress(data);
				}
				$scope.data.push(data);

			});
		});
		$scope.order($scope.theorder, $scope.reverse);
	});

	var interval = (config.interval) ? config.interval : 5000;
	$interval(function (){
		collections.getData($routeParams.name).then(function (result){
			var now = new Date().getTime();
			//console.log(result);
			var tmparr = [], index = false;
			if(result.items.length >= $scope.data.length){
				result.items.forEach(function (value, key){
					$http.get(value.id).success(function (data){
						if(data.last_checkin){
							data['unix'] = Date.parse(data.last_checkin);
							data['new'] = false;
							if( (now - data.unix) < 60000 ){
								data.new = true;
							}
						}
						index = FindIndex('id',value.id, $scope.data);

						if(index !== false){
							if(HasChanged(data, $scope.data[index])){
								data['new'] = false;
								$scope.data.splice(index, 1);
								$scope.data.push(data);
							}
						}else{
							$scope.data.push(data);
						}

					});
				});
			}else{

				// find the one deleted ..
			}
		$scope.order($scope.theorder, $scope.reverse);
		});
	}, interval);

	$scope.order = function(predicate, reverse) {
		console.log(predicate, reverse);
		$scope.theorder = predicate;
		$scope.reverse = reverse;
		$scope.data = orderBy($scope.data, predicate, reverse);
	};

	


	$scope.command = function (command,name, index){
		console.log(command, name,index);
		console.log(index);
		if(command.match(/delete/) !== null){
			if(command == 'delete-node' && index){
				console.log('delete ? ');
				$scope.data.splice(index, 1);
			}
		}

		if(command == 'delete-node'){
			$scope.data.splice(index, 1);
		}
		commands.exec(command,name);
	}		
});


function FindIndex(key, value,  arr){
	var found = false, index = false;

	arr.forEach(function (item, i){
		if(item[key] == value){
			found=true;
			index = i;
			return;
		}
	});

	return index;
}

function HasChanged(newdata, olddata){
	var check = {
		old : {
			unix : olddata.unix,
			state : olddata.state
		},
		new : {
			unix : newdata.unix,
			state : newdata.state
		}
	};

	if(JSON.stringify(check.new) !== JSON.stringify(check.old)){
		return true;
	}else{
		return false;
	}

	if(newdata['unix'] == olddata['unix']){
		if('state' in newdata){
			if('state' in olddata){
				if(olddata.state.installed !== newdata.state.installed){
					return true;
				}else{
					if('stage' in newdata.state){
						if('stage' in olddata.state){
							if(newdata.state.stage == olddata.state.stage){
								return false;
							}

						}else{
							return true;
						}
					}else{
						return false;
					}
				}
			}else{
				return true;
			}

		}

		//state.staged
	}else{
		return true;
	}
}


application.service('collections', function ($http, $q){
    return{
      getData: function(collection){
        var deferred = $q.defer();
 
        $http.get(config.server+'/api/collections/'+collection).success(function(data){
          deferred.resolve(data);
      	}).error(function(){
 
        deferred.reject("An error occured while fetching items");
      });
 		//console.log(deferred.promise);
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


application.controller('EditModal', function ($scope, $modal, $log, commands) {
	$scope.inputs = { 
		action : false
	};

	$scope.delete = function (command, name){
		commands.exec(command, {name : name });
	}

	  $scope.open = function (size, selected, name) {

	    var modalInstance = $modal.open({
	      templateUrl: 'views/modals/'+selected+'-modal.html',
	      controller: 'ModalInstanceCtrl',
	      size: size,
	      resolve: {
	        inputs: function () {
	        	//console.log(name, $scope.inputs);
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

	    var available_commands = {
	    	Create : {
	    		policies : 'create-policy',
	    		tags : 'create-tag',
	    		broker : 'create-broker',
	    		repos : 'create-repo',
	    		task : 'create-task'

	    	},
	    	Update : {

	    	}
	    } 

	    modalInstance.result.then(function (selectedItem) {
	    	console.log(selectedItem);
	      var selected = selectedItem.selected;
	      var header  = selectedItem.header;
	      var action = available_commands[header][selected];
	      delete selectedItem.header;
	      delete selectedItem.selected;
	      if (selectedItem['max-count']){
	      	selectedItem['max-count'] = parseInt(selectedItem['max-count']);
	      }
	      $scope.selected = selectedItem;


	      console.log(angular.toJson(selectedItem),action );
	      commands.exec(action, angular.toJson(selectedItem));
	    }, function () {
	      $log.info('Modal dismissed at: ' + new Date());
	    });
	  };
});


application.controller('ModalInstanceCtrl', function (tools, $http, $scope, $modalInstance, inputs, $filter) {
  $scope.availableTags = [];
 	$scope.available = {};
	$scope.selected = {
		fact : '',
		selector : '',
		variable : ''
	};


	$scope.available = {
		operators : [
		 { name : 'or' },
		 { name : 'and' }
		],
		facts : [
		{ name:	"hardwareisa", example: "x86_64" , num: false },
		{ name:	"macaddress", example: "00:50:56:91:67:97" , num: false },
		{ name:	"architecture", example: "x86_64" , num: false },
		{ name:	"hardwaremodel", example: "x86_64" , num: false },
		{ name:	"processor0", example: "Intel(R) Xeon(R) CPU           E5335  @ 2.00GHz" , num: false },
		{ name:	"processorcount", example: "1" , num: true },
		{ name:	"interfaces", example: "ens32,lo" , num: false },
		{ name:	"ipaddress_ens32", example: "192.168.100.203" , num: false },
		{ name:	"macaddress_ens32", example: "00:50:56:91:67:97" , num: false },
		{ name:	"netmask_ens32", example: "255.255.255.0" , num: false },
		{ name:	"ipaddress_lo", example: "127.0.0.1" , num: false },
		{ name:	"netmask_lo", example: "255.0.0.0" , num: false },
		{ name:	"memorysize_mb", example: "2003.00" , num: true },
		{ name:	"memoryfree_mb", example: "1906.64" , num: true },
		{ name:	"facterversion", example: "2.0.1" , num: false },
		{ name:	"ipaddress", example: "192.168.1.0" , num: false },
		{ name:	"virtual", example: "vmware" , num: false },
		{ name:	"is_virtual", example: "true" , num: false },
		{ name:	"uniqueid", example: "007f0100" , num: false },
		{ name:	"blockdevice_sda_size", example: 17179869184 , num: false },
		{ name:	"blockdevice_sda_vendor", example: "VMware" , num: false },
		{ name:	"blockdevice_sda_model", example: "Virtual disk" , num: false },
		{ name:	"blockdevice_sr0_size", example: 1073741312 , num: false },
		{ name:	"blockdevice_sr0_vendor", example: "NECVMWar" , num: false },
		{ name:	"blockdevice_sr0_model", example: "VMware IDE CDR10" , num: false },
		{ name:	"blockdevices", example: "sda,sr0" , num: false },
		{ name:	"physicalprocessorcount", example: "1" , num: true },
		{ name:	"network_ens32", example: "192.168.1.0" , num: false },
		{ name:	"network_lo", example: "127.0.0.0" , num: false },
		{ name:	"boardmanufacturer", example: "Intel Corporation" , num: false },
		{ name:	"boardproductname", example: "440BX Desktop Reference Platform" , num: false },
		{ name:	"boardserialnumber", example: "None" , num: false },
		{ name:	"bios_vendor", example: "Phoenix Technologies LTD" , num: false },
		{ name:	"bios_version", example: "6.00" , num: false },
		{ name:	"bios_release_date", example: "06/22/2012" , num: false },
		{ name:	"manufacturer", example: "VMware, Inc." , num: false },
		{ name:	"productname", example: "VMware Virtual Platform" , num: false },
		{ name:	"serialnumber", example: "VMware-42 11 b0 da bd d7 7f 77-c6 10 df 9d 87 bf 28 16" , num: false },
		{ name:	"uuid", example: "4211B0DA-BDD7-7F77-C610-DF9D87BF2816" , num: false },
		{ name:	"type", example: "Other" , num: false },
		{ name:	"netmask", example: "255.255.255.0" , num: false  }
		],
		selector : [
			{ name : '=', type : 'string' } ,
			{ name : '!=', type : 'string' } ,
			{ name : 'in', type : 'array' } ,
			{ name : 'num', type : 'num' } ,
			{ name : '<', type : 'num' } ,
			{ name : '>', type : 'num' } ,
			{ name : '>=', type : 'num' } ,
			{ name : '<=', type : 'num' }
		]
	};




	$scope.selected.fact = $scope.available.facts[0];
	$scope.selected.selector = $scope.available.selector[0];
	$scope.selected.operator = $scope.available.operators[0];
  // $scope.multipleDemo = {};
  // $scope.multipleDemo.colors = ['Blue','Red'];
  // \ json

  $scope.$watch('selected.fact', function (a,b){
  	$scope.selected.variable = a.example;
  });

  $scope.inputs = inputs;
  $scope.inputs.header = 'Create';

  	function CreateArr(obj){
  		if(obj){
  			console.log(obj.variable);
  			var c = obj.variable;
  			if ( !isNaN(c)){
  				obj.variable = c;
  			}else if(obj.selector.name == "in"){
	  			if(obj.variable.indexOf(',') !== -1){
	  				obj.variable=obj.variable.split(',');
	  			}else if(obj.variable.indexOf(';') !==-1){
	  				obj.variable=obj.variable.split(';');
	  			}
  			}
  			return [obj.selector.name, ['fact', obj.fact.name], obj.variable];
  		}else{
  			return ['=',['fact','macaddress'],''];
  		}
		
	}
    switch (inputs.selected){
    	case 'policies' : 
    	$scope.inputs['root-password'] = tools.passwordgen(16);
  		$scope.inputs['max-count'] = 1;
		$http.get(config.server + '/api/collections/tags').success(function (res){
			//console.log('TAGS:::',res.items);
			angular.forEach(res.items, function (value, key){
				//console.log(value.name);
				$scope.availableTags.push(value.name);
			});
		});

		console.log($scope.selected);
		break;
		case 'brokers' : 
			$scope.brokers = ['puppet-pe'];
			$scope.inputs.configuration = {
				server : '',
				environment : ''
			};

			$scope.inputs.brokers = $scope.brokers[0];
		break;
		case 'tags':
			$scope.inputs.rule = [];
		break;
  	}

	$scope.nr=0;
	//$scope.$watch('inputs.rule.json', function (a,b){
	//	console.log($scope.inputs.rule_json);
//		$scope.inputs.rule = angular.fromJson($scope.inputs.rule_json);
//	});

	

	$scope.addArray = function (){

		console.log($scope.nr, 'arr',$scope.selected);
		var new_arr = CreateArr($scope.selected);
		var tmp = angular.copy($scope.inputs.rule);
		if($scope.nr == 0){		
			console.log('zero');
			$scope.inputs.rule = new_arr;
		}else if($scope.nr == 1 ){
			console.log('more ?');
			$scope.inputs.rule = [];
			$scope.inputs.rule.push($scope.selected.operator.name);
			$scope.inputs.rule.push(tmp);
			$scope.inputs.rule.push(new_arr);
		}else{

			$scope.inputs.rule.push(new_arr);
		}
		//$scope.inputs.rule_json = angular.toJson($scope.inputs.rule);
		$scope.nr++;
	}
	$scope.Clear=function() {
		$scope.nr=0;
		$scope.selected.fact = $scope.available.facts[0];
		$scope.selected.selector = $scope.available.selector[0];
		$scope.selected.operator = $scope.available.operators[0];
		$scope.inputs.rule=[];
	}


  $scope.ok = function () {
  	if(inputs.selected=='tags'){
  		delete $scope.inputs.rule_json;
  		console.log('we need to fix this', $scope.inputs.rule);
  		

  	}
    $modalInstance.close($scope.inputs);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});


application.service('commands', function ($http, $q, tools) {
	return {
		exec : function (command, object) {
			var data = angular.toJson(object);

			$http.post(config.server+'/api/commands/'+command, object).success(function(response){
				if (response.result) {
					console.log(response.result);
					angular
						.element(document.querySelector('#notify'))
						.removeClass('hidden alert-success alert-danger')
						.addClass('alert-success')
						.text(response.result);
				}
			}).error(function (response){
				if(response.error){
					angular
						.element(document.querySelector('#notify'))
						.removeClass('hidden alert-success alert-danger')
						.addClass('alert-danger')
						.text(response.error);
				}
			});
		}
	}
});

application.controller('GetAvailableRepos', function ($scope, $http) {
	$scope.repos = [];
	$http.get(config.server + '/api/collections/repos').success(function (data){
		angular.forEach(data.items, function (value){
			$scope.repos.push(value.name);
		});
		$scope.inputs.repo = $scope.repos[0];
	});
});

application.controller('GetAvailableBrokers', function ($scope, $http) {
	$scope.brokers = [];
	$http.get(config.server + '/api/collections/brokers').success(function (data){
		angular.forEach(data.items, function (value){
			console.log(value.name);
			$scope.brokers.push(value.name);
		});
		$scope.inputs.broker=$scope.brokers[0];
	});
});

application.controller('GetAvailableTasks', function ($scope, $http) {
	$scope.tasks = [];
	$http.get(config.server + '/api/collections/tasks').success(function (data){
		angular.forEach(data.items, function (value){

			$scope.tasks.push(value.name);
		});
		$scope.inputs.task = $scope.tasks[0];
	});
});

application.config(function ($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl : 'views/dashboard.html',
			controller : 'dashboard'
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


application.service('tools', function (){
	return {
		notify : function (msg, css){
			angular
				.element(document.querySelector('#notify'))
				.removeClass('hidden alert-info alert-danger')
				.addClass(css)
				.text(msg);
			setTimeout(function () {
				angular
					.element(document.querySelector('#notify'))
					.addClass('hidden');
			}, 5000)
		},
		passwordgen : function (length) {
			var password ="";
			var x, i=0, chars = "abcdefghijklmnoqrstzxABCDEFGHIJKLMNOQRSTZX123456789";

			while (i<length){
				x = Math.floor((Math.random() * chars.length) + 1);
				password+=chars.charAt(x);
				i++;
			}

			return password;
		}
	}
});
