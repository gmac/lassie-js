define(function(require) {

  // Imports:
  var Backbone = require('backbone');
  var ContainerView = require('containerview');
  var Utils = require('editor/common/utils');
  var Lassie = require('lassie/lassie');
  var LayoutState = require('../models/state');
  
  // Implementation:
  
  // Scene Detail Navbar View
  // ----------------------------------------------------------------
  var SceneLayoutNavView = Backbone.View.extend({
    el: '#layout-menu',
    initialize: function() {
      this.model = LayoutState.instance();
      this.listenTo(this.model, 'change', this.render);
      this.render();
    },
    
    render: function() {
      this.$('li').removeClass('active');
      this.$('[data-ui="'+this.model.view()+'"]').parent().addClass('active');
    },
    
    events: {
      'click [data-ui]': 'onUI'
    },
    
    onUI: function(evt) {
      evt.preventDefault();
      var state = this.$(evt.currentTarget).attr('data-ui');
      this.model.view(state);
    }
  });
  
  // Scene Layout View
  // ----------------------------------------------------------------
  var SceneLayoutView = ContainerView.extend({
    el: '#layout',
    
    initialize: function(options) {
      this.state = LayoutState.instance().reset();
      this.win = $(window).on('resize.scene', _.debounce(_.bind(this.resize, this), 200));
      this.navbar = this.addSubview(new SceneLayoutNavView());
      this.sidebar = this.createSubcontainer('#layout-sidebar');
      this.lassie = new Lassie();
      this.resize();
      
      // Create and display a new Lassie instance:
      this.lassie.loadScene(options.id);
      this.lassie.start();
      this.$('#layout-preview').append(this.lassie.view);
      
      // Create state manager model,
      // and cache references to the current data sources we're going to use:
      var scene = this.lassie.scene;
      this.state.set({
        grids: scene.grids,
        layers: scene.layers,
        matricies: scene.matricies,
        sceneId: scene.id,
        sceneModel: scene.model,
        sceneView: scene
      });
      
      // Create navbar and sidebar:
      this.listenTo(this.state, 'change:viewState', this.render);
      this.render();
    },
    
    resize: function() {
      var height = this.win.height() - 52;
      var width = this.win.width() - 200;
      this.sidebar.$el.height(height);
      this.lassie.renderer.resize(width, height);
      this.state.set({
        viewWidth: width,
        viewHeight: height
      });
      
      // dispatch a single event for listeners to capture:
      this.state.trigger('resize');
    },
    
    render: function() {
      var view = this.state.view();
      var editor = [];
      var self = this;
      
      switch (view) {
        case 'layer': editor.push('./layers'); break;
        case 'grid': editor.push('./grids'); break;
        case 'matrix': editor.push('./matricies'); break;
      }
      
      if (editor.length) {
        require(editor, function(EditorView) {
          self.sidebar.open(new EditorView());
        });
      } else {
        this.sidebar.close();
      }
    },
    
    dispose: function() {
      $(window).off('resize.scene');
      this.lassie.stop();
      this.state.reset();
      this.lassie = this.state = null;
    }
  });
  
  return SceneLayoutView;
});