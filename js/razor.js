
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

function table(nodes){
	var tr;
	$.each(nodes, function (nr, node){
		tr = "<td>"+node+"<td>";
		$('#nodes').append(tr);
	});
}
