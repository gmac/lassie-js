define(function(require) {
  
  // Imports:
  var _ = require('underscore');
  var Backbone = require('backbone');
  var ContainerView = require('containerview');
  
  // Implementation:
  function LassieEditor() {
    var container = ContainerView.create('#lassie');
    var appState = require('editor/common/models/state').instance();
    var currentApp;
    
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