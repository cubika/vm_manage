
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var host = require('./routes/host');
var image = require('./routes/image');
var vm = require('./routes/vm');
var path = require('path');

var app = module.exports = express();

//Middleware
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(app.router);
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

//Routes
app.get('/', routes.index);
app.get('/host_static',host.host_static);
app.get('/host_perf',host.host_perf);
app.get('/host_osservice',host.host_osservice);
app.get('/monitorImg/:url',image.index);
app.get('/vm_manage',vm.manage);
app.get('/vm_perf',vm.perf);
app.get('/vm/action',vm.action);

if (!module.parent) {
  app.listen(3000);
  console.log('Express started on port 3000');
}