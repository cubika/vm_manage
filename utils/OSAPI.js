/*
 * Openstack API & 监控API 调用封装
 * @author : libin
 * 详见：http://api.openstack.org/api-ref.html
 */

var http = require('http'),
	_ = require('underscore');


var defaults = {
	host: '10.109.253.102',
	identity_port: 35357,//管理端口
	compute_port: 8774,
	//monitor_port: 8989,//晓江学长开发
	username: 'admin',
	password: 'password',
	tenant: 'admin'
};

function OSAPI (options) {
	this.options = _.extend({},defaults,options);
	this.token = this.tenantId = this.limits = this.servers = this.flavors = null;
}

//认证部分
// http://api.openstack.org/api-ref-identity.html#identity-admin-v2.0
OSAPI.prototype.authorize = function(){
	var self = this, opt = self.options;

	var obj = {
		//获取token
		genToken: function(callback){
			var	data = {
				 "auth":{
			        "passwordCredentials":{
			            "username":opt.username,
			            "password":opt.password
			        },
			        "tenantName":opt.tenant
			    }
			};

			self.sendRequest({
				data: data,
				method: "POST",
				port: opt.identity_port,
				path: '/v2.0/tokens'
			},function(data){
				self.token = data.access.token;
				self.tenantId = data.access.token.tenant.id;
				OSAPI.utils.cb(callback,data);
			});
			return this;
		},
		getAllUsers: function(callback){
			self.sendRequest({
				method: "GET",
				path: '/v2.0/users',
				port: opt.identity_port
			},function(data){
				self.userList = data.users;
				OSAPI.utils.cb(callback,data);
			});
			return this;
		},
		getUserByName: function(name,callback){
			self.sendRequest({
				method: "GET",
				path: '/v2.0/users?username='+name,
				port: opt.identity_port
			},function(data){
				OSAPI.utils.cb(callback,data);
			});
			return this;
		},
		getUserById: function(id,callback){
			self.sendRequest({
				method: "GET",
				path: '/v2.0/users/'+id,
				port: opt.identity_port
			},function(data){
				OSAPI.utils.cb(callback,data);
			});
			return this;
		},
		getUserRole: function(id,callback){
			self.sendRequest({
				method: "GET",
				path: '/v2.0/users/'+id+"/roles",
				port: opt.identity_port
			},function(data){
				OSAPI.utils.cb(callback,data);
			});
			return this;
		},
		getTenants: function(callback){
			self.sendRequest({
				method: "GET",
				path: '/v2.0/tenants',
				port: opt.identity_port
			},function(data){
				self.tenantList = data.tenants;
				OSAPI.utils.cb(callback,data);
			});
			return this;
		},
		getTenantByName: function(name,callback){
			self.sendRequest({
				method: "GET",
				path: '/v2.0/tenants?name='+name,
				port: opt.identity_port
			},function(data){
				OSAPI.utils.cb(callback,data);
			});
			return this;
		},
		getTenantById: function(id,callback){
			self.sendRequest({
				method: "GET",
				path: '/v2.0/tenants/'+id,
				port: opt.identity_port
			},function(data){
				OSAPI.utils.cb(callback,data);
			});
			return this;
		}
	};

	return obj;
};

