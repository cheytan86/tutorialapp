var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var morgan = require('morgan');   // morgan is request logger middleware for node.js
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var router = express.Router();
var appRoutes = require('./app/routes/api')(router);
var path = require('path');
var passport = require('passport');
var social = require('./app/passport/passport')(app,passport);

//run the middle ware before it is running something else
app.use(morgan('dev'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use('/api',appRoutes);   // will look for all the api calls in appRoutes var which is pointing to api.js in routes folder


//mongodb://chetan86:cm_delhi_86@ds159024.mlab.com:59024/tutorialapp
//mongodb://localhost:27017/tutorial
mongoose.connect('mongodb://admin:admin@ds159024.mlab.com:59024/tutorialapp',function(err){
  if(err){
    console.log('not connected to the database' + err);
  }else {
    console.log('Sucessfully connected to MongoDb');
  }
});
//all the front end request
app.get('*',function(req,res){
  res.sendFile(path.join(__dirname +'/public/app/views/index.html'));

});



app.listen(port,function(){
  console.log('Running the server on port:' + port);
});
