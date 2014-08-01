'use strict';

var Q = require('q');
var _ = require('underscore');
var error = require('./error');
var Project = require('../models/project');
var Scene = require('../models/scene');

function editorPage(req, res, next) {
  var slug = req.params.slug;
  var path = req.route.path.split('/').pop();
  var title = path[0].toUpperCase() + path.slice(1);
  
  Q(Project.findOne({slug: slug}).exec())
    .then(function(project) {
      res.render('editor', {
        path: path,
        title: title,
        project_slug: slug,
        project_id: project._id
      });
    })
    .fail(function() {
      next();
    });
};

exports.setup = editorPage;
exports.assets = editorPage;
exports.items = editorPage;
exports.combos = editorPage;
exports.scenes = editorPage;

exports.projects = function(req, res) {
  res.render('projects');
};

exports.layout = function(req, res) {
  var projectSlug = req.params.project;
  
  Q(Project.findOne({slug: projectSlug}).exec())
    // Find project:
    .then(function(project) {
      return Q(Scene.findOne({
        project_id: project._id,
        slug: req.params.scene
      }).exec());
    })
    // Then find scene:
    .then(function(scene) {
      res.render('layout', {
        project_slug: projectSlug,
        scene_slug: scene.slug,
        scene_id: scene._id
      });
    })
    .fail(function() {
      next();
    });
};
