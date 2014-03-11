'use strict';
var Q = require('q');
var _ = require('underscore');

module.exports = function(){
  var mongoose = require('mongoose');

  var SceneSchema = new mongoose.Schema({
    slug: {type: String, select: true, default: ''}
  });
  
  // Schema Methods
  // ----------------------------------------------------------

  // Populates a Model with complete data:
  SceneSchema.methods.toDetail = function() {
    var Layer = mongoose.model('Layer');
    var deferred = Q.defer();
    var data = this.toJSON();
    
    // Get Layer resources:
    Q(Layer.find({scene_id: this._id}).exec())
      .then(function(layers) {
        data.layers = layers;
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
    
    // Remove all related layers:
    Layer.remove({scene_id: this._id}, function(err) {
      if (err) return next(new Error(err));
      next();
    });
  });
  
  return mongoose.model('Scene', SceneSchema, 'scenes');
}();