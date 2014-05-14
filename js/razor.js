

var razor = {
	init : function (){
		razor.x = this;
	},
	get : function (api, callback){
		var x, async = true;
		if (callback == false){
			async = false;
		}
		console.log(async);
		$.ajax({
			url : config.server + api,
			dataType:'json',
			async : async,
			success : function (d){
				if(async){
					callback(d);
				}else{
					x = d;
				}
			}
			
		});
		if (!async) {
			return x;
		}


	},
	post : function (api, callback){
		$.ajax({
			url : config.server + api,
			type : 'POST',
			dataType:'json',
			complete : function (a,b){
				console.log(a,b);
			}
		})
	},

	node : {
		nodes : function (callback){
		var x = [], r = this;
			razor.get('/collections/nodes', function (d){
				$.each(d.items, function (nr, node){
					x.push( razor.get('/collections/nodes/'+node.name, false));
					if(nr >= d.items.length-1){
						callback (x);
					}
				});
			});

				
		},
		log : function (node, callback){
			this.get('/collections/nodes/'+node+'/log', function (d){
				callback(d);
			});

		},
		delete : function (node, callback){
			console.log('delete');
			// razor.post('/commands/delete-node', function (a){
			// 	callback(a);
			// });
		},
		reinstall : function (node, callback){
			console.log('reinstall');
			razor.post('/commands/reinstall-node', function (a){
				callback(a);
			});
		},
		reboot : function (node, callback){
			console.log('reboot');
			// razor.post('/commands/delete-node', function (a){
			// 	callback(a);
			// });
		}
	}
	

}

var tools = {
	size : function (bytes){
		var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	   if (bytes == 0) return '0 Bytes';
	   var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
	   return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];

		//(bytes/1024/1024).toFixed(0);
	},
	fetchkey : function (key, obj){
		if(key in obj){
			return obj[key];
		}else{
			return "";
		}
	},
	status : function (status){
		var css, title;
		switch (status){
			case 'boot_wim':
				css = 'fa-spinner fa-spin';
				title = 'Not ready';
				break;
			case 'boot_local':
				css = 'fa-check';
				title = 'Ready';
				break;
			default:
				css = 'fa-question';
				title = status;
		}
		return '<i class="fa '+css+'" data-toggle="tooltip" data-trigger="tooltip" data-placement="top" title="'+status+'"></i>';
	},
	selected : function (tr){
		var x, nodes = [];
		$.each(tr, function (i, val){
			x = $(val).data('json');
			if('dhcp_mac' in x){
				x['type'] = 'node';
			}
			nodes.push(x);
		});	
		return nodes;
	}
}

$(document).ready(function (){
	razor.init();

	razor.node.nodes(function (nodes){
		$.each(nodes, function (key, d){
			var tr = "<tr data-json='"+JSON.stringify(d)+"' >";
				tr +="<td>"+d.name+"</td>";
				tr +="<td>"+d.hostname+"</td>";
				tr +="<td>"+d.facts.macaddress+"</td>";
				tr +="<td>"+d.facts.physicalprocessorcount+"</td>";
				tr +="<td>"+tools.size(d.facts.memorysize_mb*1024*1024)+"</td>";
				tr +="<td>"+tools.size(d.facts.blockdevice_sda_size)+"</td>";
				tr +="<td>"+d.last_checkin+"</td>";
				tr +="<td>"+tools.status(d.state.stage)+"</td>";
				tr +="<td>";
				$.each(d.tags, function (i, tag){
					tr +="<a href='#' tag-id='"+tag.id+"' class='label label-info'>"+tag.name+"</a>";
				});
				tr +="</td>";
				tr +="<td><a href='#' data-target='#log_modal' data-node='"+d.name+"'>Log</a></td>";
				tr +="</tr>";
			$('#nodes tbody').append(tr);
		});
		
	});
});

var last_selected = false;
$(document).on('click', '.main-list tr', function (e) {
	var element = $(this);
	if(element.hasClass('info')){
		element.removeClass('info');
	}else{
		
		if(e.ctrlKey == true){
			last_selected = element;
			element.addClass('info');
		}else if(e.shiftKey == true){
			console.log('shift')
		}else{

			element.parent().find('tr').removeClass('info');
			element.addClass('info');
		}
	}	
});

$(document).on('click', 'a[data-target="#log_modal"]', function (){

	$('#log-table tbody').empty();
	var tr, td, element = $(this),
		node = element.data('node');
		$('#log_modal .modal-title').text('Logs for: '+node);
		razor.log(node, function (log){
			$.each(log.items, function (i, entry){
				tr = "<tr>";
				
				tr += "<td>"+tools.fetchkey("event", entry)+"</td>";
				tr += "<td>"+tools.fetchkey("severity", entry)+"</td>";
				tr += "<td>"+tools.fetchkey("timestamp", entry)+"</td>";
				tr += "<td>"+tools.fetchkey("template", entry)+"</td>";
				tr += "<td>"+tools.fetchkey("repo", entry)+"</td>";
				tr += "<td>"+tools.fetchkey("task", entry)+"</td>";
				if('vars' in entry){
					tr += "<td>Update : "+tools.fetchkey("ip", entry.vars.update)+"</td>";
				}else{
					tr += "<td></td>";
				}
				tr += "<tr>";
				$('#log-table tbody').append(tr);
				
			});
		});

		$('#log_modal').modal('show');
});

$(document).on('click', '[data-action]', function (e){
	e.preventDefault();
		var element = $(this),
			action = element.data('action');

	var selected = tools.selected($('.main-list tr.info'));
	$.each(selected, function (i, item){
		razor[item.type][action](item.name);
	});

	return false;
});

