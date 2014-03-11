'use strict';

var Q = require('q');
var _ = require('underscore');
var error = require('./error');
var Layer = require('mongoose').model('Layer');

exports.reorder = function(req, res, next) {
  var map = {};
  
  // Map array of Ids, and assemble ordering table:
  var ids = _.map(req.body, function(obj) {
    map[obj._id] = obj.order;
    return obj._id;
  });

  Q(Layer.find({_id: {$in: ids}}).exec())
    .then(function(layers) {
      _.each(layers, function(layer) {
        layer.order = map[layer._id];
        layer.save();
      });
      res.send(req.body);
    })
    .fail(function(err) {
      next(new error.InternalError(err));
    })
    .done();
};

exports.getAll = function(req, res, next) {
  Q(Layer.find({}).exec())
    .then(function(layers) {
      res.send(layers);
    })
    .fail(function(err) {
      next(new error.InternalError(err));
    })
    .done();
};

exports.getOne = function(req, res, next) {
  Q(Layer.findById(req.params.id).exec())
    .then(function(layer) {
      res.send(layer.toJSON());
    }, function() {
      next(new error.ResourceNotFoundError('Layer not found.'));
    })
    .done();
};

exports.create = function(req, res, next) {
  Q(Layer.create(req.body))
    .then(function(layer) {
      res.send(layer.toJSON());
    })
    .fail(function(err) {
      next(new error.InternalError(err));
    })
    .done();
};

exports.update = function(req, res, next) {
  Q(Layer.findById(req.params.id).exec())
    .then(function(layer) {
      _.extend(layer, req.body);
      res.send(layer.toJSON());
      layer.save();
    }, function() {
      next(new error.ResourceNotFoundError('Layer not found.'));
    });
};

exports.destroy = function(req, res, next) {
  Q(Layer.findById(req.params.id).exec())
    .then(function(layer) {
      var deferred = Q.defer();
      var data = layer.toJSON();
      
      layer.remove(function(err) {
        err ? deferred.reject(err) : deferred.resolve(data);
      });
      
      return deferred;
    }, function() {
      next(new error.ResourceNotFoundError('Layer not found.'));
    })
    .then(function(layer) {
      res.send(layer);
    })
    .fail(function(err) {
      next(new error.InternalError(err));
    })
    .done();
};