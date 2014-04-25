var http =require('http');

exports.get = function (url,callback) {
	http.get(url,function(res){
		var data = "";
		res.setEncoding('utf8');
	    res.on('data', function (chunk) {
	      data += chunk;
	    });

	    res.on('end', function(){
	      if(typeof callback === 'function'){
	      	try{
	      		callback(JSON.parse(data));
	      	}catch(e){
	      		console.log("parse "+ url +" Error: \n" + e);
	      	}
	      }
	    });
	}).on('error', function(e) {
	  console.log("http get "+ url +" Error: \n" + e.message);
	});
}