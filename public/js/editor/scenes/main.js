define(function(require) {
  
  var Scenes = require('./models/scene');
  var SceneListView = require('./views/scenes');
  var SceneLayoutView = require('./views/layout');
  
  return {
    start: function(state, container) {
      var scenesModel = Scenes.instance();
      
      scenesModel.load().then(function() {
        var scene = scenesModel.get(state.target);
        
        if (scene) {
          container.open(new SceneLayoutView({model: scene}));
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