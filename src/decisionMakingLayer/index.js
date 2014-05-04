//资源决策层主文件
//这里面的都是对象

var executeLayer = global.layer.execute,
	resourcePool = require("./resourcePool"),
	VM = global.model.VM;

//申请资源，传入要创建虚拟机的信息
exports.apply = function(params){
	// var newVirtualMachine = new VM();
	// newVirtualMachine.extend(params);
	//step1:过滤不可达的主机
	var reachableHosts = resourcePool.getReachableHosts();
	if(reachableHosts.length==0){
		//没有可达的主机
		return ;
	}
	//step2:过滤放不下该flavor的主机
	var availableHosts = resourcePool.filterHostByFlavor(reachableHosts,params.flavor);
	if(availableHosts.length==0){
		//没有满足条件的主机，无法分配

		return;
	}
	//step2:根据不同的策略从中选出一个主机作为目标主机
	var targetHost = resourcePool.selectHost(availableHosts);
	//step3:调用接口创建虚拟机，并将新创建的虚拟机加入资源池
	executeLayer.createInstance(targetHost,params,function(newVirtualMachine){
		//step4:将新创建的虚拟机加入到资源池中
		resourcePool.addVM(newVirtualMachine);
	});
}

//调整资源，由于虚拟机过载引起
exports.adjust = function(overloadVM,callback){
	//直接调大额度
	executeLayer.scaleUp(overloadVM,callback);
}

//高可用性，由于主机宕机引起
exports.highAvaiblity = function(unReachableHost){
	//step1:过滤不可达的主机
	var reachableHosts = resourcePool.getReachableHosts();
	if(reachableHosts.length==0){
		//没有可达的主机
		return ;
	}
	//step2:剩下的所有主机容量是否够源主机的所有虚拟机的容量，如果不能满足，那么无法完全迁移，操作到此为止
	if(resourcePool.satifyCapability(reachableHosts,unReachableHost) === false){
		//剩下的主机资源不足以满足将这台主机的虚拟机全部迁移过去
		return ;
	}
	//step3:获取宕机的主机上的所有虚拟机
	var vmList = resourcePool.vmList[unReachableHost];
	for(var i=0;i<vmList.length;i++){
		//当前虚拟机
		var curVM = vmList[i];
		//step4:根据不同的策略为当前的虚拟机找到合适的迁移对象
		var targetHost = resourcePool.selectHost(reachableHosts);
		executeLayer.migrateVM(curVM,targetHost,function(){
			//step5:更新资源池中的位置
			resourcePool.changeVMPosition(curVM,unReachableHost,targetHost);
		});
	}
}