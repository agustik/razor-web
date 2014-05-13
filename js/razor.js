
$(document).ready(function (){
	GetNodes();
});

function GetNodes(){
	$.ajax({
		url : config.server + '/collections/nodes',
		dataType:'json',
		success: function (d){
			console.log(d);
		}
	});
}