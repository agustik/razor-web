var application = angular.module('test', ['ngRoute', 'ui.bootstrap','ui.select','ngSanitize']);

application.controller('TagsCreator', function ($scope){

	$scope.available = {};
	$scope.selected = {
		fact : ''
	};

	$scope.tag = ['',[],''];

	$scope.$watch('selected.fact', function (a, b){
		if(typeof $scope.selected.fact == 'object'){
			$scope.tag[1] = ['fact',$scope.selected.fact.name];
		}
	});

	$scope.lines = [];

	$scope.snippet =
          '<p style="color:blue">an html\n' +
          '<em onmouseover="this.textContent=\'PWN3D!\'">click here</em>\n' +
          'snippet</p>';
    $scope.addHtml = function (){
    	$scope.lines.push($scope.snippets);
    	console.log($scope.lines);
    }

     $scope.CreateHtml = function() {
     		
          return $scope.snippet;
      };

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

});
