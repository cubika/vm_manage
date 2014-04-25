/* nagios传过来的servicedata */
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var ServiceDataSchema = new Schema({
	time:{type:Date},
	hostname:{type:String},
	desc:{type:String},
	state:{type:String}
});

module.exports = mongoose.model('ServiceData',ServiceDataSchema);