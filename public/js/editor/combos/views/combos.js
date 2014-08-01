define(function(require) {
  
  var Backbone = require('backbone');
  var ContainerView = require('containerview');
  var Modal = require('editor/common/modal');
  var Utils = require('editor/common/utils');
  
  var CombosView = ContainerView.extend({
    className: 'lassie-combos',
    template: Utils.parseTemplate(require('text!../tmpl/combos.html')),
    
    initialize: function() {
      this.$el.html(this.template());
    }
  });
  
  return CombosView;
});