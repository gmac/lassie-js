'use strict';

exports.InternalError = function(err) {
  this.statusCode = 500;
  this.body = {
    code: 'InternalError',
    message: err || 'Internal Error'
  };
};

exports.ResourceNotFoundError = function(err) {
  this.statusCode = 404;
  this.body = {
    code: 'ResourceNotFound',
    message: err || 'Resource Not Found'
  };
};