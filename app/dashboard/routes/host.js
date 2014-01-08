var http = require('../../../utils/common_http'),
	Host = require('../../../model/host'),
	config = require('config'),
	async = require('async');

require('../../../utils/extend');

exports.host_static = function(req,res,next){
	async.parallel({
		host: function(callback){
			Host.find({},function(err,hosts){
				if(err) return next(err);
				callback(null,hosts);
			});
		},
		status: function(callback){
			http.get('http://localhost:'+config.server.port+'/api/monitor/status',function(response){
				callback(null,response);
			});
		}
	},function(err,results){
		for(var i = 0;i < results.host.length; i++){
			results.host[i]['status'] = results.status[results.host[i].name];
			//results.host[i]['status'] = ['UP','DOWN','UNREACHABLE'][Math.round(Math.random()*100)%3];
		}
		res.render('host_static',{hosts: results.host});
	});
}

exports.host_perf = function(req,res,next){
		http.get('http://localhost:'+config.server.port+'/api/monitor/status',function(response){
			var hosts = [];
			for(var host in response){
				if(response[host] == "UP")
					hosts.push(host);
			}
			var current_host = (req.query.host) ? (req.query.host) : hosts[0];
			var span = (req.query.span) ? (req.query.span) : "4hour";
			http.get(config.pnp.apiUrl+'/host_'+span+'/'+current_host,function(data){
				var pnpdata = {};
				data.forEach(function(obj){
					var disp = obj.MACRO.DISP_SERVICEDESC;
					if(disp == "KVM running vm list" || disp == "Host Perfdata")
						return;
					if(!pnpdata[disp]){
						pnpdata[disp] = [];
					}
					pnpdata[disp].push({
						source: obj.SOURCE,
						service_desc: obj.MACRO.SERVICEDESC,
						time_start: obj.TIMERANGE.start,
						time_end: obj.TIMERANGE.end,
						time_title: obj.TIMERANGE.title,
						datasource: obj.ds_name,
						image_url: obj.IMAGE_URL
					});
				});

				res.render('host_perf',{hosts: hosts, pnpdata: pnpdata, current_host: current_host});
			});
		});	
}

exports.host_osservice = function(req,res,next){
	http.get('http://localhost:'+config.server.port+'/api/monitor/openstack',function(response){
		res.render('host_osservice',{services: response, hosts: Object.keys(response)});
	});
}