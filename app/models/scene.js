'use strict';
var Q = require('q');
var _ = require('underscore');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = function() {

  var SceneSchema = new Schema({
    slug: {type: String, select: true, default: ''},
    grid: {type: String, select: true, default: ''}
  });
  
  // Schema Methods
  // ----------------------------------------------------------

  // Populates a Model with complete data:
  SceneSchema.methods.toDetail = function() {
    var Layer = mongoose.model('Layer');
    var Grid = mongoose.model('Grid');
    var Matrix = mongoose.model('Matrix');
    
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
    var Layer = mongoose.model('Layer');
    var Grid = mongoose.model('Grid');
    var Matrix = mongoose.model('Matrix');
    
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
  
  return mongoose.model('Scene', SceneSchema, 'scenes');
}();