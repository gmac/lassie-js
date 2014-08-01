/**
* Lassie-js
* Project Model
*/
'use strict';

var Q = require('q');
var mongoose = require('mongoose');

var ProjectSchema = new mongoose.Schema({
  slug: {type: String, select: true, required: true, unique: true}
});


ProjectSchema.pre('remove', function(next) {
  var Asset = require('./asset');
  var Scene = require('./scene');
  
  // Remove all related models:
  var assets = Q(Asset.remove({project_id: this._id}).exec());
  var scenes = Q(Scene.remove({project_id: this._id}).exec());
  
  Q.all([assets, scenes])
    .then(function() {
      next();
    }, function(err) {
      next(new Error(err));
    });
});


module.exports = mongoose.model('Project', ProjectSchema, 'projects');
