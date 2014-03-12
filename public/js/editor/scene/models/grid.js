/**
* Grid Model.
* Main application model for managing node and polygon data.
*/
define(function(require) {
	
	var _ = require('underscore');
	var Backbone = require('backbone');
	var ConstGrid = require('constellation').Grid;
	
	ConstGrid.prototype.getPolygonsWithNodes = function(ids) {
    var polys = [];
    _.each(this.polys, function(poly) {
      if (_.intersection(poly.nodes, ids).length) polys.push(poly.id);
    });
    return polys;
  };
  
	function Grid() {
	  var grid = _.extend(new ConstGrid(), Backbone.Events);

  	// Add events onto the Grid Model:
  	_.each([
  		'addNode',
  		'joinNodes',
  		'splitNodes',
  		'removeNodes',
  		'addPolygon',
  		'removePolygons',
  		'reset'
  	], function(methodName) {
  		grid[ methodName ] = function() {
  			var result = ConstGrid.prototype[ methodName ].apply(this, arguments);
  			this.trigger('change');
  			return result;
  		};
  	});
  	
  	return grid;
	}
	
	// Grid Selection:
	var GridSelectionModel = Backbone.Model.extend({
		// Stores a list of selected node/poly ids.
		items: [],
		path: [],
		type: '',
		
		// Specifies the number of selected items.
		selectionSize: function() {
			return this.items.length;
		},
		
		// Selects a group of common geometry types by id reference.
		setSelection: function( group ) {
			this.setType( group[0] );
			this.items = group.slice();
			this.update();
		},
		
		// Sets current selection group type (node or polygon)
		// Group type is defined by the first character of an id.
		setType: function( id ) {
			id = id || '';
			
			if (id.length) {
				id = id.substr(0, 1).toLowerCase();
			}
			
			if ( this.type.length && this.type !== id ) {
				this.deselectAll();
			}
			this.type = id;
		},
		
		// Toggles the selection status of a node.
		toggle: function( id ) {
			this.setType( id );
			if ( !this.select( id ) ) {
				this.deselect( id );
				return false;
			}
			return true;
		},
		
		// Tests if the selection group contains an ID.
		contains: function( id ) {
			return _.contains(this.items, id);
		},
		
		// Selects a node by ID reference.
		select: function( id ) {
			this.setType( id );
			if ( !this.contains(id) ) {
				this.items.push( id );
				this.path.length = 0;
				this.update();
				return true;
			}
			return false;
		},
		
		// Deletes a node by ID reference.
		deselect: function( id ) {
			if ( this.contains(id) ) {
				this.items.splice( _.indexOf(this.items, id), 1 );
				this.path.length = 0;
				this.update();
				return true;
			}
			return false;
		},
		
		// Deselects all currently selected nodes.
		deselectAll: function( silent ) {
			this.items.length = 0;
			this.path.length = 0;
			this.type = '';
			if (!silent) {
				this.update();
			}
		},
		
		// Selects path of node ids.
		selectPath: function( ids, silent ) {
			this.path = ids.slice();
			if (!silent) {
				this.update();
			}
		},
		
		// Triggers an update event to refresh the view.
		update: function() {
			this.trigger('change');
		}
	});
	
	// Grid API Model
	var GridModel = Backbone.Model.extend({
	  initialize: function() {
	    this.grid = Grid();
	    this.selection = new GridSelectionModel();
	  },
	  
		// Tests if the environment is configured for performing node operations.
		nodeOpsEnabled: function() {
			return this.selection.type === 'n';
		},
		
		// Resets selection and then creates a new grid.
		newGrid: function() {
			this.selection.deselectAll( true );
			this.grid.reset();
		},
		
		// Joins all nodes within the current selection group.
		joinNodes: function() {
			if ( this.nodeOpsEnabled() && this.selection.selectionSize() > 1 ) {
				this.grid.joinNodes( this.selection.items );
			} else {
				this.alert("Select two or more nodes", this.selection.selectionSize());
			}
		},
		
		// Splits all nodes within the current selection group.
		splitNodes: function() {
			if ( this.nodeOpsEnabled() && this.selection.selectionSize() > 1 ) {
				this.grid.splitNodes( this.selection.items );
			} else {
				this.alert("Select two or more joined nodes", this.selection.selectionSize());
			}
		},
		
		// Makes a polygon using the nodes in the current selection group.
		makePolygon: function() {
			if ( this.nodeOpsEnabled() && this.selection.selectionSize() >= 3 ) {
				this.grid.addPolygon( this.selection.items );
			} else {
				this.alert("Select three or more nodes", this.selection.selectionSize());
			}
		},
		
		// Removes all selected geometry (may be nodes or polygons).
		deleteGeometry: function() {
			if ( !this.selection.selectionSize() ) {
				this.alert("No selected geometry");
				return;
			}
			else if ( this.nodeOpsEnabled() ) {
				// NODES
				this.grid.removeNodes( this.selection.items );
			} else {
				// POLYGONS
				this.grid.removePolygons( this.selection.items );
			}
			this.selection.deselectAll();
		},
		
		// Finds the shortest grid path between two selected nodes.
		findPath: function() {
			if ( this.nodeOpsEnabled() && this.selection.selectionSize() === 2 ) {
				var result = this.grid.findPath( this.selection.items[0], this.selection.items[1] );
				
				if ( result.valid ) {
					this.selection.selectPath( _.pluck(result.nodes, 'id') );
					this.alert("Shortest route of "+Math.round(result.weight)+"px");
				} else {
					this.alert("No valid routes");
				}
			} else {
				this.alert("Select two nodes", this.selection.selectionSize());
			}
		},
		
		// Snaps a node onto the nearest grid line.
		snapNodeToGrid: function() {
			if ( this.nodeOpsEnabled() && this.selection.selectionSize() === 1 ) {
				var node = this.grid.getNodeById( this.selection.items[0] );
				var to = this.grid.snapPoint( node );
				
				if (!_.size(node.to)) {
					node.x = to.x;
					node.y = to.y;
					this.grid.update();
				} else {
					this.alert("Node must be unconnected");
				}

			} else {
				this.alert("Select a single node");
			}
		},
		
		// Finds and selects the nearest node to the current selection.
		selectNearestGridNode: function() {
			if ( this.nodeOpsEnabled() && this.selection.selectionSize() === 1 ) {
				var nearest = this.grid.getNearestNodeToNode( this.selection.items[0] );
				this.selection.select( nearest.id );
			} else {
				this.alert("Select a single node");
			}
		},
		
		// Hit tests a node among all polygon definitions.
		hitTestGeometry: function() {
			if ( this.selection.selectionSize() === 1 ) {
				var select;
				
				// Get new selection.
				if ( this.nodeOpsEnabled() ) {
					var node = this.grid.getNodeById( this.selection.items[0] );
					select = this.grid.getPolygonHitsForPoint( node );
				} else {
					select = this.grid.getNodesInPolygon( this.selection.items[0] );
				}
				
				if (select && select.length) {
					this.selection.setSelection( select );
				} else {
					this.alert("No intersections");
				}
				
			} else {
				this.alert("Select a single node or polygon");
			}
		},
		
		alert: function(mssg, multiselect) {
			this.trigger( 'alert', mssg, multiselect );
		}
	});
	
	return GridModel;
});