/**
 * 资源池类
 * 维护一个所有主机的列表hostList: [{name:"host1",cpu:"xxx1",mem:"xxx1",...},{name:"host2",cpu:"xxx2",mem:"xxx2",...}]
 * 维护所有的虚拟机：{"host1":[vm11,vm12,vm13,...],"host2":[vm21,vm22,vm23...]}
 */

var VM = global.model.VM,
	decisionMaking = global.layer.decisionMakingLayer,
	log4j = global.utils.log4j,
	logger = log4j.getLogger("resourcePool");

function ResourcePool(strategy){
	this.hostList = []; //一维数组，保存所有的主机
	this.vmList = {}; //对象，key为主机的名字，value为虚拟机列表
	this.strategy = strategy; //两种策略
}

// 将主机加入资源池
ResourcePool.prototype.addHost = function(host){
	logger.debug("addHost " + host.name);
	this.hostList.push(host);
	this.vmList[host.name] = [];
}

// 将虚拟机加入资源池
ResourcePool.prototype.addVM = function(vm){
	logger.debug("addVM "+ vm.name);
	var hostname = vm.host;
	if(this.vmList[hostname] === undefined){
		//没有这个主机
		logger.error("no host match for vm");
		return;
	}
	this.vmList[hostname].push(vm);
}

//更新主机可达性
ResourcePool.prototype.updateReachable = function(hostname,reachable){
	for(var i=0;i<this.hostList.length;i++){
		if(this.hostList[i].name == hostname){
			var host = this.hostList[i];
			logger.debug("host to be updateReachable: " + hostname);
			host.reachable = reachable;
			// 主机不可达，进入高可用性策略
			// if(reachable === false){
			// 	decisionMaking.highAvaiblity(hostname);
			// }
			host.save(function(err){
				if(err){
					logger.error(err);
					return;
				}
				logger.debug("Host reachable updated!");
			})
			return;
		}
	}
}

//更新主机内存
ResourcePool.prototype.updateHostMem = function(hostname,totalMem,usedMem){
	for(var i=0;i<this.hostList.length;i++){
		if(this.hostList[i].name == hostname){
			var host = this.hostList[i];
			logger.debug("host to be updateVM: " + hostname);
			host.totalMem = totalMem;
			host.usedMem = usedMem;
			host.save(function(err){
				if(err){
					logger.error(err);
					return;
				}
				logger.debug("Host " + hostname + " Memory updated!");
			});
			return;
		}
	}
}

ResourcePool.prototype.updateVM = function(host,vm){
	logger.debug("updateVM " + vm.id + " on " + host);
	var _this = this;
	var vmOnSameHost = this.vmList[host];
	if(vmOnSameHost == undefined) return;
	logger.debug(vmOnSameHost.length + " vms on the same host");
	for(var i = 0, len = vmOnSameHost.length; i < len; i++){
		// logger.debug("currentVM" + vmOnSameHost[i].id);
		if(vmOnSameHost[i].id === vm.id){
			var targetVM = vmOnSameHost[i];
			//拷贝
			for(var key in vm){
				targetVM[key] = vm[key];
			}
			// 保存
			targetVM.save(function(err){
				if(err){
					logger.error(err);
					return;
				}
				logger.debug("vm " + vm.name + " updated!");
			})
			return;
		}
	}
	logger.debug("new vm found!");
	var newVM = new VM(vm);
	newVM.save(function(err2,v){
		if(err2){
			logger.error(err2);
			return;
		}
		_this.addVM(v);
		logger.debug("vm " + vm.name + " saved!");
	});
}

//获取所有可达的主机
ResourcePool.prototype.getReachableHosts = function(){
	return this.hostList.filter(function(host){
		return host.reachable === true;
	});
}

//过滤容量小于flavor的主机
ResourcePool.prototype.filterHostByFlavor = function(hostList,flavor){
	return this.hostList.filter(function(host){
		// return host.cpu>=flavor.vcpu && host.mem>flavor.ram && host.diskTotal>flavor.disk;
		return host.cpuCores>=flavor.vcpus && (host.totalMem-host.usedMem)>flavor.ram;
	});
}

//根据策略挑选主机
ResourcePool.prototype.selectHost = function(avaiableHosts){
	return this.strategy.selectHost(avaiableHosts);
}

//改变虚拟机的位置
ResourcePool.prototype.changeVMPosition = function(vm,originHost,currentHost){
	var vmToBeMigrated = this.vmList[originHost];
	var index = -1;
	for(var i=0;i<vmToBeMigrated.length;i++){
		if(vmToBeMigrated[i] == vm){
			index = i;
			break;
		}
	}
	if(index !== -1){
		vmToBeMigrated.splice(index,1);
		this.vmList[currentHost].push(vm);
	}
}

//剩下的主机是否满足迁移的要求
ResourcePool.prototype.satifyCapability = function(reachableHosts,unreachableHost){
	var memRequired = 0, memRemained = 0;
	for(var i=0;i<this.vmList[unreachableHost].length;i++){
		memRequired += this.vmList[unreachableHost][i].flavor.ram;
	}
	for(var i=0;i<reachableHosts.length;i++){
		memRemained += (reachableHosts[i].mem - reachableHosts[i].used);
	}
	if(memRequired >= memRemained){
		return false;
	}else{
		return true;
	}
}


module.exports = ResourcePool;
