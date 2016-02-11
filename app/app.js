'use strict';

// Declare app level module which depends on views, and components
angular.module('rerere', [
  'ngRoute',
  'ui.bootstrap',
  'rerere.cards',
  'rerere.view_upload',
  'rerere.view_board'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/upload'});
}]);

