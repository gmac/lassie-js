'use strict';

var Q = require('q');
var _ = require('underscore');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Layer = require('./layer');
var Grid = require('./grid');
var Matrix = require('./matrix');

var SceneSchema = new Schema({
  grid: {type: String, select: true, default: ''},
  slug: {type: String, select: true, required: true},
  project_id: {type: Schema.Types.ObjectId, ref: 'Project', required: true}
});


// Schema Methods
// ----------------------------------------------------------

// Populates a Model with complete data:
SceneSchema.methods.toDetail = function() {
  var deferred = Q.defer();
  var data = this.toJSON();
  
  // Get scene resources:
  var getLayers = Q(Layer.find({scene_id: this._id}).exec());
  var getGrids = Q(Grid.find({scene_id: this._id}).exec());
  var getMatricies = Q(Matrix.find({scene_id: this._id}).exec());
  
  Q.all([getLayers, getGrids, getMatricies])
    .spread(function(layers, grids, matricies) {
      data.layers = layers;
      data.grids = grids;
      data.matricies = matricies;
      deferred.resolve(data);
    }, function(err) {
      deferred.reject(new Error('Error collecting scene resources.'));
    });
  
  return deferred.promise;
};

// Hooks
// ----------------------------------------------------------

SceneSchema.pre('remove', function(next) {
  // Remove all related layers:
  var layers = Q(Layer.remove({scene_id: this._id}).exec());
  var grids = Q(Grid.remove({scene_id: this._id}).exec());
  var matricies = Q(Matrix.remove({scene_id: this._id}).exec());
  
  Q.all([layers, grids, matricies])
    .then(function() {
      next();
    }, function(err) {
      next(new Error(err));
    });
});

module.exports = mongoose.model('Scene', SceneSchema, 'scenes');
