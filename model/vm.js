var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var VM = new Schema({
	UUID: String,
	name: String,
	ip: String,
	host: String,
	owner: String,	
	tenant: String,	
	status:	String,
	flavor:	String,
	instance_name: String	
});

module.exports = mongoose.model('VM',VM);