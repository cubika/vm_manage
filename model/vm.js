/*虚拟机Model*/
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var VMSchema = new Schema({
	id: String,
	name: String,
	ip: String,
	host: String,
	owner: String,	
	tenant: String,	
	status:	String,
	flavor:	String,
	alias: String	
});

VMSchema.statics.refresh = function(vmList){
	// VMModel.remove({},function(err){
	// 	if(err){
	// 		console.log(err);
	// 		return;
	// 	}
	// 	vmList.forEach(function(vm){
	// 		var newVM = new VMModel(vm);
	// 		newVM.save(function(saveErr){
	// 			if(saveErr) console.log(saveErr);
	// 		});
	// 	});
	// });
	//http://stackoverflow.com/questions/7267102/how-do-i-update-upsert-a-document-in-mongoose
	vmList.forEach(function(vm){
		VMModel.findOne({id:vm.id},function(err,v){
			if(!v){
				var newVM = new VMModel(vm);
				newVM.save();
			}else{
				VMModel.update({id:vm.id},vm,{upsert:true});
			}
		});
	});
}

var VMModel = mongoose.model('VM',VMSchema);

module.exports = VMModel;