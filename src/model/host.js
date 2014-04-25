/*物理主机Model*/
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var log4j = global.utils.log4j,
	logger = log4j.getLogger("model/host");

var HostSchema = new Schema({
	name: String,
	os: String,
	//CPU信息
	cpuInfo: String,
	//CPU核数
	cpuCores: Number,
	//内存总量
	totalMem: Number,
	//已使用内存
	usedMem: Number,
	//内存单位
	memUnit: String,
	//磁盘信息
	diskInfo: String,
	eth0: String,
	eth1: String,
	// 可达性
	reachable: Boolean
},{ collection : 'host' });

var HostModel = mongoose.model('Host',HostSchema);


HostSchema.statics.updateReachable = function(hostname,reachable){
	logger.debug("update host reachable info...");
	HostModel.findOne({name:hostname},function(err,host){
		if(err){
			logger.error(err);
			return;
		}
		if(host){
			HostModel.update({_id:host._id},{$set:{reachable:reachable}});
		}
	});
}

HostSchema.statics.updateHostMem = function(hostname,totalMem,usedMem){
	logger.debug("update host mem info...");
	HostModel.findOne({name:hostname},function(err,host){
		if(err){
			logger.error(err);
			return;
		}
		if(host){
			HostModel.update({_id:host._id},{$set:{totalMem:totalMem,usedMem:usedMem}});
		}
	});
}

module.exports = HostModel;