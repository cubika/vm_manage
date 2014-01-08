var http = require('http'),
	config = require('config');

exports.index = function(req,res){
	res.setHeader('Content-Type', 'image/png');
    res.setHeader('Transfer-Encoding', 'chunked');
    var completeUrl = config.pnp.imgUrl+'/'+req.url.substr(req.url.lastIndexOf('/'));
	http.get(completeUrl,function(response){
	    response.on('data', function (chunk) {
	      res.write(chunk);
	    });
	    response.on('end',function(){
	    	res.end();
	    });
	});
}