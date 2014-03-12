define(function(require) {
  
  // Imports:
  var Backbone = require('backbone');
  var ContainerView = require('containerview');
  var Modal = require('editor/common/modal');
  var Utils = require('editor/common/utils');
  var SceneState = require('../models/state');
  
  // "ADD" Matrix View
  // ----------------------------------------------------------------
  var MatrixEditView = Modal.EditView.extend({
    collection: function() {
      return SceneState.get('matricies');
    },
    
    serialize: function() {
      return {
        slug: this.$('#edit-slug').val(),
        scene_id: SceneState.get('sceneId')
      };
    }
  });
  
  // "REMOVE" Matrix View
  // ----------------------------------------------------------------
  var MatrixRemoveView = Modal.RemoveView;
  
  // Matrix View
  // ----------------------------------------------------------------
  var MatrixView = Backbone.View.extend({
    className: 'scene-matrix',
    template: Utils.parseTemplate(require('text!../tmpl/matrix.html')),
    
    initialize: function() {
      this.collection = SceneState.get('matricies');
      this.$el.html(this.template());
      this.listenTo(this.collection, 'reset add remove change:slug', this.render);
    },
    
    render: function() {
      var options = Utils.renderOptions(this.collection);
      this.$('#matrix-select').html(options).prop('disabled', !options);
    },
    
    selection: function() {
      return this.collection.get(this.$('#matrix-select').val());
    },
    
    events: {
      'click [data-ui="add"]': 'onAdd',
      'click [data-ui="edit"]': 'onEdit'
    },
    
    onAdd: function() {
      Modal.open(new MatrixEditView());
    },
    
    onEdit: function() {
      Modal.open(new MatrixEditView({model: this.selection()}));
    }
  });
  
  return MatrixView;
});