//compute相关
// http://api.openstack.org/api-ref-compute.html
OSAPI.prototype.compute = function(){
	var self = this, opt = self.options;

	var obj = {
		getLimits: function(callback){
			self.sendRequest({
				method: "GET",
				path: '/v2/'+self.tenantId+'/limits',
				port: opt.compute_port
			},function(data){
				self.limits = data.limits;
				OSAPI.utils.cb(callback,data);
			});
			return this;
		},
		listServers: function(callback){
			if(self.options.tenant == "admin"){
				self.sendRequest({
					method: "GET",
					path: '/v2/'+self.tenantId+'/servers/detail?all_tenants=True',
					port: opt.compute_port
				},function(data){
					self.serverList = data.servers;
					OSAPI.utils.cb(callback,data);
				});
			}else{
				self.sendRequest({
					method: "GET",
					path: '/v2/'+self.tenantId+'/servers',
					port: opt.compute_port
				},function(data){
					self.servers = data.servers;
					OSAPI.utils.cb(callback,data);
				});
			}
			return this;
		},
		getServerDetailById: function(serverId,callback){
			self.sendRequest({
				method: "GET",
				path: '/v2/'+self.tenantId+'/servers/'+serverId,
				port: opt.compute_port
			},function(data){
				OSAPI.utils.cb(callback,data);
			});
			return this;
		},
		getServerIP: function(serverId,callback){
			self.sendRequest({
				method: "GET",
				path: '/v2/'+self.tenantId+'/servers/'+serverId+'/ips',
				port: opt.compute_port
			},function(data){
				OSAPI.utils.cb(callback,data);
			});
			return this;
		},
		pauseServer: function(serverId,callback){
			self.sendRequest({
				data:{
					"pause": null
				},
				method: "POST",
				path: '/v2/'+self.tenantId+'/servers/'+serverId+'/action',
				port: opt.compute_port
			},function(data){
				OSAPI.utils.cb(callback,data);
			});
			return this;
		},
		unpauseServer: function(serverId,callback){
			self.sendRequest({
				data:{
					"unpause": null
				},
				method: "POST",
				path: '/v2/'+self.tenantId+'/servers/'+serverId+'/action',
				port: opt.compute_port
			},function(data){
				OSAPI.utils.cb(callback,data);
			});
			return this;
		},
		suspendServer: function(serverId,callback){
			self.sendRequest({
				data:{
					"suspend": null
				},
				method: "POST",
				path: '/v2/'+self.tenantId+'/servers/'+serverId+'/action',
				port: opt.compute_port
			},function(data){
				OSAPI.utils.cb(callback,data);
			});
			return this;
		},
		resumeServer: function(serverId,callback){
			self.sendRequest({
				data:{
					"resume": null
				},
				method: "POST",
				path: '/v2/'+self.tenantId+'/servers/'+serverId+'/action',
				port: opt.compute_port
			},function(data){
				OSAPI.utils.cb(callback,data);
			});
			return this;
		},
		deleteServer: function(serverId,callback){
			self.sendRequest({
				method: "DELETE",
				path: '/v2/'+self.tenantId+'/servers/'+serverId,
				port: opt.compute_port
			},function(data){
				OSAPI.utils.cb(callback,data);
			});
			return this;
		},
		rebootServer: function(serverId,type,callback){
			self.sendRequest({
				data: {
					"reboot": {
						"type": type
					}
				},
				method: "POST",
				path: '/v2/'+self.tenantId+'/servers/'+serverId+'/action',
				port: opt.compute_port
			},function(data){
				OSAPI.utils.cb(callback,data);
			});
			return this;
		},
		// ACTIVE-->RESIZE-->VERIFY_RESIZE
		// ACTIVE-->RESIZE-->ACTIVE(on error)
		resizeServer: function(serverId,flavorId,callback){
			self.sendRequest({
				data: {
					"resize": {
						"flavorRef": flavorId
					}
				},
				method: "POST",
				path: '/v2/'+self.tenantId+'/servers/'+serverId+'/action',
				port: opt.compute_port
			},function(data){
				OSAPI.utils.cb(callback,data);
			});
			return this;
		},
		// VERIFY_RESIZE-->ACTIVE
		// VERIFY_RESIZE-->ERROR(on error)
		confirmResize: function(serverId,callback){
			self.sendRequest({
				data: {
					"confirmResize" : null
				},
				method: "POST",
				path: '/v2/'+self.tenantId+'/servers/'+serverId+'/action',
				port: opt.compute_port
			},function(data){
				OSAPI.utils.cb(callback,data);
			});
			return this;
		},
		revertResize: function(serverId,callback){
			self.sendRequest({
				data: {
					"revertResize" : null
				},
				method: "POST",
				path: '/v2/'+self.tenantId+'/servers/'+serverId+'/action',
				port: opt.compute_port
			},function(data){
				OSAPI.utils.cb(callback,data);
			});
			return this;
		},
		migrateServer: function(serverId,callback){
			self.sendRequest({
				data: {
					"migrate": null
				},
				method: "POST",
				path: '/v2/'+self.tenantId+'/servers/'+serverId+'/action',
				port: opt.compute_port
			},function(data){
				OSAPI.utils.cb(callback,data);
			});
			return this;
		},
		getFlavors: function(callback){
			self.sendRequest({
				method: "GET",
				path: '/v2/'+self.tenantId+'/flavors',
				port: opt.compute_port
			},function(data){
				self.flavorList = data.flavors;
				OSAPI.utils.cb(callback,data);
			});
			return this;
		},
		getConsole: function(serverId,callback){
			self.sendRequest({
				data: {
					"os-getVNCConsole": {
				        "type": "novnc"
				    }
				},
				method: "POST",
				path: '/v2/'+self.tenantId+'/servers/'+serverId+'/action',
				port: opt.compute_port
			},function(data){
				OSAPI.utils.cb(callback,data);
			});
			return this;
		}

	};

	return obj;
};

// //获取资源监控情况
// OSAPI.prototype.monitor = function(){
// 	var self = this, opt = self.options;

// 	var obj = {
// 		getLastest: function(params,callback){
// 			self.sendRequest({
// 				method: "GET",
// 				path: '/'+params.target+'/'+params.type+'?id='+params.id,
// 				port: opt.monitor_port
// 			},function(data){
// 				OSAPI.utils.cb(callback,data);
// 			});
// 			return this;			
// 		},
// 		getRange: function(params,callback){
// 			self.sendRequest({
// 				method: "GET",
// 				path: '/'+params.target+'/'+params.type+'?id='+params.id+'&time_from='+params.time_from+'&time_to='+params.time_to,
// 				port: opt.monitor_port
// 			},function(data){
// 				OSAPI.utils.cb(callback,data);
// 			});
// 			return this;			
// 		}
// 	};

// 	return obj;
// };


//发送请求
OSAPI.prototype.sendRequest = function(params,callback){
	var opt = this.options,
		self = this,
		request_option = {
			host: opt.host,
			method: params.method || "GET",
			port: params.port || opt.identity_port,
			path: params.path || '/',
		    headers: {
		        'Content-Type': 'application/json'
		    }
		};
	if(self.token != null){
		request_option.headers['X-Auth-Token'] = self.token.id;
	}
	if(request_option.method == "POST" || request_option.method == "PUT"){
		var request_data = JSON.stringify(params.data);
		request_option.headers['Content-Length'] = request_data.length;
	}
	var req = http.request(request_option,function(res){
		res.setEncoding('utf8');
		var chunks = '';
        res.on('data', function (chunk) {
            chunks += chunk;
        });
        res.on('end', function(){
        	if(chunks != ''){
        		try{
        			OSAPI.utils.cb(callback,JSON.parse(chunks));
        		}catch(e){
        			console.log(e);
        		}
        	}else{
        		if( typeof callback == 'function')
        			callback(res.statusCode);
        	}
        });
	});
	if(request_option.method == "POST" || request_option.method == "PUT"){
		req.write(request_data);
	}
	req.end();
}

//工具函数
OSAPI.utils = {
	cb: function(callback,data){
		if(typeof callback === 'function'){
			callback(data);
		}
	}
}

module.exports = function(options){
	return new OSAPI(options);
}