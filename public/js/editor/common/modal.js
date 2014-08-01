define(function(require) {
  
  // Imports:
  var $ = require('jquery.colorbox');
  var _ = require('underscore');
  var Backbone = require('backbone');
  var Utils = require('./utils');
  
  // Base Remove View
  // ----------------------------------------------------------------
  var EditView = Backbone.View.extend({
    className: 'form-horizontal dialog dialog-add',
    template: Utils.parseTemplate(require('text!./tmpl/modal-edit.html')),
    params: {},
    title: '',
    
    initialize: function() {
      var data = this.model ? this.model.toJSON() : {};
      data.title = this.title;
      this.$el.html(this.template(data));
    },
    
    collection: function() {
      return null;
    },
    
    serialize: function() {
      return {
        slug: this.$('#edit-slug').val()
      };
    },
    
    validate: function() {
      return true;
    },
    
    events: {
      'click [data-ui="confirm"]': 'onConfirm',
      'click [data-ui="cancel"]': 'onCancel'
    },
    
    onConfirm: function() {
      var $slug = this.$('#edit-slug');
      var currentSlug = this.model ? this.model.get('slug') : null;
      var data = this.serialize();
      
      function error(message) {
        var $group = $slug.closest('.form-group').addClass('has-error');
        if (message) $group.find('.error').text(message).show();
        $.colorbox.resize();
      }
      
      if (!data.slug) {
        error();
      }
      else if (currentSlug !== data.slug && this.collection().findWhere({slug: data.slug})) {
        error('Slug must be unique');
      }
      else if (this.validate()) {
        
        if (this.model) {
          this.model.save(data);
        } else {
          this.collection().selected = data.slug;
          console.log(this.params);
          this.collection().create(_.extend(data, this.params));
        }
        
        Modal.close();
      }
    },
    
    onCancel: function() {
      Modal.close();
    }
  });
  
  // Base Remove View
  // ----------------------------------------------------------------
  var RemoveView = Backbone.View.extend({
    className: 'form-horizontal dialog dialog-remove',
    template: Utils.parseTemplate(require('text!./tmpl/modal-remove.html')),
    
    initialize: function() {
      this.$el.html(this.template(this.model.toJSON()));
    },
    
    events: {
      'click [data-ui="confirm"]': 'onConfirm',
      'click [data-ui="cancel"]': 'onCancel'
    },
    
    onConfirm: function() {
      this.model.destroy();
      Modal.close();
    },
    
    onCancel: function() {
      Modal.close();
    }
  });
  
  // Modal API
  // ----------------------------------------------------------------
  var Modal = {
    open: function(view) {
      $.colorbox({
        href: view.$el,
        inline: true,
        close: '',
        width: view.width || 400
      });
    },
    
    close: function() {
      $.colorbox.close();
    },
    
    EditView: EditView,
    RemoveView: RemoveView
  };
  
  return Modal;
});