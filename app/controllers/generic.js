'use strict';

var Q = require('q');
var _ = require('underscore');
var error = require('./error');

// Gets all models of the controller's managed model class:
// allows a query formatting function to be provided.
exports.getAll = function(Model, query) {
  
  // Create a query function for defining a query:
  function queryFor(req) {
    if (!query) return {};
    if (_.isArray(query)) return _.pick(req.query, query);
    if (_.isFunction(query)) return query(req);
  }
  
  return function(req, res, next) {
    Q(Model.find(queryFor(req)).exec())
      .then(function(models) {
        res.send(models);
      })
      .fail(function(err) {
        next(new error.InternalError(err));
      })
      .done();
  };
};

// Gets a single model of the controller's managed model class:
exports.getOne = function(Model) {
  return function(req, res, next) {
    Q(Model.findById(req.params.id).exec())
      .then(function(model) {
        res.send(model.toJSON());
      }, function() {
        next(new error.ResourceNotFoundError('Model not found.'));
      })
      .done();
  };
};

// Creates a new model instance within the controller's managed model collection:
exports.create = function(Model) {
  return function(req, res, next) {
    Q(Model.create(req.body))
      .then(function(model) {
        res.send(model.toJSON());
      })
      .fail(function(err) {
        next(new error.InternalError(err));
      })
      .done();
  };
};

exports.update = function(Model) {
  return function(req, res, next) {
    Q(Model.findById(req.params.id).exec())
      .then(function(model) {
        _.extend(model, req.body);
        res.send(model.toJSON());
        model.save();
      }, function() {
        next(new error.ResourceNotFoundError('Model not found.'));
      });
  };
};

exports.destroy = function(Model) {
  return function(req, res, next) {
    Q(Model.findById(req.params.id).exec())
      .then(function(model) {
        var deferred = Q.defer();
        var data = model.toJSON();
      
        model.remove(function(err) {
          err ? deferred.reject(err) : deferred.resolve(data);
        });
      
        return deferred;
      }, function() {
        next(new error.ResourceNotFoundError('Model not found.'));
      })
      .then(function(model) {
        res.send(model);
      })
      .fail(function(err) {
        next(new error.InternalError(err));
      })
      .done();
  };
};