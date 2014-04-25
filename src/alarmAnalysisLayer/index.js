//告警分析层主文件

var RuleTr = global.model.RuleTr,
	Data = global.model.serviceData,
	Alarm = global.model.alarm,
	decisionMaking = global.layer.decisionMakingLayer,
	log4j = global.utils.log4j,
	logger = log4j.getLogger("alarmAnlysis");

//传过来的是级别为critical的数据
exports.generateAlarm = function(criticalServiceData){
	matchTimeRangeRule(criticalServiceData);
}

// 匹配时间范围规则
function matchTimeRangeRule(data){
	//step1:找到相应的规则并填充规则目标虚拟机
	RuleTr.findOne({alarm_key:data.desc})
		.populate({path:'alarm_target',match:{name:data.hostname}})
		.exec(function(err,ruleTr){
		if(err) {
			logger.error(err);
			return false;
		}
		if(!ruleTr) {
			logger.debug("No alarm rule matched found!");
			return false;
		}
		//step2: 找到设定时间范围之前的时间点
		var time=ruleTr.time_range;
		var t_unit=ruleTr.time_unit;
		switch(t_unit){
			case "s":
				break;
			case "min":
				time=time*60;
				break;
			case "h":
				time=time*3600;
				break;
			default:
				break;
		}
		var date = new Date(data.time-time*1000);

		//step3:设定时间范围之前必须有数据，否则认定为刚刚开始收集，数据量不足，不能进行统计
		Data.findOne({hostname:data.hostname,desc:data.desc,time:{$lt:date}},function(dataErr,beforeData){
			if(dataErr) return false;
			if(!beforeData){
				logger.debug("Data quantity is not enough!");
				return false;
			}
			//step4:统计该时间范围内的数据
			Data.find({hostname:data.hostname,desc:data.desc,time:{$gt:date}},function(dataErr,afterData){
				if(dataErr){
					logger.error(dataErr);
					return false;
				}
				var alarm_count=0,total_count=0;
				logger.debug(afterData);
				afterData.forEach(function(d){
					total_count++;
					if(d.state.trim().toLowerCase()=='critical'){
						alarm_count++;
					}
				});
				logger.debug("alarm_count is :"+alarm_count+" and total_count is :"+total_count);
				if(alarm_count==0) return false;
				//step5:计算比率，看是否满足告警条件
				if(alarm_count/total_count>=0.8){
					//step6:生成新的告警，并保存告警信息
					var alarm = new Alarm();
					alarm.rule_id=ruleTr;
					alarm.save();
					//step7: 调用决策层调大
					var vm = ruleTr.alarm_target;
					decisionMakingLayer.adjust(vm);
					return true;
				}
				else
					return false;
			});
		});
	});
}
