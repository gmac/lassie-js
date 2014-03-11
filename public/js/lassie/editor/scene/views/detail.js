define(function(require) {

  // Imports:
  var Backbone = require('backbone');
  var ContainerView = require('containerview');
  var Utils = require('helpers/utils');
  var SceneState = require('../models/state');
  var LayersListView = require('./layers');
  var Lassie = require('lassie');
  
  // Implementation:
  
  // Scene Detail Navbar View
  // ----------------------------------------------------------------
  var SceneEditorNavView = Backbone.View.extend({
    className: 'navbar navbar-default navbar-main',
    template: Utils.parseTemplate(require('text!../tmpl/detail-nav.html')),
    
    initialize: function() {
      this.model = this.model || SceneState.instance();
      this.$el.html(this.template());
      this.listenTo(this.model, 'change', this.render);
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
      
      if (state === 'done') {
        // DONE: exit to main scenes screen.
        require('editor/common/models/state').instance().setState('scene');
      }
      else {
        // Set new state to local navigation:
        this.model.view(state);
      }
    }
  });
  
  // Scene Detail View
  // ----------------------------------------------------------------
  var SceneEditorDetailView = ContainerView.extend({
    tagName: 'div',
    className: 'scene-detail',
    template: Utils.parseTemplate(require('text!../tmpl/detail.html')),
    
    initialize: function() {
      this.$el.html(this.template());
      
      // Create and display a new Lassie instance:
      this.lassie = new Lassie();
      this.lassie.loadScene(this.model.id);
      this.lassie.start();
      this.$('.preview').append(this.lassie.view);
      
      // Create state manager model,
      // and cache references to the current data sources we're going to use:
      var scene = this.lassie.scene;
      this.state = SceneState.instance().reset();
      this.state.set({
        sceneView: scene,
        sceneData: scene.model,
        layersData: scene.layers
      });
      
      // Create navbar and sidebar:
      this.sidebar = this.createSubcontainer('.sidebar');
      this.swapIn(new SceneEditorNavView(), '.navbar');
      this.listenTo(this.state, 'change:viewState', this.render);
    },

    render: function() {
      var view = this.state.view();
      
      if (view === 'grid') {
        this.sidebar.close();
      }
      else if (view === 'matrix') {
        this.sidebar.close();
      }
      else {
        this.sidebar.open(new LayersListView());
      }
    },
    
    remove: function() {
      ContainerView.prototype.remove.call(this);
      this.lassie.stop();
      this.state.reset();
      this.lassie = this.state = null;
    }
  });
  
  return SceneEditorDetailView;
});