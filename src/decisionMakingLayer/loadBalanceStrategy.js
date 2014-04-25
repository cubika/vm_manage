/**
 * 负载均衡策略
 */


//返回已使用比率最小的主机
exports.selectHost = function(avaiableHosts){
	var sorted = avaiableHosts.sort(function(host1,host2){
		return host1.usedMem/host1.totalMem - host2.usedMem/host2.totalMem;
	});
	return sorted[0];
}