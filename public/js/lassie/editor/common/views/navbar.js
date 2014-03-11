define(function(require) {
  
  // Imports:
  var Backbone = require('backbone');
  var AppState = require('../models/state');
  var Utils = require('helpers/utils');
  
  // Implementation:
  var NavBarView = Backbone.View.extend({
    className: 'navbar navbar-default',
    template: Utils.parseTemplate(require('text!../tmpl/navbar.html')),
    
    initialize: function() {
      this.model = this.model || AppState.instance();
      this.$el.html(this.template());
      this.listenTo(this.model, 'change:state', this.render);
    },
    
    render: function() {
      var state = this.model.getState();
      this.$('li').removeClass('active');
      this.$('[data-ui="'+state+'"]').parent().addClass('active');
      console.log(state);
    },
    
    events: {
      'click [data-ui]': 'onUI'
    },
    
    onUI: function(evt) {
      evt.preventDefault();
      var state = this.$(evt.currentTarget).attr('data-ui');
      this.model.setState(state);
    }
  });
  
  return NavBarView;
});