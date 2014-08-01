define(function(require) {
  
  // Imports:
  var ContainerView = require('containerview');
  var Modal = require('editor/common/modal');
  var Utils = require('editor/common/utils');
  var Projects = require('../models/project');
  
  // Implementation:

  // "ADD" controller:
  // ----------------------------------------------------------------
  var ProjectEditView = Modal.EditView.extend({
    title: 'Project',
    
    collection: function() {
      return Projects.instance();
    }
  });
  
  // "REMOVE" controller:
  // ----------------------------------------------------------------
  var ProjectRemoveView = Modal.RemoveView;
  
  // Projects controller:
  // ----------------------------------------------------------------
  var ProjectsView = ContainerView.extend({
    className: 'lassie-projects',
    template: Utils.parseTemplate(require('text!../tmpl/projects.html')),
    
    initialize: function() {
      this.collection = Projects.instance();
      this.$el.html(this.template());
      this.listenTo(this.collection, 'reset add remove change:slug', this.render);
      this.collection.fetch({reset: true});
    },
    
    render: function() {
      var options = Utils.renderOptions(this.collection);
      this.$('#models-list').html(options);
    },
    
    selection: function() {
      return this.collection.get(this.$('#models-list').val());
    },
    
    events: {
      'click [data-ui="add"]': 'onAdd',
      'click [data-ui="edit"]': 'onEdit',
      'click [data-ui="open"]': 'onOpen',
      'click [data-ui="remove"]': 'onRemove'
    },
    
    onAdd: function() {
      Modal.open(new ProjectEditView());
    },
    
    onEdit: function() {
      var project = this.selection();
      if (project) Modal.open(new ProjectEditView({model: this.selection()}));
    },
    
    onOpen: function() {
      var project = this.selection();
      if (project) location.href = '/projects/' + this.selection().get('slug') + '/setup';
    },
    
    onRemove: function() {
      var project = this.selection();
      if (project) Modal.open(new ProjectRemoveView({model: project}));
    }
  });
  
  return ProjectsView;
});