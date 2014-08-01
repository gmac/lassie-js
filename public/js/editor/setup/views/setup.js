define(function(require) {
  
  var ContainerView = require('containerview');
  var Utils = require('editor/common/utils');
  
  var SetupView = ContainerView.extend({
    className: 'lassie-setup',
    template: Utils.parseTemplate(require('text!../tmpl/setup.html')),
    
    initialize: function() {
      this.$el.html(this.template());
    }
  });
  
  return SetupView;
});