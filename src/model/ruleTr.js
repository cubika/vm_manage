/*设定时间范围的告警规则*/
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var RuleTrSchema = new Schema({
	alarm_key:{type:String},
	threshold:{type:Number},
	threshold_unit:{type:String},
	time_range:{type:Number},
	time_unit:{type:String},
	alarm_target:{type:Schema.ObjectId,ref:"VM"},
	action:{type:String},
	rule_maker:{type:String,default:"admin"},
	create_time:{type:Date,default:Date.now}
});

var ruleTRModel = mongoose.model('RuleTr',RuleTrSchema);
module.exports=ruleTRModel;