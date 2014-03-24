
var RuleTR = require('../../../model/ruleTr'),
	Alarm = require('../../../model/alarm');

exports.rule = function(req,res){
	RuleTR.find({}).populate('alarm_target').exec(function(err,rules){
		if(err){
			console.log(err);
			return;
		}
		res.render('alarm_rule',{"rules":rules});
	});
}

exports.history = function(req,res){

	Alarm.find({}).populate('rule_id').exec(function(err,alarms){
		if(err){
			console.log(err);
			return;
		}
		//nested populate
		RuleTR.populate(alarms,{path:'rule_id.alarm_target',model:'VM'},function(err2){
			if(err2){
				console.log(err2);
				return;
			}
			res.render('alarm_history',{"alarms":alarms});
		});
	});
}