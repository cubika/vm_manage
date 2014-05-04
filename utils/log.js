/* Logger Utility */

/**
 * Logger definition
 */

var log4js = require('log4js');
var levels = ["INFO","DEBUG","ERROR"]
var level = "INFO";
var events = require('events')
var dynamicLogging = new events.EventEmitter()
var u = require("util")

dynamicLogging.setMaxListeners(50)

log4js.configure({
  appenders: [
    { type: 'console' },
    { type: 'file', filename: 'logs/output.log', "maxLogSize": 204800 }
  ]
});

exports.getLogger = function(name) {
	var logger = log4js.getLogger(name);
	logger.setLevel(level);
    dynamicLogging.on("levelChange",function(newLevel){
        console.log(u.format("logger %s -- > Level : %s ", name, newLevel))
        logger.setLevel(newLevel)
    })
    return logger;
};

var hasLevel = function(levelName){
    var i
    for(i=0; i<levels.length;i++){
        if (levelName === levels[i]) {
            return true
        }
    }
    return false
}

var getLevel = function(){
    return level
}

var resetLevel = function(){
    dynamicLogging.emit("levelChange", getLevel())
}
var setLevel = function(_level) {
	level =  _level;
};
exports.log4js = log4js;
exports.setLevel = setLevel
exports.hasLevel = hasLevel
exports.getLevel = getLevel
exports.resetLevel = resetLevel
