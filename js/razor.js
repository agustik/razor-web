

var razor = {
	init : function (){
		console.log('init');
		razor.x = this;
	},
	get : function (api, callback){
		$.ajax({
			url : config.server + api,
			dataType:'json'
		}).done(function (d){
			callback(d);
		});
	},

	nodes : function (callback){
		var r = this;
			this.get('/collections/nodes', function (d){
				$.each(d.items, function (nr, node){
					r.get('/collections/nodes/'+node.name, function (d){
						callback(d);
					});
				});
			});
		}

}



$(document).ready(function (){
	razor.init();

	razor.nodes(function (d){
		console.log(d);
		var tr = "<tr>";
			tr +="<td>"+d.name+"</td>";
			tr +="<td>"+d.facts.macaddress+"</td>";
			tr +="<td>"+d.facts.physicalprocessorcount+"</td>";
			tr +="<td>"+d.facts.memorysize_mb+"</td>";
			tr +="<td>"+d.facts.blockdevice_sda_size+"</td>";
			tr +="<td>"+d.last_checkin+"</td>";
			tr +="</tr>";
		$('#nodes tbody').append(tr);
	});
});
