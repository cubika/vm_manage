var express    = require('express');
var app = module.exports = express();
var data = require('./routes/data');

//Middleware
app.use(app.router);
app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});


require('./routes/alarm.js')(app);
require('./routes/host.js')(app);
require('./routes/monitor.js')(app);
app.post('/data',data.main);

if (!module.parent) {
  app.listen(3000);
  console.log('Express started on port 3000');
}