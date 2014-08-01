define(function(require) {
  
  // Imports:
  var _ = require('underscore');
  var Backbone = require('backbone');
  var Utils = require('editor/common/utils');
  var routeToRegExp = Backbone.Router.prototype._routeToRegExp;
  var extractParams = Backbone.Router.prototype._extractParameters;
  
  var finiteStates = _.map([
    {
      id: 'setup',
      route: 'setup',
      module: 'setup/main'
    },
    {
      id: 'assets',
      route: 'assets',
      module: 'assets/main'
    },
    {
      id: 'projects',
      route: 'projects',
      module: 'projects/main'
    },
    {
      id: 'scenes',
      route: 'scenes',
      module: 'scenes/main'
    },
    {
      id: 'scene-detail',
      route: 'scenes/:id',
      module: 'scenes/main'
    },
    {
      id: 'items',
      route: 'items',
      module: 'items/main'
    },
    {
      id: 'inventories',
      route: 'inventories',
      module: 'inventories/main'
    },
    {
      id: 'combos',
      route: 'combos',
      module: 'combos/main'
    }
  ], function(fs) {
    fs.regex = routeToRegExp(fs.route);
    return fs;
  });
  
  var EditorRouter = Backbone.Router.extend({
    initialize: function(options) {
      this.model = options.model;
      this.listenTo(this.model, 'change:state', this.push);
    },
    
    routes: function() {
      var routes = {};
      _.each(finiteStates, function(fs) {
        routes[fs.route] = 'pull';
      });

      routes[''] = 'pull';
      routes["*default"] = 'pull';
      return routes;
    },
    
    pull: function() {
      this.model.setState(Backbone.history.fragment);
    },
    
    push: function() {
      if (this.model.getState() !== Backbone.history.fragment) {
        this.navigate(this.model.getState());
      }
    }
  });
  
  var EditorState = Backbone.Model.extend({
    defaults: {
      // Finite State Members:
      id: null, // The id of the current finite state.
      module: null, // The module path for the finite state.
      regex: null, // The finite state's route regex.
      route: null, // The finite state's route pattern.

      // Infinite State Members:
      // ex: friends/234567898765432
      state: null, // Current application state - NON-finite.
      target: null // Current state target - NON-finite.
    },
    
    initialize: function() {
      this.router = new EditorRouter({model: this});
    },

    // Restores a global default application state:
    setDefault: function() {
      this.setState(finiteStates[0].route);
    },

    // Locates a finite state for a provided state key:
    findState: function(state) {
      return _.find(finiteStates, function(fs) {
        return state.match(fs.regex);
      });
    },
    
    /*setStateById: function(id) {
      var fs = _.findWhere(finiteStates, {id: id});
      if (fs) this.setState(fs.route);
    },*/
    
    // Sets a new state key:
    setState: function(state) {
      // Trim any leading and trailing slashes on state:
      state = state.replace(/^\/*(.+?)\/*$/, '$1');
      
      // Find corresponding finite state:
      var fs = this.findState(state);

      if (!fs) {
        fs = finiteStates[0];
        state = fs.route;
      }

      if (state !== this.getState()) {
        this.set(_.extend(fs, {
          state: state,
          target: extractParams(fs.regex, state)[0] || null
        }));
        return true;
      }
      return false;
    },
    
    // Gets the current state key:
    getState: function() {
      return this.get('state');
    },

    // Gets the current FINITE state key:
    // (ie: the discrete ID associated with the current infinite state)
    getFiniteState: function() {
      return this.get('id');
    },
    
    start: function() {
      Backbone.history.start({
        pushState: true,
        root: ['/', location.href.match(/projects\/[^ \/]+/g)[0], '/'].join('')
      });
    }
  });
  
  return Utils.singleton(EditorState);
});