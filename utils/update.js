/**
 * 定时器更新资源状态
 */

var admin = global.osadmin.admin,
	auth = global.osadmin.auth,
	compute = global.osadmin.compute,
	target = global.sshTarget,
	VM = global.model.VM,
	ssh = global.utils.ssh,
	http = global.utils.simpleHTTP,
	update = global.utils.update,
	resourcePool = global.resourcePool,
	log4j = global.utils.log4j,
	logger = log4j.getLogger("utils/update"),
	async = require('async'),
	config = require('config'),
	fs = require('fs');

var collect_data = exports.collect_data = function(data_ready_callback) {
	var tenantList,serverList,userList,flavorList,
	vmList = [];
	logger.debug("collect_data now ...");
	async.parallel([
		function(callback){
			auth.getTenants(function(){
				logger.debug("get tenant list done!");
				tenantList = admin.tenantList;
				callback(null);
			});
		},function(callback){
			auth.getAllUsers(function(){
				logger.debug("get user list done!");
				userList = admin.userList;
				callback(null);
			});
		},function(callback){
			compute.listServers(function(){
				logger.debug("get server list done!");
				serverList = admin.serverList;
				callback(null);
			});
		},function(callback){
			compute.getFlavors(function(){
				logger.debug("get flavor done!");
				flavorList = admin.flavorList;
				// logger.debug(flavorList);
				callback(null);
			});
		}
	],
	function(err,results){
		logger.debug("start to generate vm list...");
		serverList.forEach(function(server){
			var vm = {};
			vm.id = server.id;
			vm.name = server.name;
			vm.status = server.status;
			vm.host = server['OS-EXT-SRV-ATTR:host'];
			vm.alias = server['OS-EXT-SRV-ATTR:instance_name'];
			var filterFlavor = flavorList.filter(function(flavor){
				return flavor.id === server.flavor.id;
			});
			vm.flavor = (filterFlavor.length>0) ? filterFlavor[0] : "";
			var filterOwner = userList.filter(function(user){
				return user.id === server.user_id;
			});
			vm.owner = (filterOwner.length>0) ? filterOwner[0].name : "";
			var filterTenant = tenantList.filter(function(tenant){
				return tenant.id === server.tenant_id;
			});
			vm.tenant = (filterTenant.length>0) ? filterTenant[0].name : "";
			vm.ip = "";
			for(var net in server.addresses){
				for(var key in server.addresses[net]){
					var ip = server.addresses[net][key];
					if(ip.version == 4){
						if(vm.ip != "")
							vm.ip += "|";
						vm.ip += ip.addr;
					}
				}
			}
			vmList.push(vm);
		});

		// VM.refresh(vmList);
		logger.debug(vmList.length);
		vmList.forEach(function(vm){
			resourcePool.updateVM(vm.host,vm);
		});

		logger.debug("end of collect data...");
		fs.writeFile('data/vm_data.json',JSON.stringify(vmList),function(err){
			if(err) logger.error(err);
			else logger.debug("vmList saved!");
		});
		fs.writeFile('data/server_list.json',JSON.stringify(admin.serverList),function(err){
			if(err) logger.error(err);
			else logger.debug("serverList saved!");
		});
		if(typeof data_ready_callback === 'function')
			data_ready_callback(vmList);
	});
}

exports.updateHost = function(){
	//更新主机可达性
	logger.debug("updateHost Reachable ...");
	http.get('http://localhost:'+config.server.port+'/api/monitor/status/perf',function(info){
		var reachableHosts = [];
		for(var hostname in info){
			if(info[hostname] === 'UP'){
				reachableHosts.push(hostname);
				//Host.updateReachable(hostname,true);
				resourcePool.updateReachable(hostname,true);
			}else{
				//Host.updateReachable(hostname,false);
				resourcePool.updateReachable(hostname,false);
			}
		}

		//更新内存的数据
		logger.debug("updateHost Memory ...");
		http.get('http://localhost:'+config.server.port+'/api/monitor/services',function(data){
			reachableHosts.forEach(function(hostname,index){
				var memData = data[hostname]["Mem Usage"]["plugin_output"];
				var memReg = /Memory: OK Total: (\d+) MB - Used: (\d+) MB/;
				if(memReg.test(memData)){
					// Host.updateHostMem(hostname,RegExp.$1,RegExp.$2);
					resourcePool.updateHostMem(hostname,RegExp.$1,RegExp.$2);
				}
			});
		});
	});
}

exports.updateVM = function(){
	//更新虚拟机信息和flavor
	logger.debug("update vm info ...");
	collect_data();
}

