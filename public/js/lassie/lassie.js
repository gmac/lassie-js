define(function(require) {
  
  var PIXI = require('pixi');
  var SceneView = require('./views/scene');

  function Lassie() {
    this.stage = new PIXI.Stage(0x000000, true);
    this.renderer = new PIXI.autoDetectRenderer(1024, 640, null, false, true);
    this.view = this.renderer.view;
    this._running = false;
  }
  
  Lassie.prototype = {
    scene: null,
    stage: null,
    renderer: null,
    
    // Unloads any currently loaded scene:
    unloadScene: function() {
      if (this.scene) {
        this.stage.removeChild(this.scene.view);
        this.scene.dispose();
        this.scene = null;
      }
    },
    
    // Loads a new scene:
    loadScene: function(id) {
      if (!this.scene || this.scene.id !== id) {
        this.unloadScene();
        this.scene = new SceneView(id);
        this.stage.addChild(this.scene.view);
      }
      return this.scene;
    },
    
    start: function() {
      var self = this;
      this._running = true;
      
      function update() {
        if (self._running) {
          requestAnimFrame(update);
          //setTimeout(update, 1000);
          self.renderer.render(self.stage);
        }
      }
      
      update();
    },
    
    stop: function() {
      this._running = false;
    }
  };
  
  return Lassie;
});