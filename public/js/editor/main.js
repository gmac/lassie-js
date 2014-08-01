define(function(require) {
  
  // Imports:
  var _ = require('underscore');
  var Backbone = require('backbone');
  var ContainerView = require('containerview');

  // Implementation:
  function LassieEditor() {
    var container = ContainerView.create('#lassie');
    var appState = require('./common/models/state').instance();
    var NavBar = require('./common/views/navbar'); 
    var currentApp;
    
    // Create navbar:
    container.navbar = (new NavBar()).$el;
    container.$el.before(container.navbar);
    
    appState.on('change:state', function() {
      var state = appState.toJSON();
      
      if (currentApp) {
        currentApp.stop();
      }
      
      require(['./'+state.module], function(app) {
        currentApp = app;
        currentApp.start(state, container);
      });
    });
    
    appState.start();
  }
  
  return new LassieEditor();
});