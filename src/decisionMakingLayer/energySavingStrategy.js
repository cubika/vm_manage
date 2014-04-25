/**
 * 节省能源/资源利用率最大化策略
 */

//返回剩余量最小的主机
exports.selectHost = function(avaiableHosts){
	var sorted = avaiableHosts.sort(function(host1,host2){
		var host1Remain = host1.totalMem - host1.usedMem;
		var host2Remain = host2.totalMem - host2.usedMem;
		return host1Remain - host2Remain;
	});
	return sorted[0];
}