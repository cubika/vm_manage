//资源执行层主文件
//注意传过来的参数是对象，需要调用时需要取相应的值，如id等

var compute = global.osadmin.compute,
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
	var curFlavorId = overloadVM.flavor.id, msg, index,
		flavorList = global.osadmin.admin.flavorList;
	logger.debug(flavorList);
	for(index = 0; index < flavorList.length; index++){
		if(flavorList[index].id === curFlavorId)
			break;
	}
	if(index >= flavorList.length){
		msg = "Flavor with flavorId: " + curFlavorId + " Not Found";
		callback(msg);
		return;
	}

	if(index === flavorList.length-1){
		msg = "Already the largest flavor.";
		callback(msg);
		return;
	}
	var nextFlavorId = flavorList[index+1].id;
	compute.resizeServer(overloadVM.id,nextFlavorId,function(data){
		if(data == 202){
			msg = "Success";
		}else{
			msg = data;
		}
		callback(msg);
	});
}

exports.migrateVM = function(currentVM,targetHost,callback){
	compute.liveMigrate(currentVM.id,targetHost.name,function(){
		if(typeof callback === 'function')
			callback();
	});
}