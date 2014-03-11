var app = require('../index');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/lassie-test');
app.listen(4444);

var url = 'localhost:4444/api/v1';

require('./unit/scene')(url);
require('./unit/layer')(url);