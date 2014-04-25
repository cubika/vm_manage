var RuleTR = global.model.RuleTr,
	Alarm = global.model.Alarm,
	log4j = global.utils.log4j,
	logger = log4j.getLogger("dashboard/alarm");

exports.rule = function(req,res){
	RuleTR.find({}).populate('alarm_target').exec(function(err,rules){
		if(err){
			logger.error(err);
			return;
		}
		res.render('alarm_rule',{"rules":rules});
	});
}

exports.history = function(req,res){

	Alarm.find({}).populate('rule_id').exec(function(err,alarms){
		if(err){
			logger.error(err);
			return;
		}
		//nested populate
		RuleTR.populate(alarms,{path:'rule_id.alarm_target',model:'VM'},function(err2){
			if(err2){
				logger.error(err2);
				return;
			}
			res.render('alarm_history',{"alarms":alarms});
		});
	});
}