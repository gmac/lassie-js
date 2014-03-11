define(function(require) {
  
  var Backbone = require('backbone');
  var ContainerView = require('containerview');
  var Utils = require('helpers/utils');
  var Scenes = require('../models/scene');
  var Dialog = require('editor/dialog/main');
  var NavbarView = require('editor/common/views/navbar');
  
  // "ADD" dialog controller:
  // ----------------------------------------------------------------
  var SceneListAddView = Backbone.View.extend({
    className: 'form-horizontal dialog',
    template: Utils.parseTemplate(require('text!../tmpl/list-add.html')),
    
    initialize: function() {
      this.$el.html(this.template());
    },
    
    events: {
      'click .confirm': 'onConfirm',
      'click .cancel': 'onCancel'
    },
    
    onConfirm: function() {
      var scenes = Scenes.instance();
      var slug = this.$('#add-slug').val();
      var dup = scenes.findWhere({slug: slug});
      
      if (dup) {
        this.$('.error').text('This slug is already in use');
      } else {
        scenes.select = slug;
        scenes.create({slug: slug});
        Dialog.close();
      }
    },
    
    onCancel: function() {
      Dialog.close();
    }
  });
  
  // "REMOVE" dialog controller:
  // ----------------------------------------------------------------
  var SceneListRemoveView = Backbone.View.extend({
    className: 'form-horizontal dialog',
    template: Utils.parseTemplate(require('text!../tmpl/list-remove.html')),
    
    initialize: function() {
      this.$el.html(this.template(this.model.toJSON()));
    },
    
    events: {
      'click .confirm': 'onConfirm',
      'click .cancel': 'onCancel'
    },
    
    onConfirm: function() {
      this.model.destroy();
      Dialog.close();
    },
    
    onCancel: function() {
      Dialog.close();
    }
  });
  
  // Scene list view:
  // ----------------------------------------------------------------
  var SceneListView = ContainerView.extend({
    tagName: 'div',
    className: 'scene-list',
    template: Utils.parseTemplate(require('text!../tmpl/list.html')),
    
    initialize: function(options) {
      this.collection = this.collection || Scenes.instance();
      this.$el.html(this.template());
      this.swapIn(new NavbarView(), '.navbar-main');
      
      this.listenTo(this.collection, 'reset add remove', this.render);
    },
    
    render: function() {
      var sel = this.collection.select;
      var options = this.collection.reduce(function(memo, model) {
        var selected = (sel === model.id || sel === model.get('slug')) ? ' selected="selected"' : '';
        return memo += ['<option value="', model.cid ,'"', selected, '>', model.get('slug'), '</option>'].join('');
      }, '', this);
      
      this.$('#scene-list').html(options);
      this.$('[data-ui="edit"]').prop('disabled', !this.collection.length);
      this.$('[data-ui="remove"]').prop('disabled', !this.collection.length);
    },
    
    selection: function() {
      return this.collection.get(this.$('#scene-list').val());
    },
    
    events: {
      'click [data-ui="add"]': 'onAdd',
      'click [data-ui="remove"]': 'onRemove',
      'click [data-ui="edit"]': 'onEdit'
    },
    
    onAdd: function() {
      Dialog.open(new SceneListAddView());
    },
    
    onRemove: function() {
      Dialog.open(new SceneListRemoveView({
        model: this.selection()
      }));
    },
    
    onEdit: function() {
      var id = this.selection().id;
      if (id) {
        this.collection.select = id;
        require('editor/common/models/state').instance().setState('scene/'+id);
      }
    }
  });
  
  return SceneListView;
});