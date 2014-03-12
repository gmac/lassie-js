define(function(require) {
  
  var Utils = require('editor/common/utils');
  
  var SceneStateModel = Backbone.Model.extend({
    defaults: {
      sceneId: null,
      sceneView: null,
      sceneModel: null,
      layers: null,
      grids: null,
      matricies: null,
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
  
  SceneStateModel.get = function(attr) {
    return this.instance().get(attr);
  };
  
  return Utils.singleton(SceneStateModel);
});