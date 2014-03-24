var Data = require('../../../model/data');
var generator = require('../../../model/generator');

exports.main=function(req,res,next){
	var data = new Data(req.body);
	if(data.state.trim().toLowerCase()=='critical')
		generator.genAlarm(data);

	data.save(function(err){
		if(err) console.log(err);
		else res.json(data);
	});

}