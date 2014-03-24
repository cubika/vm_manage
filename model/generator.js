var RuleTr = require('./ruleTr');
var Data = require('./data');
var Alarm = require('./alarm');

function safifyTR(data){
	RuleTr.findOne({alarm_key:data.desc})
		.populate({path:'alarm_target',match:{name:data.hostname}})
		.exec(function(err,ruleTr){
		if(err) {
			console.log(err);
			return false;
		}
		if(!ruleTr) {
			console.log("No ruleTr find!");
			return false;
		}
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
		console.log("Before: "+data.time);
		console.log("After: "+date);
		//避免收集的数据量不足的情况
		Data.findOne({hostname:data.hostname,desc:data.desc,time:{$lt:date}},function(dataErr,beforeData){
			if(dataErr) return false;
			if(!beforeData){
				console.log("Data quantity is not enough!");
				return false;
			}
			Data.find({hostname:data.hostname,desc:data.desc,time:{$gt:date}},function(dataErr,afterData){
				if(dataErr){
					console.log(dataErr);
					return false;
				}
				var alarm_count=0,total_count=0;
				console.log(afterData);
				afterData.forEach(function(d){
					total_count++;
					if(d.state.trim().toLowerCase()=='critical'){
						alarm_count++;
					}
				});
				console.log("alarm_count is :"+alarm_count+" and total_count is :"+total_count);
				if(alarm_count==0) return false;
				//满足告警条件
				if(alarm_count/total_count>=0.8){
					//保存告警信息
					var alarm = new Alarm();
					alarm.rule_id=ruleTr;
					alarm.save();
					return true;
				}
				else
					return false;
			});
		});

	});
}

exports.genAlarm=function(data){
	console.log("test generate alarm!");
	safifyTR(data);
}