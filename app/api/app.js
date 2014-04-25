var express    = require('express');
var app = module.exports = express();

//Middleware
app.use(app.router);
app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});


require('./routes/alarm')(app);
require('./routes/host')(app);
require('./routes/monitor')(app);
require('./routes/serviceData')(app);

if (!module.parent) {
  app.listen(3000);
  console.log('Express started on port 3000');
}