/*虚拟机Model*/
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var FlavorObj = {
	id: String,
	name: String,
	vcpus: Number,
	ram: Number,
	disk: Number
};

var VMSchema = new Schema({
	id: String,
	name: String,
	ip: String,
	host: String,
	owner: String,	
	tenant: String,	
	status:	String,
	flavor:	FlavorObj,
	alias: String	
});

var VMModel = mongoose.model('VM',VMSchema);

//刷新虚拟机信息，如果没有则添加，如果有则更新
VMSchema.statics.refresh = function(vmList){
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

module.exports = VMModel;