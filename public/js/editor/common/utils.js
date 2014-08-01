define(function(require) {
  
  var $ = require('jquery');
  var _ = require('underscore');
  
  function dragItem(evt, collection, equalRowHeights) {
		evt.preventDefault();
		var target = $(evt.target).closest('li').addClass('dragging');
		var list = target.parent();
		var items = list.children();
		var itemH = target.outerHeight();
		var hilite = target;
		var index = -1;
		var after = false;
		
		// Drags an item within the stacking order:
		function drag(pageY) {
			var offset = list.offset();
			var y = pageY - offset.top;
			var i = Math.max(0, Math.min(Math.floor(y/itemH), items.length-1));
			var a = (y > itemH * items.length - itemH / 2);
			
			if (index != i || after != a) {
				index = i;
				after = a;
				hilite.removeClass('hilite');
				hilite = after ? list : items.eq(index);
				hilite.addClass('hilite');
			}
		}
		
		// Drops an item within the stacking order:
		function drop() {
			hilite.removeClass('hilite');
			target.removeClass('dragging');
			
			if (target.index() == index) return;
			
			if (after) {
				items.eq(index).after(target);
			} else {
				items.eq(index).before(target);
			}
			
			list.children().each(function(index) {
				collection.get($(this).attr('data-cid')).set('order', index, {silent: true});
			});
			
			collection.reorder();
		}
		
		$(document)
			.on('mousemove.drag', function(evt) {
				drag(evt.pageY);
			})
			.on('mouseup.drag', function(evt) {
				$(document).off('mousemove.drag mouseup.drag');
				drop();
			});
		
		drag(evt.pageY);
	};
	
	var formCaptureMixin = {
    uiPrompt: function(prompt) {},
    
    events: {
      'click [data-ui]': '_ui',
      'change select': '_change',
      'change input[type="checkbox"]': '_change',
      'blur input[type="text"]': '_change'
    },
    
    _change: function(evt) {
      var $input = this.$(evt.currentTarget);
      var dataType = $input.attr('data-type');
      var name = $input.attr('name');
      var type = $input.attr('type');
      var value = $input.val();
      
      if (type === 'checkbox') {
        // Capture checkbox:
        value = $input.prop('checked');
      }
      else if (dataType === 'number') {
        // Parse and validate number:
        value = parseFloat(value);
        
        // Default invalid input:
        if (isNaN(value) || !isFinite(value)) {
          return $input.val(this.model.get(name));
        }
      }
      
      // Set field to model, and then save any changes:
      this.model.set(name, value);
      if (_.size(this.model.changed)) {
        this.model.save();
      }
    },
    
    _ui: function(evt) {
      evt.preventDefault();
      evt.stopPropagation();
      this.uiPrompt(this.$(evt.currentTarget).attr('data-ui'));
    }
  };
  
  return {
    // Assembles and API endpoint path:
    apiPath: function(endpoint) {
      return location.href.match(/^.*\/\/[^\/]+/g)[0] + '/api/v1/' + endpoint;
    },
    
    // Parses HTML into a template function with data scoped to variable "d":
    // NOTE: using variable-scoped data significantly increases template performance.
    parseTemplate: function(html) {
      return _.template(html, null, {variable: 'd'});
    },

    // Creates singleton accessors on constructor functions:
    // - Class.instance() => provides the singleton class instance.
    // - Class.instance.reset() => resets the singleton with a fresh instance.
    singleton: function(Constructor) {
      var instance;

      Constructor.instance = function() {
        if (!instance) Constructor.instance.reset();
        return instance;
      };

      Constructor.instance.reset = function() {
        instance = new Constructor();
        return instance;
      };

      return Constructor;
    },
    
    // Mixin for adding form-capture behaviors to the view:
    formCapture: function(Constructor) {
      var prototype = Constructor.prototype;
      _.each(formCaptureMixin, function(member, name) {
        if (name === 'events') {
          prototype.events = _.extend(prototype.events || {}, member);
        } else if (!prototype[name]) {
          prototype[name] = member;
        }
      });
      
      return Constructor;
    },
    
    makeDragable: function(view, ulSelector, gripSelector, equalRowHeights) {
			if (!view.collection) return;
			if (equalRowHeights === undefined) equalRowHeights = true;
			
			var $list = view.$(ulSelector).on('mousedown', gripSelector, function(evt) {
				dragItem(evt, view.collection, equalRowHeights);
			});
		},
		
    renderOptions: function(collection) {
      var sel = collection.selected;
      return collection.reduce(function(memo, model) {
        var select = (sel === model.cid || sel === model.id || sel === model.get('slug'));
        var selected = select ? 'selected="selected"' : ''; 
        return memo += ['<option value="', model.cid, '"', selected, '>', model.get('slug'), '</option>'].join('');
      }, '');
    }
  };
});
