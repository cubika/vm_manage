/**
 * 全局变量定义
 */

global.utils = {
	log4j: require("./utils/log.js"),
	osapi: require("./utils/OSAPI"),
	ssh: require("./utils/SSH"),
	simpleHTTP: require("./utils/simpleHTTP")
};

global.model = {
	Alarm: require("./src/model/alarm"),
	Host: require("./src/model/host"),
	serviceData: require("./src/model/serviceData"),
	RuleTr: require("./src/model/ruleTr"),
	VM: require("./src/model/vm")
};

var config = require('config'), 
	osapi = global.utils.osapi,	
	logger = global.utils.log4j.getLogger('init');

global.sshTarget = {
  host: config.sshTarget.host,
  port: config.sshTarget.port,
  username: config.sshTarget.username,
  password: config.sshTarget.password
};

/**
 * openstack相关初始化
 */
var admin = osapi(),
	auth = admin.authorize(),
	compute = admin.compute();

global.osadmin = {
	admin: admin,
	auth: auth,
	compute: compute
}

//认证一下
logger.debug("start get token ...");
global.osadmin.auth.genToken(function(){
	logger.debug("get token done!");
});

/** 
 * 其他需初始化的内容
 */
require('./utils/extend');

global.layer = {};
global.layer.execute = require("./src/executeLayer");
global.layer.decisionMaking = require("./src/decisionMakingLayer");
global.layer.alarmAnalysis = require("./src/alarmAnalysisLayer");

/**
 * 初始化资源池
 */

var resourcePool = require('./src/decisionMakingLayer/resourcePool');
var energySavingStrategy = require('./src/decisionMakingLayer/energySavingStrategy'),
	loadBalanceStrategy = require('./src/decisionMakingLayer/loadBalanceStrategy');

global.resourcePool = new resourcePool(loadBalanceStrategy);
global.strategy = {
	energySaving: energySavingStrategy,
	loadBalance: loadBalanceStrategy
};

var Host = global.model.Host;
Host.find({},function(err,hosts){
	if(err){
		logger.error(err);
		return;
	}
	for(var i = 0; i < hosts.length; i++){
		var host = hosts[i];
		global.resourcePool.addHost(host);
	}
});


/**
 * 定时同步数据
 */
var update = global.utils.update = require('./utils/update');
global.timer = {
	updateHost: setInterval(update.updateHost, 1000 * config.update.interval),
	updateVM: setInterval(update.updateVM, 1000 * config.update.interval)
};
setTimeout(update.updateVM, 2000);
