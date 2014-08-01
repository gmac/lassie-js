define(function(require) {
  
  var ContainerView = require('containerview');
  var ProjectsView = require('./views/projects');
  
  return {
    autostart: function() {
      this.start('projects', ContainerView.create('#lassie'));
    },
    
    start: function(state, container) {
      container.navbar && container.navbar.hide();
      container.open(new ProjectsView());
    },
    
    stop: function() {
      
    }
  };
});