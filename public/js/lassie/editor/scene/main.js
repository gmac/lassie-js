define(function(require) {
  
  var Scenes = require('./models/scene');
  var SceneListView = require('./views/list');
  var SceneDetailView = require('./views/detail');
  
  return {
    start: function(state, container) {
      var scenes = Scenes.instance();
      
      scenes.load().then(function() {
        var scene = scenes.get(state.target);
        
        if (scene) {
          container.open(new SceneDetailView({model: scene}));
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