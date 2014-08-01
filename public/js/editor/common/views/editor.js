define(function(require) {
  
  // Imports:
  var ContainerView = require('containerview');
  var Modal = require('editor/common/modal');
  var Utils = require('editor/common/utils');
  
  var LassieEditorView = ContainerView.extend({
    el: '#lassie',
    editView: Modal.EditView,
    removeView: Modal.RemoveView,
    detailView: null,
    
    initialize: function(options) {
      this.detail = this.createSubcontainer('#detail');
      this.listenTo(this.collection, 'reset add remove change:slug', this.render);
      this.collection.fetch({reset: true});
    },
    
    render: function() {
      this.$('#list').html(Utils.renderOptions(this.collection));
      this.$('[data-ui="edit"]').prop('disabled', !this.collection.length);
      this.$('[data-ui="remove"]').prop('disabled', !this.collection.length);
      this.onSelect();
    },
    
    selection: function() {
      return this.collection.get(this.$('#list').val());
    },
    
    events: {
      'click [data-ui="add"]': 'onAdd',
      'click [data-ui="edit"]': 'onEdit',
      'click [data-ui="remove"]': 'onRemove',
      'change #list': 'onSelect'
    },
    
    onAdd: function() {
      Modal.open(new this.editView());
    },
    
    onEdit: function() {
      Modal.open(new this.editView({model: this.selection()}));
    },
    
    onRemove: function() {
      Modal.open(new this.removeView({model: this.selection()}));
    },
    
    onSelect: function() {
      if (this.detailView) {
        this.detail.open(new this.detailView({model: this.selection()}));
      }
    }
  });
  
  return LassieEditorView;
});