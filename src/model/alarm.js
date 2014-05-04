/*具体的告警事件*/
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var AlarmSchema = new Schema({
	trigger_time:{type:Date,default:Date.now},
	rule_id:{type:Schema.ObjectId,ref:"RuleTr"},
	action_result:{type:String,default:""}
});

var AlarmModel = mongoose.model('Alarm',AlarmSchema);

module.exports=AlarmModel;