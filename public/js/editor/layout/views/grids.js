define(function(require) {
  
  // Imports:
  var PIXI = require('pixi');
  var _ = require('underscore');
  var Backbone = require('backbone');
  var ContainerView = require('containerview');
  var Modal = require('editor/common/modal');
  var Utils = require('editor/common/utils');
  var LayoutState = require('../models/state');
  var GridModel = require('../models/grid');
  var WorkspaceView = require('./workspace');
  
  // Edit Modal View
  // ----------------------------------------------------------------
  var GridsEditView = Modal.EditView.extend({
    title: 'Grid',
    
    collection: function() {
      return LayoutState.get('grids');
    },
    
    serialize: function() {
      return {
        slug: this.$('#edit-slug').val(),
        scene_id: LayoutState.get('sceneId')
      };
    }
  });
  
  // Remove Modal View
  // ----------------------------------------------------------------
  var GridsRemoveView = Modal.RemoveView;
  
  // Grid Detail View
  // ----------------------------------------------------------------
  var GridDetailView = WorkspaceView.extend({
    template: Utils.parseTemplate(require('text!../tmpl/grid.html')),
    
    initialize: function() {
      this.$el.html(this.template(this.model.toJSON()));
      
      // Create data sources:
      this.gridApi = new GridModel();
      this.selection = this.gridApi.selection;
      this.grid = this.gridApi.grid;
      this.grid.reset(this.model.read());
      
      // Configure view setup:
      this.initEditor();
      this.setView();
      this.setKeyboard();
      
      // Listen for changes:
      this.listenTo(this.grid, 'change', this.save);
      this.listenTo(this.grid, 'change', this.render);
      this.listenTo(this.selection, 'change', this.render);
    },
    
    setView: function() {
      this.nodeViews = {};
      this.polyViews = {};
      this.edges = new PIXI.Graphics();
      this.view.addChild(this.edges);
      
      this.addCanvas();
      this.canvas.interactive = true;
      this.canvas.mousedown = _.bind(this.onCanvas, this);
      
      this.addLayoutView();
    },
    
    setKeyboard: function() {
      var api = this.gridApi;
      var _enabled = true;
      
      function stop(evt) {
    		evt.preventDefault();
    	}
    	
      $(window)
        .on('keydown', function(evt) {
    			if (_enabled) {
    				switch (evt.which) {
    					case 8: stop(evt); api.deleteGeometry(); return false; // "delete"
    					case 66: stop(evt); api.splitNodes(); return false; // "b"
    					case 74: stop(evt); api.joinNodes(); return false; // "j"
    					case 80: stop(evt); api.makePolygon(); return false; // "p"
    					//case 70: stop(evt); api.findPath(); return false; // "f"
    					//case 83: stop(evt); api.snapNodeToGrid(); return false; // "s"
    					//case 78: stop(evt); evt.ctrlKey ? api.newGrid() : api.selectNearestGridNode(); return false; // "n"
    					//case 72: stop(evt); api.hitTestGeometry(); return false; // "h"
    				}
    			}
    		})
    		.on('focus', 'input', function(evt) {
    			_enabled = false;
    		})
    		.on('blur', 'input', function(evt) {
    			_enabled = true;
    		});
    },
    
    // Saves grid data to the model:
    save: _.debounce(function() {
      this.model.write(this.grid.toJSON());
    }, 200),
    
    // Renders the display of all geometry data:
    render: _.debounce(function() {
      var prevNodeViews = this.nodeViews;
      var prevPolyViews = this.polyViews;
      
      this.nodeViews = {};
      this.polyViews = {};
      this.renderEdgesView();
      
      // Add/Redraw nodes:
      _.each(this.grid.nodes, function(node) {
        var id = node.id;
        var view = prevNodeViews[id];
        delete prevNodeViews[id];
        
        if (!view) {
          view = new PIXI.Graphics();
          view.hitArea = new PIXI.Circle(0, 0, 6);
          view.__id = id;
          view.interactive = true;
          view.mousedown = _.bind(this.onNode, this);
          this.view.addChild(view);
        }
        
        view.__sel = this.selection.contains(id);
        this.renderNodeView(view, node, true);
        this.nodeViews[id] = view;
      }, this);
      
      // Add/Redraw polys:
      _.each(this.grid.polys, function(poly) {
        var id = poly.id;
        var view = prevPolyViews[id];
        var points = this.grid.getNodesForPolygon(id);
        delete prevPolyViews[id];
        
        if (!view) {
          view = new PIXI.Graphics();
          view.hitArea = new PIXI.Polygon(points);
          view.__id = id;
          view.interactive = true;
          view.mousedown = _.bind(this.onPoly, this);
          this.view.addChildAt(view, 1);
        }
        
        // Position the node:
        view.__sel = this.selection.contains(id);
        this.renderPolyView(view, points);
        this.polyViews[id] = view;
      }, this);
			
      // Remove any outdated views:
      _.each(_.extend(prevNodeViews, prevPolyViews), function(view) {
        view.parent && view.parent.removeChild(view);
      });
    }, 10),
    
    // Renders a single node display:
    renderNodeView: function(view, data) {
      view.clear();
      view.lineStyle(1, 0xffffff, 0.5);
      view.beginFill(view.__sel ? 0xffffff : 0xff0000, 1);
      view.drawCircle(0, 0, 6);
      view.endFill();
      view.position.x = data.x;
      view.position.y = data.y;
    },
    
    // Renders a single polygon display:
    renderPolyView: function(view, data) {
      view.clear();
      view.beginFill(view.__sel ? 0xffffff : 0xff0000, 0.25);
      view.moveTo(data[0].x, data[0].y);
      for (var i=1, len=data.length; i < len; i++) {
        view.lineTo(data[i].x, data[i].y);
      }
      view.endFill();
    },
    
    // Renders all edges:
    renderEdgesView: function() {
      var drawn = {};
      var nodes = this.grid.nodes;
      var edges = this.edges;
      
      edges.clear();

			_.each(nodes, function(local, id) {
				for (var i in local.to) {
					if (local.to.hasOwnProperty(i) && nodes.hasOwnProperty(i)) {
						var foreign = nodes[i];

						if (!drawn.hasOwnProperty(foreign.id+' '+local.id)) {
							drawn[foreign.id+' '+local.id] = 1;
							
							// White:
							edges.lineStyle(3, 0x000000, 0.06);
							edges.moveTo(local.x, local.y);
							edges.lineTo(foreign.x, foreign.y);
							
							// Black
							edges.lineStyle(1, 0xffffff, 1);
							edges.moveTo(local.x, local.y);
							edges.lineTo(foreign.x, foreign.y);
						}
					}
				}
			});
    },
    
    // Tests if an event counts as a double-touch:
    isDoubleTap: function(evt) {
      var doubleTap = (evt.timeStamp - this.lastTap < 250);
      this.lastTap = evt.timeStamp;
      return doubleTap;
    },
    
		// Starts the marquee drag selection:
    dragMarquee: function(offset) {
      var self = this;
      var marquee = new PIXI.Graphics();
      this.view.addChild(marquee);
			
			function plotRect(a, b) {
				var minX = Math.min(a.x, b.x);
				var maxX = Math.max(a.x, b.x);
				var minY = Math.min(a.y, b.y);
				var maxY = Math.max(a.y, b.y);
				var rect = new PIXI.Rectangle(minX, minY, maxX-minX, maxY-minY);
				
				marquee.clear();
				marquee.lineStyle(1, 0xffffff, 0.5);
				marquee.beginFill(0x00ffff, 0.25);
				marquee.drawRect(rect.x, rect.y, rect.width, rect.height);
				marquee.endFill();
				return rect;
			}
			
			plotRect(offset, offset);

			this.drag(function(pt) {
				plotRect(offset, pt);
			}, function(pt) {
				_.each(self.grid.getNodesInRect(plotRect(offset, pt)), function(node) {
					self.selection.select(node);
				});
				marquee.parent.removeChild(marquee);
			});
    },
    
    // Drags shape geometry (nodes / polys):
    dragGeom: function(nodeIds, offset, callback) {
      var self = this;
			var polys = this.grid.getPolygonsWithNodes(nodeIds);
			
			this.drag(function(pt) {
				offset.x -= pt.x;
				offset.y -= pt.y;
					
				// Update nodes:
				_.each(nodeIds, function(id) {
					var model = self.grid.getNodeById(id);
          model.x -= offset.x;
					model.y -= offset.y;
					self.renderNodeView(self.nodeViews[id], model);
				});
				
				// Update polygons:
				_.each(polys, function(id) {
				  var nodes = self.grid.getNodesForPolygon(id);
				  self.renderPolyView(self.polyViews[id], nodes);
				});
				
				// Update edges:
				self.renderEdgesView();
				offset.x = pt.x;
				offset.y = pt.y;
				
			}, function() {
				self.save();
			}, callback);
    },
    
    // Triggered when the canvas is clicked:
    onCanvas: function(data) {
      var pt = this.cursor();
      var evt = data.originalEvent;

      if (this.isDoubleTap(evt)) {
				this.grid.addNode(pt.x, pt.y);
			} else {
				if (!evt.shiftKey) {
				  this.selection.deselectAll();
			  }
				this.dragMarquee(pt.clone());
			}
    },
    
    // Triggered when a node is clicked:
    onNode: function(data) {
      var id = data.target.__id;
			var evt = data.originalEvent;
			var selected = this.selection.contains(id);
			var pt = this.cursor();
			var added = false;
			var self = this;
			
			if (evt.shiftKey) {
				// Shift key is pressed: toggle node selection.
				selected = this.selection.toggle(id);
				added = true;
			}
			else if (!selected) {
				// Was not already selected: set new selection.
				this.selection.deselectAll();
				this.selection.select(id);
				selected = true;
			}
			
			if (selected) {
				// Node has resolved as selected: start dragging.
				this.dragGeom(this.selection.items, pt.clone(), function(dragged) {
					// Callback triggered on release...
					// If the point was not dragged, nor a new addition to the selection
					// Then refine selection to just this point.
					if (!dragged && !added) {
						self.selection.deselectAll();
						self.selection.select(id);
					}
				});
			}
    },
    
    // Triggered when a poly is clicked:
    onPoly: function(data) {
      var id = data.target.__id;
      var evt = data.originalEvent;
      var nodes = this.grid.getPolygonById(id).nodes;
      var pt = this.cursor();
           
      if (this.isDoubleTap(evt)) {
				this.selection.setSelection(nodes);
			} else {
				// Single-click polygon: perform selection box.
				if (!evt.shiftKey) {
					this.selection.deselectAll();
				}
				if (this.selection.toggle(id)) {
					this.dragGeom(nodes, pt.clone());
				}
			}
    },

    uiPrompt: function(action) {
      switch (action) {
        case 'join': return this.gridApi.joinNodes();
        case 'break': return this.gridApi.splitNodes();
        case 'polygon': return this.gridApi.makePolygon();
        case 'remove': return Modal.open(new GridsRemoveView({model: this.model}));
      }
    },

    dispose: function() {
      this.removeLayoutView();
      $(window).off('keydown focus blur');
    }
  });
  
  // Grids View
  // ----------------------------------------------------------------
  var GridsView = ContainerView.extend({
    className: 'scene-grids',
    template: Utils.parseTemplate(require('text!../tmpl/grids.html')),
    
    initialize: function() {
      // Configure collection and selected model references:
      this.collection = LayoutState.get('grids');
      this.collection.selected = null;
      
      // Populate template and create detail view container:
      this.$el.html(this.template());
      this.detail = this.createSubcontainer('[data-ui="grid"]');
      
      // Monitor changes:
      this.listenTo(this.collection, 'reset add remove change:slug', this.render);
    },
    
    // Gets a reference to the currently selected model:
    selection: function() {
      return this.collection.get(this.$('#grids-select').val()) || this.collection.at(0) || null;
    },
    
    render: function() {
      var options = Utils.renderOptions(this.collection);
      this.$('#grids-select').html(options).prop('disabled', !options);
      this.$('[data-ui="edit"]').prop('disabled', !options);
      this.update();
    },
    
    update: function() {
      var selection = this.selection();
      
      if (!selection) {
        this.collection.selected = null;
        this.detail.close();
      }
      else if (selection.cid !== this.collection.selected) {
        this.collection.selected = selection.cid;
        this.detail.open(new GridDetailView({model: selection}));
      }
    },
    
    events: {
      'change #grids-select': 'update',
      'click [data-ui="add"]': 'onAdd',
      'click [data-ui="edit"]': 'onEdit'
    },
    
    onAdd: function() {
      Modal.open(new GridsEditView());
    },
    
    onEdit: function() {
      Modal.open(new GridsEditView({model: this.selection()}));
    }
  });
  
  return GridsView;
});