var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var History = new Schema({
	level: String,
	vm: {type: Schema.ObjectId, ref: 'VM'},
	trigger_time: { type: Date, default: Date.now },
	info: String
});

module.exports = mongoose.model('History',History);