'use strict';

var Q = require('q');
var _ = require('underscore');
var error = require('./error');
var generic = require('./generic');
var Scene = require('../models/scene');

exports.getAll = generic.getAll(Scene, ['project_id']);
exports.create = generic.create(Scene);
exports.update = generic.update(Scene);
exports.destroy = generic.destroy(Scene);

// Gets a single scene:
exports.getOne = function(req, res, next) {
  Q(Scene.findById(req.params.id).exec())
    .then(function(scene) {
      return scene.toDetail();
    }, function() {
      next(new error.ResourceNotFoundError('Scene not found.'));
    })
    .then(function(detail) {
      res.send(detail);
    })
    .fail(function(err) {
      next(new error.InternalError(err));
    })
    .done();
};
