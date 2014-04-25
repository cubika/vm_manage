var Host = global.model.Host,
	log4j = global.utils.log4j,
	logger = log4j.getLogger("api/host");

module.exports = function (app) {
	/**
	 * 获取所有主机的信息
	 */
	app.get('/host',function(req,res,next){
		Host.find({},function(err,hosts){
			if(err) {
				logger.error(err);
				return next(err);
			}
			res.json(hosts);
		});
	});
}