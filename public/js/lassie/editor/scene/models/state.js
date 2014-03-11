define(function(require) {
  
  var Utils = require('helpers/utils');
  
  var SceneStateModel = Backbone.Model.extend({
    defaults: {
      sceneView: null,
      sceneData: null,
      layersData: null,
      viewState: 'layer'
    },
    
    view: function(view) {
      if (view) this.set('viewState', view);
      return this.get('viewState');
    },
    
    reset: function() {
      this.set(this.defaults);
      return this;
    }
  });
  
  return Utils.singleton(SceneStateModel);
});