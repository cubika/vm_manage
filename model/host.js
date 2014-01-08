var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var Host = new Schema({
	name: String,
	os: String,
	cpu: String,
	mem: String,
	disk: String,
	eth0: String,
	eth1: String
},{ collection : 'host' });

module.exports = mongoose.model('Host',Host);