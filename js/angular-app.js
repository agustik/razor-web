var application = angular.module('razor', ['ngRoute', 'ui.bootstrap','ui.select','ngSanitize']);


application.controller('logs', function ($scope, $routeParams, $http) {
 //console.log($routeParams);	
 $http.get(config.server + '/api/collections/nodes/'+$routeParams.node+'/log').success(function (data){
 	$scope.data = data.items;
 });
});


application.config(function(uiSelectConfig) {
  uiSelectConfig.theme = 'select2';
});

application.controller('collection', function (tools, $interval, $scope, collections, commands, $interval, $http, $routeParams) {
	$scope.data=[];
	//console.log($scope);
	tools.notify($routeParams.name, 'alert-info');


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
				//console.log(data);
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
	    		repo : 'create-repo',
	    		task : 'create-task'
	    	},
	    	Update : {

	    	}
	    } 

	    modalInstance.result.then(function (selectedItem) {
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


application.controller('ModalInstanceCtrl', function (tools, $http, $scope, $modalInstance, inputs) {
  $scope.availableTags = [];
 	$scope.available = {};
	$scope.selected = {
		fact : ''
	};

	$scope.tag = ['=',[],''];

	$scope.$watch('selected.fact', function (a, b){
		if(typeof $scope.selected.fact == 'object'){
			$scope.tag[1] = ['fact',$scope.selected.fact.name];
			$scope.tag[2] = $scope.selected.fact.example;
		}
	});
	$scope.available = {
		facts : [
		{ name:	"hardwareisa", example: "x86_64" },
		{ name:	"macaddress", example: "00:50:56:91:67:97" },
		{ name:	"architecture", example: "x86_64" },
		{ name:	"hardwaremodel", example: "x86_64" },
		{ name:	"processor0", example: "Intel(R) Xeon(R) CPU           E5335  @ 2.00GHz" },
		{ name:	"processorcount", example: "1" },
		{ name:	"interfaces", example: "ens32,lo" },
		{ name:	"ipaddress_ens32", example: "192.168.100.203" },
		{ name:	"macaddress_ens32", example: "00:50:56:91:67:97" },
		{ name:	"netmask_ens32", example: "255.255.255.0" },
		{ name:	"ipaddress_lo", example: "127.0.0.1" },
		{ name:	"netmask_lo", example: "255.0.0.0" },
		{ name:	"memorysize_mb", example: "2003.00" },
		{ name:	"memoryfree_mb", example: "1906.64" },
		{ name:	"facterversion", example: "2.0.1" },
		{ name:	"ipaddress", example: "192.168.1.0" },
		{ name:	"virtual", example: "vmware" },
		{ name:	"is_virtual", example: "true" },
		{ name:	"uniqueid", example: "007f0100" },
		{ name:	"blockdevice_sda_size", example: 17179869184 },
		{ name:	"blockdevice_sda_vendor", example: "VMware" },
		{ name:	"blockdevice_sda_model", example: "Virtual disk" },
		{ name:	"blockdevice_sr0_size", example: 1073741312 },
		{ name:	"blockdevice_sr0_vendor", example: "NECVMWar" },
		{ name:	"blockdevice_sr0_model", example: "VMware IDE CDR10" },
		{ name:	"blockdevices", example: "sda,sr0" },
		{ name:	"physicalprocessorcount", example: "1" },
		{ name:	"network_ens32", example: "192.168.1.0" },
		{ name:	"network_lo", example: "127.0.0.0" },
		{ name:	"boardmanufacturer", example: "Intel Corporation" },
		{ name:	"boardproductname", example: "440BX Desktop Reference Platform" },
		{ name:	"boardserialnumber", example: "None" },
		{ name:	"bios_vendor", example: "Phoenix Technologies LTD" },
		{ name:	"bios_version", example: "6.00" },
		{ name:	"bios_release_date", example: "06/22/2012" },
		{ name:	"manufacturer", example: "VMware, Inc." },
		{ name:	"productname", example: "VMware Virtual Platform" },
		{ name:	"serialnumber", example: "VMware-42 11 b0 da bd d7 7f 77-c6 10 df 9d 87 bf 28 16" },
		{ name:	"uuid", example: "4211B0DA-BDD7-7F77-C610-DF9D87BF2816" },
		{ name:	"type", example: "Other" },
		{ name:	"netmask", example: "255.255.255.0" }
		],
		selector : [
			'=' ,
			'!=' ,
			'in' ,
			'num' ,
			'<' ,
			'>' ,
			'>=' ,
			'<='
		]
	};
  // $scope.multipleDemo = {};
  // $scope.multipleDemo.colors = ['Blue','Red'];
  $scope.inputs = inputs;
  $scope.inputs.header = 'Create';

  console.log('Inputs: ',inputs);
  if(inputs.action) {
  	
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
  		
  		$scope.inputs = data;
  		//$scope.inputs.repo = 

  	});
  }else{
  	$scope.inputs['root-password'] = tools.passwordgen(16);
  	$scope.inputs['max-count'] = 1;
  }
    switch (inputs.selected){
    	case 'policies' : 
		$http.get(config.server + '/api/collections/tags').success(function (res){
			//console.log('TAGS:::',res.items);
			angular.forEach(res.items, function (value, key){
				//console.log(value.name);
				$scope.availableTags.push(value.name);
			});
		});

		console.log($scope.selected);
		break;
  	}
  $scope.ok = function () {
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
			
			return ;
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
