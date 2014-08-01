define(function(require) {
  
  var $ = require('jquery');
  var PIXI = require('pixi');
  var ContainerView = require('containerview');
  var Utils = require('editor/common/utils');
  var LayoutState = require('../models/state');

  var WorkspaceView = Utils.formCapture(ContainerView.extend({
    initEditor: function() {
      this.scene = LayoutState.get('sceneView').view;
      this.view = new PIXI.DisplayObjectContainer();
    },
    
    addCanvas: function() {
      var state = LayoutState.instance();
      var canvas = this.canvas = new PIXI.Graphics();
      
      function resize() {
        var width = state.get('viewWidth');
        var height = state.get('viewHeight');
        canvas.hitArea = new PIXI.Rectangle(0, 0, width, height);
        canvas.clear();
        canvas.beginFill(0x000000, 0.35);
        canvas.drawRect(0, 0, width, height);
        canvas.endFill();
      }
      
      resize();
      this.view.addChildAt(this.canvas, 0);
      this.listenTo(state, 'resize', resize);
    },
    
    addLayoutView: function() {
      this.scene.addChild(this.view);
    },
    
    removeLayoutView: function() {
      if (this.view.parent) {
        this.view.parent.removeChild(this.view);
      }
    },
    
    cursor: function() {
      return this.view.stage ? this.view.stage.getMousePosition() : {x: 0, y: 0};
    },

    // Manages a click-and-drag sequence behavior.
  	// Injects a localized event offset into the behavior handlers.
  	drag: function(onMove, onRelease, callback) {
  		var self = this;
  		var dragged = false;

  		$(document)
  			.on('mouseup', function() {
  				$(document).off('mouseup mousemove');
  				if ( typeof onRelease === 'function' ) {
  					onRelease(self.cursor());
  				}
  				if ( typeof callback === 'function' ) {
  					callback(dragged);
  				}
  				return false;
  			})
  			.on('mousemove', function() {
  				dragged = true;
  				onMove(self.cursor());
  				return false;
  			});
  	},
  	
  	dispose: function() {
      this.removeLayoutView();
    }
  }));
  
  return WorkspaceView;
});