var Alarm = require('../../../model/alarm');
var VM = require('../../../model/vm');
var Host = require('../../../model/host');
var RuleTr = require('../../../model/ruleTr');

module.exports = function (app) {

	app.post('/alarm/rules/time_range',function(req,res){
		VM.findOne({id:req.body.alarm_target},function(e,v){
			req.body.alarm_target=v;
			var ruleTr = new RuleTr(req.body);
			ruleTr.save(function(err){
				if(err){
					console.log(err);
					return;
				}
				res.json(ruleTr);
			});
		});
	});










	var loadAlarm = function(req,res,next){
		Alarm.findOne({_id:req.params.id},function(err,alarm){
			if(err) return next(err);
			if(!alarm) return next("Couldn't find alarm with id : "+req.params.id);
			req.alarm = alarm;
			next();
		});
	}

	app.post('/alarm',function(req,res){
		var alarm = new Alarm(req.body);
		alarm.save(function(err){
			if(err) console.log(err);
			else res.json(alarm);
		});
	});

	app.put('/alarm/:id',function(req,res){
		Alarm.findOne({_id: req.params.id},function(err,alarm){
			if(err) return next(err);
			if(!alarm) return next("Couldn't find alarm with id : "+req.params.id);
			alarm.save(function(saveErr){
				if(saveErr) return next(saveErr);
				res.json(alarm);
			});
		});
	});

	app.delete('/alarm/:id',loadAlarm, function(req,res,next){
		req.alarm.remove(function(err){
			if(err) return next(err);
			res.end();
		});
	});

	app.get('/alarm',function(req,res,next){
		Alarm.find({},function(err,alarms){
			if(err) return next(err);
			res.json(alarms);
		});
	});

	app.get('/alarm/vm/:id',function(req,res,next){
		VM.findById(req.params.id,function(err, vm){
			if(err) return next(err);
			if(!vm) return next("Couldn't find VM with id : "+req.params.id);
			Alarm.find({vm: vm}, function(findErr,alarms){
				if(findErr) return next(findErr);
				res.json(alarms);
			});
		});
	});

	app.get('/alarm/host/:id',function(req,res,next){
		Host.findById(req.params.id,function(err, host){
			if(err) return next(err);
			if(!host) return next("Couldn't find host with id : "+req.params.id);
			Alarm.find({host: host}, function(findErr,alarms){
				if(findErr) return next(findErr);
				res.json(alarms);
			});
		});
	});
}