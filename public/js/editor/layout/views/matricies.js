define(function(require) {
  
  // Imports:
  var PIXI = require('pixi');
  var Backbone = require('backbone');
  var ContainerView = require('containerview');
  var C = require('constellation');
  var Modal = require('editor/common/modal');
  var Utils = require('editor/common/utils');
  var LayoutState = require('../models/state');
  var WorkspaceView = require('./workspace');
  
  // "ADD" Matrix View
  // ----------------------------------------------------------------
  var MatrixEditView = Modal.EditView.extend({
    title: 'Matrix',
    
    collection: function() {
      return LayoutState.get('matricies');
    },
    
    serialize: function() {
      return {
        slug: this.$('#edit-slug').val(),
        scene_id: LayoutState.get('sceneId')
      };
    }
  });
  
  // "REMOVE" Matrix View
  // ----------------------------------------------------------------
  var MatrixRemoveView = Modal.RemoveView;
  
  // Matrix View
  // ----------------------------------------------------------------
  var MatrixView = WorkspaceView.extend({
    template: Utils.parseTemplate(require('text!../tmpl/matrix.html')),
    
    initialize: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.initEditor();
      this.setView();
      
      this.listenTo(this.model, 'change', this.render);
    },
    
    setView: function() {
      function node(view, index, ctx) {
        view.hitArea = new PIXI.Circle(0, 0, 6);
        view.beginFill(0xffffff, 1);
        view.drawCircle(0, 0, 6);
        view.endFill();
        view.__i = index;
        view.interactive = true;
        view.mousedown = _.bind(ctx.onNode, ctx);
        return view;
      }
      
      var edges = this.edges = new PIXI.Graphics();
      this.n1 = node(new PIXI.Graphics(), 1, this);
      this.n2 = node(new PIXI.Graphics(), 2, this);
      
      this.addCanvas();
      this.view.addChild(edges);
      this.view.addChild(this.n1);
      this.view.addChild(this.n2);
      this.addLayoutView();
    },
    
    render: function() {
      this.n1.position.x = this.model.get('x1');
      this.n1.position.y = this.model.get('y1');
      this.n2.position.x = this.model.get('x2');
      this.n2.position.y = this.model.get('y2');
      this.renderEdgesView();
    },
    
    renderEdgesView: function() {
      var n1 = this.n1.position;
      var n2 = this.n2.position;
      this.edges.clear();
      this.edges.lineStyle(1, 0xffffff, 1);
      this.edges.moveTo(n1.x, n1.y);
      this.edges.lineTo(n2.x, n2.y);
      
      if (this.model.get('axis') === 'r') {
        this.edges.drawCircle(n1.x, n1.y, C.distance(n1, n2));
      }
    },
    
    // Renders updated node coordinates while dragging:
    renderCoords: function(index) {
      this.$('#matrix-x'+index).val(this.model.get('x'+index));
      this.$('#matrix-y'+index).val(this.model.get('y'+index));
    },
  	
    onNode: function(data) {
      var node = data.target;
      var index = node.__i;
      var x = 'x'+index;
      var y = 'y'+index;
      var data = {};
      var self = this;
      
      this.drag(function(pt) {
				node.position.x = data[x] = pt.x;
				node.position.y = data[y] = pt.y;
				self.model.set(data, {silent: true});
				self.renderEdgesView();
				self.renderCoords(index);
			}, function() {
			  self.model.trigger('change');
				self.model.save();
			});
    },
    
    uiPrompt: function(action) {
      switch (action) {
        case 'remove': return Modal.open(new MatrixRemoveView({model: this.model}));
      }
    }
  });
  
  // Matricies View
  // ----------------------------------------------------------------
  var MatriciesView = ContainerView.extend({
    className: 'scene-matrix',
    template: Utils.parseTemplate(require('text!../tmpl/matricies.html')),
    
    initialize: function() {
      // Configure collection and selected model references:
      this.collection = LayoutState.get('matricies');
      this.collection.selected = null;
      
      // Populate template and create detail view container:
      this.$el.html(this.template());
      this.detail = this.createSubcontainer('[data-ui="matrix"]');

      // Monitor changes:
      this.listenTo(this.collection, 'reset add remove change:slug', this.render);
    },
    
    // Gets a reference to the currently selected model:
    selection: function() {
      return this.collection.get(this.$('#matrix-select').val()) || this.collection.at(0) || null;
    },
    
    // Renders the selection list and updates the detail view:
    render: function() {
      var options = Utils.renderOptions(this.collection);
      this.$('#matrix-select').html(options).prop('disabled', !options);
      this.$('[data-ui="edit"]').prop('disabled', !options);
      this.update();
    },
    
    // Updates the detail container with the currently selected model data:
    update: function() {
      var selection = this.selection();

      if (!selection) {
        this.collection.selected = null;
        this.detail.close();
      }
      else if (selection.cid !== this.collection.selected) {
        this.collection.selected = selection.cid;
        this.detail.open(new MatrixView({model: selection}));
      }
    },
    
    events: {
      'change #matrix-select': 'update',
      'click [data-ui="add"]': 'onAdd',
      'click [data-ui="edit"]': 'onEdit'
    },
    
    onAdd: function() {
      Modal.open(new MatrixEditView());
    },
    
    onEdit: function() {
      Modal.open(new MatrixEditView({model: this.selection()}));
    }
  });
  
  return MatriciesView;
});