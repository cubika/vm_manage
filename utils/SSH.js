//SSH initialization
var Connection = require('ssh2');

exports.once = function(target,command,callback){
	var c = new Connection();
	c.on('error', function(err) {
	  console.log('Connection :: error :: ' + err);
	});
	c.on('end', function() {
	  console.log('Connection :: end');
	});
	c.on('close', function(had_error) {
	  console.log('Connection :: close');
	});
	c.connect(target);
	c.on('ready',function() {
		console.log('Connection :: ready');
		c.exec(command,function(err,stream){
			if (err) throw err;
			var result = "";
		    stream.on('data', function(data, extended) {
		      result += (extended === 'stderr' ? 'STDERR: ' : 'STDOUT: ') + data;
		    });
		    stream.on('close', function() {
		      console.log('Stream :: close');
		      if(typeof callback == 'function')
		      	callback(result);
		    });
		    stream.on('exit', function(code, signal) {
		      console.log('Stream :: exit :: code: ' + code + ', signal: ' + signal);
		      c.end();
		    });

		});
	});
}