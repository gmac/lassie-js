define(function(require) {
  
  return {
    apiPath: function(endpoint) {
      return location.href.match(/^.*\/\/[^\/]+/g)[0] + '/api/v1/' + endpoint;
    }
  };
});