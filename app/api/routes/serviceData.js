var serviceData = global.model.serviceData,
	alarmLayer =  global.layer.alarmAnalysis
	log4j = global.utils.log4j,
	logger = log4j.getLogger("api/serviceData");


module.exports = function(app){

	//收到监控系统的serviceData，若是critical的，就进行分析判断
	app.post('/data',function(req,res,next){
		var data = new serviceData(req.body);
		if(data.state.trim().toLowerCase()=='critical')
			alarmLayer.generateAlarm(data);

		data.save(function(err){
			if(err) logger.error(err);
			else res.json(data);
		});
	});
}