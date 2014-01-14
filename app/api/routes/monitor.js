var http = require('../../../utils/common_http'),
	config = require('config');


function get_sgroup_services_all(res,servicegroup){
		http.get(config.nagira.baseUrl+"/_objects/servicegroups",function(data1){
		var members = data1[servicegroup].members.split(',');
		var memSort = {};
		for(var i = 0; i < members.length; i++){
			if(i % 2 == 0){
				var host = members[i];
				if(memSort[host] === undefined){
					memSort[host] = [];
				}
				memSort[host].push(members[i+1]);
			}
		}
		http.get(config.nagira.baseUrl+"/_status/_full",function(data2){
			var info = {};
			for(var hostname in data2){
				if(memSort[hostname] === undefined)
					continue;
				info[hostname] = {};
				for(var i = 0; i < memSort[hostname].length; i++){
					var service = memSort[hostname][i];
					var servicestatus = data2[hostname]['servicestatus'][service];
					info[hostname][service] = {
						host_name: servicestatus.host_name,
						service_description: servicestatus.service_description,
						check_command: servicestatus.check_command,
						current_state: servicestatus.current_state,
						plugin_output: servicestatus.plugin_output,
						performance_data: servicestatus.performance_data,
						last_update: servicestatus.last_update		
					}
				}
			}

			res.json(info);
		});
	});
}

function get_sgroup_services_host(res,servicegroup,hostid){
	http.get(config.nagira.baseUrl+"/_objects/servicegroups",function(data1){
		var members = data1[servicegroup].members.split(',');
		var services = [];
		for(var i = 0; i < members.length; i++){
			if(i % 2 == 0){
				var host = members[i];
				if(host == hostid){
					services.push(members[i+1]);
				}
			}
		}
		http.get(config.nagira.baseUrl+"/_status/_full",function(data2){
			var info = {};
			for(var hostname in data2){
				if(hostname != hostid)
					continue;
				for(var i = 0; i < services.length; i++){
					var service = services[i];
					var servicestatus = data2[hostname]['servicestatus'][service];
					info[service] = {
						host_name: servicestatus.host_name,
						service_description: servicestatus.service_description,
						check_command: servicestatus.check_command,
						current_state: servicestatus.current_state,
						plugin_output: servicestatus.plugin_output,
						performance_data: servicestatus.performance_data,
						last_update: servicestatus.last_update		
					}
				}
			}

			res.json(info);
		});
	});	
}

module.exports = function(app){

	app.get('/monitor/services',function(req,res){
		http.get(config.nagira.baseUrl+"/_status/_full",function(data){
			var info = {};
			for(var host in data){
				info[host] = {};
				for(var service in data[host]['servicestatus']){
					var servicestatus = data[host]['servicestatus'][service];
					info[host][service] = {
						host_name: servicestatus.host_name,
						service_description: servicestatus.service_description,
						check_command: servicestatus.check_command,
						current_state: servicestatus.current_state,
						plugin_output: servicestatus.plugin_output,
						performance_data: servicestatus.performance_data,
						last_update: servicestatus.last_update
					};
				}
			}
			res.json(info);
		});
	});

	app.get('/monitor/services/:hostid',function(req,res){
		http.get(config.nagira.baseUrl+"/_status/"+req.params.hostid+"/_services",function(data){
			var info = {};
			for(var service in data){
				var servicestatus = data[service];
				info[service] = {
						host_name: servicestatus.host_name,
						service_description: servicestatus.service_description,
						check_command: servicestatus.check_command,
						current_state: servicestatus.current_state,
						plugin_output: servicestatus.plugin_output,
						performance_data: servicestatus.performance_data,
						last_update: servicestatus.last_update					
				};
			}
			res.json(info);
		});
	});

	app.get('/monitor/status/all',function(req,res){
		http.get(config.nagira.baseUrl+"/_status",function(data){
			var info = {};
			for(var hostname in data){
				var host = data[hostname];
				switch(host.current_state){
					case "0":
						info[hostname] = "UP";
						break;
					case "1":
						info[hostname] = "DOWN";
						break;
					case "2":
						info[hostname] = "UNREACHABLE";
						break;
				}
			}
			res.json(info);
		});
	});

	app.get('/monitor/status/perf',function(req,res){
		http.get(config.nagira.baseUrl+"/_objects/hostgroup/perf-servers",function(data){
			var info = data.members.split(",");
			res.json(info);
		});
	});

	app.get('/monitor/status/vm',function(req,res){
		http.get(config.nagira.baseUrl+"/_objects/hostgroup/vm_instances",function(data){
			var info = data.members.split(",");
			res.json(info);
		});
	});

	app.get('/monitor/perf',function(req,res){
		get_sgroup_services_all(res,"perf");
	});

	app.get('/monitor/perf/:hostid',function(req,res){
		get_sgroup_services_host(res,"perf",req.params.hostid);
	});

	app.get('/monitor/openstack',function(req,res){
		get_sgroup_services_all(res,"openstack");
	});

	app.get('/monitor/openstack/:hostid',function(req,res){
		get_sgroup_services_host(res,"openstack",req.params.hostid);
	});
}