var Alarm = global.model.Alarm, VM = global.model.VM, 
	Host = global.model.Host, RuleTr = global.model.RuleTr, 
	config = require('config'), ssh = global.utils.ssh,
	target = global.sshTarget, log4j = global.utils.log4j,
	logger = log4j.getLogger("api/alarm");

module.exports = function (app) {

	/**	
	 * 添加一条时间段告警规则
	 */
	app.post('/alarm/rules/time_range',function(req,res){
		//找到目标虚拟机
		VM.findOne({id:req.body.alarm_target},function(e,v){
			req.body.alarm_target=v;
			//TODO:这里的threshold还需要根据不同的单位变化而变化
			var host = v.host, alias = v.alias, threshold = req.body.threshold, type = req.body.alarm_key;
			type = type.split(" ")[1].toLowerCase();
			//修改门限值
			var command = '/home/libin/script/modify_threshold.sh '+ host +' '+ alias +' '+ type + ' ' + threshold;
			logger.debug(command);
			ssh.once(target,command,function(data){
				logger.info(data);
			});
			//创建新的规则并保存
			var ruleTr = new RuleTr(req.body);
			ruleTr.save(function(err){
				if(err){
					logger.error(err);
					return;
				}
				res.json(ruleTr);
			});
		});
	});

	/**
	 * 添加一条时间段告警规则
	 */
	app.get('/alarm/rules/time_range',function(req,res){
		RuleTr.find({}).populate('alarm_target').exec(function(err,rules){
			if(err){
				logger.error(err);
				return;
			}
			res.json(rules);
		});
	});

	/**
	 * 获取在某台虚拟机上定义的告警规则
	 */
	app.get('/alarm/rules/time_range/:vmid',function(req,res){
		RuleTr.find({}).populate('alarm_target').exec(function(err,rules){
			if(err){
				logger.error(err);
				return;
			}
			res.json(rules);
		});
	});

	/**
	 * 获取告警历史
	 */
	app.get('/alarm/history',function(req,res){
		Alarm.find({}).populate('rule_id').exec(function(err,alarms){
			if(err){
				logger.error(err);
				return;
			}
			//nested populate
			RuleTr.populate(alarms,{path:'rule_id.alarm_target',model:'VM'},function(err2){
				if(err2){
					logger.error(err2);
					return;
				}
				res.json(alarms);
			});
		});
	});

	/**
	 * 获取时间范围内的告警历史
	 */
	app.get('/alarm/history/:from/:to',function(req,res){
		
		Alarm.find({"trigger_time":{$lt:req.params.to,$gt:req.params.from}})
			.populate('rule_id').exec(function(err,alarms){
			if(err){

				logger.error(err);
				return;
			}
			//nested populate
			RuleTr.populate(alarms,{path:'rule_id.alarm_target',model:'VM'},function(err2){
				if(err2){
					logger.error(err2);
					return;
				}
				res.json(alarms);
			});
		});

	});

}