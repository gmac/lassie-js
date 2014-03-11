'use strict';
var Q = require('q');
var _ = require('underscore');
var error = require('./error');
var Scene = require('mongoose').model('Scene');
var Layer = require('mongoose').model('Layer');

exports.create = function(req, res, next) {
  Q(Scene.create(req.body))
    .then(function(scene) {
      res.send(scene);
    }, function(err) {
      next(new error.InternalError(err));
    });
};

exports.getAll = function(req, res, next) {
  Q(Scene.find({}).exec())
    .then(function(scenes) {
      res.send(scenes);
    }, function(err) {
      next(new error.InternalError(err));
    });
};

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

exports.update = function(req, res, next) {
  Q(Scene.findById(req.params.id).exec())
    .then(function(scene) {
      _.extend(scene, req.body);
      scene.save();
      res.send(scene.toJSON());
    }, function() {
      next(new error.ResourceNotFoundError('Scene not found.'));
    });
};

exports.destroy = function(req, res, next) {
  Q(Scene.findById(req.params.id).exec())
    .then(function(scene) {
      var deferred = Q.defer();
      var data = scene.toJSON();
      
      scene.remove(function(err) {
        err ? deferred.reject(err) : deferred.resolve(data);
      });
      
      return deferred;
    }, function() {
      next(new error.ResourceNotFoundError('Scene not found.'));
    })
    .then(function(scene) {
      res.send(scene);
    })
    .fail(function(err) {
      next(new error.InternalError(err));
    })
    .done();
};