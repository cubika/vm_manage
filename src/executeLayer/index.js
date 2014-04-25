//资源执行层主文件
//注意传过来的参数是对象，需要调用时需要取相应的值，如id等

var compute = global.osadmin.compute,
	flavorList = global.osadmin.admin.flavorList,
	log4j = global.utils.log4j,
	logger = log4j.getLogger("execute");

exports.createInstance = function(targetHost,params,callback){
	var options = {
		name: params.name || "newInstance",
		flavorRef: params.flavor.id || 1,
		imageRef: params.imageRef,
		network: params.network,
		host: targetHost
	};
	compute.createServerOnHost(options,function(){
		if(typeof callback === 'function')
			callback();
	});
}

exports.scaleUp = function(overloadVM,callback){
	var curFlavorId = overloadVM.flavor.id,
		index = -1;
	for(; index < flavorList.length; index++){
		if(flavorList[index].id === curFlavorId)
			break;
	}
	if(index !== -1){
		if(index === flavorList.length-1){
			logger.debug("Already the largest flavor!");
			return;
		}
		var nextFlavorId = flavorList[index+1].id;
		compute.resizeServer(overloadVM.id,nextFlavorId,function(){
			if(typeof callback === 'function')
				callback();
		});
	}
}

exports.migrateVM = function(currentVM,targetHost,callback){
	compute.liveMigrate(currentVM.id,targetHost.name,function(){
		if(typeof callback === 'function')
			callback();
	});
}