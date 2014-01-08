
var OSAPI = require('../../../utils/OSAPI.js'),
	async = require('async'),
	fs = require('fs');

var admin = OSAPI(),
		auth = admin.authorize(),
		compute = admin.compute();

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
		console.log("end of collect data...");
		fs.writeFile('data/vm_data.json',JSON.stringify(vmList),function(err){
			if(err) console.log(err);
			else console.log("vmList saved!");
		});
		if(typeof data_ready_callback === 'function')
			data_ready_callback(vmList);
	});
}

exports.manage = function(req,res){
	collect_data(function(vmList){
		res.render('vm_manage',{vmList: vmList, flavorList: admin.flavorList});
	})
}

exports.perf = function(req,res){

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
		case 'getConsole':
			compute.getConsole(id,function(data){
				var url = data.console.url;
				res.redirect(url);
			});
			break;
	}
}