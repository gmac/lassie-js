'use strict';

var Q = require('q');
var _ = require('underscore');
var error = require('./error');
var generic = require('./generic');
var Layer = require('../models/layer');

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

exports.getAll = generic.getAll(Layer, ['scene_id']);
exports.getOne = generic.getOne(Layer);
exports.create = generic.create(Layer);
exports.update = generic.update(Layer);
exports.destroy = generic.destroy(Layer);