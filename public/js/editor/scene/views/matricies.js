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
    title: 'Matrix',
    
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
    template: Utils.parseTemplate(require('text!../tmpl/matrix.html')),
    
    initialize: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.listenTo(this.model, 'reset add remove change:slug', this.render);
    },
    
    events: {
      'click [data-ui="remove"]': 'onRemove'
    },
    
    onRemove: function() {
      Modal.open(new MatrixRemoveView({model: this.model}));
    }
    
    //remove: function() {
      //ContainerView.prototype.remove.call(this);
      //this.view.parent.removeChild(this.view);
      //$(window).off('keydown focus blur');
    //}
  });
  
  // Matricies View
  // ----------------------------------------------------------------
  var MatriciesView = ContainerView.extend({
    className: 'scene-matrix',
    template: Utils.parseTemplate(require('text!../tmpl/matricies.html')),
    
    initialize: function() {
      // Configure collection and selected model references:
      this.collection = SceneState.get('matricies');
      this.collection.selected = null;
      
      // Populate template and create detail view container:
      this.$el.html(this.template());
      this.detail = this.createSubcontainer('[data-ui="matrix"]');

      // Monitor changes:
      this.listenTo(this.collection, 'reset add remove change:slug', this.render);
    },
    
    // Gets a reference to the currently selected model:
    selection: function() {
      return this.collection.get(this.$('#matrix-select').val()) || this.collection.at(0) || null;
    },
    
    // Renders the selection list and updates the detail view:
    render: function() {
      var options = Utils.renderOptions(this.collection);
      this.$('#matrix-select').html(options).prop('disabled', !options);
      this.$('[data-ui="edit"]').prop('disabled', !options);
      this.update();
    },
    
    // Updates the detail container with the currently selected model data:
    update: function() {
      var selection = this.selection();

      if (!selection) {
        this.collection.selected = null;
        this.detail.close();
      }
      else if (selection.cid !== this.collection.selected) {
        this.collection.selected = selection.cid;
        this.detail.open(new MatrixView({model: selection}));
      }
    },
    
    events: {
      'change #matrix-select': 'update',
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
  
  return MatriciesView;
});