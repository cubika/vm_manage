var http       = require('http');
var express    = require('express');
var config     = require('config');
var mongoose   = require('mongoose');
var apiApp     = require('./app/api/app');
var dashboardApp = require('./app/dashboard/app');

var app = module.exports = express();
var server = http.createServer(app);

app.use(app.router);
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

//初始化连接
mongoose.connect(config.mongodb.connectionString || 'mongodb://' + config.mongodb.server +'/' + config.mongodb.database);
//连接失败
mongoose.connection.on('error', function (err) {
  console.error('MongoDB error: ' + err.message);
  console.error('Make sure a mongoDB server is running and accessible by this application');
  process.exit(1);
});

app.use('/api', apiApp);
app.use('/dashboard', dashboardApp);

module.exports = app;
var port = process.env.PORT || config.server.port;
server.listen(port, function(){
	console.log("Express server listening on port %d in %s mode", port, app.settings.env);
});