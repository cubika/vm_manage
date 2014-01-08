var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var Alarm = new Schema({
	vm: {type:Schema.ObjectId, ref:'VM', required:true},
	host: {type:Schema.ObjectId, ref:'Host', required:true},
	create_time: {type: Date, default: Date.now},
	update_time: {type: Date, default: Date.now},
	item: {type:String,required:true},
	threshold: {type:Number,required:true},
	action: {type:String,required:true}
});

module.exports = mongoose.model('Alarm',Alarm);