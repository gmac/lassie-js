define(function(require) {
  
  var Scenes = require('./models/scene');
  var SceneListView = require('./views/scenes');
  var SceneEditView = require('./views/scene');
  
  return {
    start: function(state, container) {
      var scenes = Scenes.instance();
      
      scenes.load().then(function() {
        var scene = scenes.get(state.target);
        
        if (scene) {
          container.open(new SceneEditView({model: scene}));
        } else if (state.target) {
          container.open(new SceneListView({error: 'Scene not found.'}));
        } else {
          container.open(new SceneListView());
        }
      });
    },
    
    stop: function() {
      
    }
  };
});