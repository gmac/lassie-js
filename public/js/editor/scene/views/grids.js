define(function(require) {
  
  // Imports:
  var PIXI = require('pixi');
  var _ = require('underscore');
  var Backbone = require('backbone');
  var ContainerView = require('containerview');
  var Modal = require('editor/common/modal');
  var Utils = require('editor/common/utils');
  var SceneState = require('../models/state');
  var GridModel = require('../models/grid');
  
  // "ADD" Grid View
  // ----------------------------------------------------------------
  var GridsEditView = Modal.EditView.extend({
    collection: function() {
      return SceneState.get('grids');
    },
    
    serialize: function() {
      return {
        slug: this.$('#edit-slug').val(),
        scene_id: SceneState.get('sceneId')
      };
    }
  });
  
  // "REMOVE" Grid View
  // ----------------------------------------------------------------
  var GridsRemoveView = Modal.RemoveView;
  
  // Grid Detail View
  // ----------------------------------------------------------------
  var GridDetailView = ContainerView.extend({
    template: Utils.parseTemplate(require('text!../tmpl/grid.html')),
    
    initialize: function() {
      this.$el.html(this.template(this.model.toJSON()));
      
      // Create data sources:
      this.gridApi = new GridModel();
      this.selection = this.gridApi.selection;
      this.grid = this.gridApi.grid;
      this.grid.reset(this.model.read());
      
      // Configure view setup:
      this.nodeViews = {};
      this.polyViews = {};
      this.setView();
      this.setKeyboard();
      
      // Listen for changes:
      this.listenTo(this.grid, 'change', this.save);
      this.listenTo(this.grid, 'change', this.render);
      this.listenTo(this.selection, 'change', this.render);
    },
    
    setView: function() {
      this.edges = new PIXI.Graphics();
      var view = this.view = new PIXI.DisplayObjectContainer();
      var canvas = new PIXI.Graphics();
      var hit = canvas.hitArea = new PIXI.Rectangle(0, 0, 1024, 768);
      canvas.beginFill(0x000000, 0.5);
      canvas.drawRect(hit.x, hit.y, hit.width, hit.height);
      canvas.endFill();
      canvas.interactive = true;
      canvas.mousedown = _.bind(this.onCanvas, this);
      view.addChild(canvas);
      view.addChild(this.edges);
      SceneState.get('sceneView').view.addChild(view);
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
    
    save: _.debounce(function() {
      this.model.write(this.grid.toJSON());
    }, 200),
    
    render: _.debounce(function() {
      var self = this;
      var prevNodeViews = this.nodeViews;
      var prevPolyViews = this.polyViews;
      var prevEdgeViews = this.edgeViews;
      
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
          var hit = view.hitArea = new PIXI.Circle(0, 0, 6);
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
          var hit = view.hitArea = new PIXI.Polygon(points);
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
    
    renderNodeView: function(view, data) {
      view.clear();
      view.beginFill(view.__sel ? 0xffffff : 0xff0000, 1);
      view.drawCircle(0, 0, 6);
      view.endFill();
      view.position.x = data.x;
      view.position.y = data.y;
    },
    
    renderPolyView: function(view, data) {
      view.clear();
      view.beginFill(view.__sel ? 0xffffff : 0xff0000, 0.25);
      view.moveTo(data[0].x, data[0].y);
      for (var i=1, len=data.length; i < len; i++) {
        view.lineTo(data[i].x, data[i].y);
      }
      view.endFill();
    },
    
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
							edges.lineStyle(4, 0x000000, 0.06);
							edges.moveTo(local.x, local.y);
							edges.lineTo(foreign.x, foreign.y);
							// Black
							edges.lineStyle(2, 0xffffff, 1);
							edges.moveTo(local.x, local.y);
							edges.lineTo(foreign.x, foreign.y);
						}
					}
				}
			});
    },
    
    cursor: function() {
      return this.view.stage.getMousePosition();
    },
    
    isDoubleTap: function(evt) {
      var doubleTap = (evt.timeStamp - this.lastTap < 250);
      this.lastTap = evt.timeStamp;
      return doubleTap;
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
				marquee.beginFill(0x0000ff, 0.75);
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
    
    events: {
      'click [data-ui="join"]': 'onJoin',
      'click [data-ui="break"]': 'onBreak',
      'click [data-ui="polygon"]': 'onPolygon',
      'click [data-ui="remove"]': 'onRemove'
    },
    
    onJoin: function() {
      this.gridApi.joinNodes();
    },
    
    onBreak: function() {
      this.gridApi.splitNodes();
    },
    
    onPolygon: function() {
      this.gridApi.makePolygon();
    },
    
    onRemove: function() {
      Modal.open(new GridsRemoveView({model: this.model}));
    },
    
    remove: function() {
      ContainerView.prototype.remove.call(this);
      this.view.parent.removeChild(this.view);
      $(window).off('keydown focus blur');
    }
  });
  
  // Grids View
  // ----------------------------------------------------------------
  var GridsView = ContainerView.extend({
    className: 'scene-grids',
    template: Utils.parseTemplate(require('text!../tmpl/grids.html')),
    
    initialize: function() {
      this.collection = SceneState.get('grids');
      this.$el.html(this.template());
      this.detail = this.createSubcontainer('[data-ui="grid"]');
      
      this.listenTo(this.collection, 'reset add remove change:slug', this.render);
    },
    
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
        this.selected = null;
        this.detail.close();
      } else if (selection.cid !== this.selected) {
        this.selected = selection.cid;
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