define(function(require) {
  
  var EditorView = require('editor/common/views/editor');
  var project = require('editor/common/models/project');
  var Modal = require('editor/common/modal');
  var Utils = require('editor/common/utils');
  var Scenes = require('../models/scene');

  // "ADD" controller:
  // ----------------------------------------------------------------
  var SceneEditView = Modal.EditView.extend({
    title: 'Scene',
    params: {project_id: project.id},
    
    collection: function() {
      return Scenes.instance();
    }
  });
  
  // Scene Detail view:
  // ----------------------------------------------------------------
  var SceneDetailView = Backbone.View.extend({
    template: Utils.parseTemplate(require('text!../tmpl/detail.html')),
    
    initialize: function() {
      this.$el.html(this.template(this.model.toJSON()));
    },
    
    events: {
      'click [data-ui="layout"]': 'onLayout'
    },
    
    onLayout: function() {
      location.href = location.href + '/' + this.model.get('slug');
    }
  });
  
  // Scene view:
  // ----------------------------------------------------------------
  var ScenesView = EditorView.extend({
    className: 'scene-list',
    editView: SceneEditView,
    detailView: SceneDetailView,
    collection: Scenes.instance()
  });
  
  return ScenesView;
});