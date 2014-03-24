
var OSAPI = require('../../../utils/OSAPI.js'),
	async = require('async'),
	ssh = require('../../../utils/SSH.js'),
	VM = require('../../../model/vm'),
	config = require('config'),
	fs = require('fs');

var admin = OSAPI(),
		auth = admin.authorize(),
		compute = admin.compute();

var target = {
  host: config.sshTarget.host,
  port: config.sshTarget.port,
  username: config.sshTarget.username,
  password: config.sshTarget.password
};

var services = ["VM CPU Usage","VM Mem Usage","VM Disk IO Usage","VM Net IO Usage"];

//generate Openstack API token
console.log("start get token ...");
auth.genToken(function(){
	console.log("get token done!");
});


function collect_data (data_ready_callback) {
	var tenantList,serverList,userList,flavorList,
	vmList = [];

	async.parallel([
		function(callback){
			auth.getTenants(function(){
				console.log("get tenant list done!");
				tenantList = admin.tenantList;
				callback(null);
			});
		},function(callback){
			auth.getAllUsers(function(){
				console.log("get user list done!");
				userList = admin.userList;
				callback(null);
			});
		},function(callback){
			compute.listServers(function(){
				console.log("get server list done!");
				serverList = admin.serverList;
				callback(null);
			});
		},function(callback){
			compute.getFlavors(function(){
				console.log("get flavor done!");
				flavorList = admin.flavorList;
				callback(null);
			});
		}
	],
	function(err,results){
		console.log("start to generate vm list...");
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
			vm.flavor = (filterFlavor.length>0) ? filterFlavor[0].name : "";
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
		VM.refresh(vmList);
		console.log("end of collect data...");
		fs.writeFile('data/vm_data.json',JSON.stringify(vmList),function(err){
			if(err) console.log(err);
			else console.log("vmList saved!");
		});
		fs.writeFile('data/server_list.json',JSON.stringify(admin.serverList),function(err){
			if(err) console.log(err);
			else console.log("serverList saved!");
		});
		if(typeof data_ready_callback === 'function')
			data_ready_callback(vmList);
	});
}

exports.manage = function(req,res){
	compute.getFlavors(function(flavorList){
		res.render('vm_manage',{flavorList: admin.flavorList, serviceList: services});
	});
}

exports.action = function(req,res){
	var id = req.query.id,
		action = req.query.action;
	switch(action){
		case 'pause':
			compute.pauseServer(id,function(statusCode){
				res.json({"code":statusCode});
			});
			break;
		case 'unpause':
			compute.unpauseServer(id,function(statusCode){
				res.json({"code":statusCode});
			});
			break;
		case 'suspend':
			compute.suspendServer(id,function(statusCode){
				res.json({"code":statusCode});
			});
			break;
		case 'resume':
			compute.resumeServer(id,function(statusCode){
				res.json({"code":statusCode});
			});
			break;
		case 'sreboot':
			compute.rebootServer(id,"SOFT",function(statusCode){
				res.json({"code":statusCode});
			});
			break;
		case 'hreboot':
			compute.rebootServer(id,"HARD",function(statusCode){
				res.json({"code":statusCode});
			});
			break;
		case 'terminate':
			compute.deleteServer(id,function(statusCode){
				res.json({"code":statusCode});
			});
			break;
		case 'resize':
			if(!req.query.flavorId){
				return res.json({"code":"You must provide flavorId"});
			}
			compute.resizeServer(id,req.query.flavorId,function(statusCode){
				res.json({"code":statusCode});					
			});
			break;
		case 'confirmResize':
			compute.confirmResize(id,function(statusCode){
				res.json({"code":statusCode});
			});
			break;
		case 'revertResize':
			compute.revertResize(id,function(statusCode){
				res.json({"code":statusCode});
			});
			break;
		case 'migrate':
			compute.migrateServer(id,function(statusCode){
				res.json({"code":statusCode});
			});
			break;
		case 'liveMigrate':
			if(!req.query.hostId){
				return res.json({"code":"You must provide target host"});
			}
			compute.liveMigrate(id,req.query.hostId,function(statusCode){
				res.json({"code":statusCode});
			});
			break;
		case 'getConsole':
			compute.getConsole(id,function(data){
				var url = data.console.url;
				res.redirect(url);
			});
			break;
		case 'add':
			var name = req.query.name,
				alias = req.query.alias,
				ip = req.query.ip,
				server = req.query.server;
			if(!name || !alias || !ip || !server){
				return res.json({"data":"No empty parameter allowed!"});
			}
			name.replace(/\s+/g,"_");
			var command = '/home/libin/script/add_vm_monitor.sh '+ name +' '+ alias +' '+ ip +' '+ server;
			ssh.once(target,command,function(data){
				res.json({"data":data});
			});
			break;
		case 'remove':
			var alias = req.query.alias,
				server = req.query.server;
			if( !alias || !server){
				return res.json({"data":"No empty parameter allowed!"});
			}
			var command = '/home/libin/script/remove_vm_monitor.sh '+ alias +' '+ server;
			ssh.once(target,command,function(data){
				res.json({"data":data});
			});
			break;
	}
}

exports.load = function(req,res){
	collect_data(function(vmList){
		res.json({aaData:vmList});
	});
}