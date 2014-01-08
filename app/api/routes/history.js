var History = require("../../../model/history");

module.exports = function(app){

	app.post('/history',function(req,res){
		var history = new History(req.body);
		alarm.save(function(err){
			if(err) console.log(err);
			else res.json(alarm);
		});
	})
}