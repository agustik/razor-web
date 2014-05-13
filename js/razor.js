
$(document).ready(function (){
	GetNodes();
});


var razor = {
	nodes : function (nodes){
		var tr;
		$.each(nodes, function (nr, node){
			tr = "<td>"+node.name+"<td>";
			$('#nodes').append(tr);
		});
	}
}



function GetNodes(){
	$.ajax({
		url : config.server + '/collections/nodes',
		dataType:'json',
		success: function (d){
			razor.nodes(d.items);
		}
	});
}

