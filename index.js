'use strict';

// Imports:
var express = require('express');
var mongoose = require('mongoose');

// Models
require('./app/models/scene');
require('./app/models/layer');

// Implementation:
var app = express();

app
  .use(express.static(__dirname + '/public'))
  .use(express.bodyParser())
  .use(express.methodOverride())
  .use(app.router)
  .use(function(err, req, res, next) {
    res.send(err.statusCode, err.body);
  });

//app.get('/editor', function(req, res) {
  //res.render(__dirname + '/public/editor.html');
//});

// Require routes:
require('./config/routes')(app);

// Listen:
if (require.main === module) {
  mongoose.connect('mongodb://localhost/lassie');
  app.listen(3000, function() {
    console.log('Lassie running on port 3000');
  });
}

module.exports = app;