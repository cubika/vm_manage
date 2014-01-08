var Host = require('../../../model/host');

module.exports = function (app) {
	app.get('/host',function(req,res,next){
		Host.find({},function(err,hosts){
			if(err) return next(err);
			res.json(hosts);
		});
	});
}