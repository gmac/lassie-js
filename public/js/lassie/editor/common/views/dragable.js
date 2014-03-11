define(function(require) {
  
  // Imports:
  var $ = require('jquery');
  
  // Implementation:
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
	
  return {
    apply: function(view, ulSelector, gripSelector, equalRowHeights) {
			if (!view.collection) return;
			if (equalRowHeights === undefined) equalRowHeights = true;
			
			var $list = view.$(ulSelector).on('mousedown', gripSelector, function(evt) {
				dragItem(evt, view.collection, equalRowHeights);
			});
		}
  };
});