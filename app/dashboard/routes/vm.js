
var admin = global.osadmin.admin,
	compute = global.osadmin.compute,
	blockStorage = global.osadmin.blockStorage,
	update = global.utils.update,
	log4j = global.utils.log4j,
	ssh = global.utils.ssh,
	target = global.sshTarget,
	EventProxy = require('eventproxy'),
	logger = log4j.getLogger("dashboard/vm");

var services = ["VM CPU Usage","VM Mem Usage","VM Disk IO Usage","VM Net IO Usage"];

exports.manage = function(req,res){

	compute.getFlavors(function(flavorList){
		res.render('vm_manage',{flavorList: admin.flavorList, serviceList: services});
	});
}

exports.new_instance = function(req,res) {
	var proxy = new EventProxy();
	proxy.all('flavors','images','snapshots','keypairs','networks',function(flavors,images,snapshots,keypairs,networks){
		var data = {
			flavors: flavors,
			images: images,
			snapshots: snapshots,
			keypairs: keypairs,
			networks: networks
		};
		logger.info(data);
		res.render('new_instance',data);
	});
	compute.getFlavors(function(data){
		logger.debug('get flavors done' + data.flavors[0]);
		proxy.emit('flavors',data.flavors);
	});
	compute.getImages(function(data){
		logger.debug('get images done' + data.images[0]);
		proxy.emit('images',data.images);
	});
	compute.getNetworks(function(data){
		logger.debug('get networks done' + data.networks[0]);
		proxy.emit('networks',data.networks);
	});
	compute.getKeyPairs(function(data){
		logger.debug('get keypairs done' + data.keypairs[0]);
		proxy.emit('keypairs',data.keypairs);
	});
	blockStorage.getSnapshots(function(data){
		logger.debug('get snapshots done' + data.snapshots[0]);
		proxy.emit('snapshots',data.snapshots);
	})
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
	logger.debug("loading vm ...");
	update.collect_data(function(vmList){
		logger.debug(vmList);
		res.json({aaData:vmList});
	});
}