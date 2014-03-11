define(function(require) {

  var _ = require('underscore');

  return {
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
    }
  };
});
