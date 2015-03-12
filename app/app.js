'use strict';

// Declare app level module which depends on views, and components
angular.module('rerere', [
  'ngRoute',
  'rerere.view1',
  'rerere.view_board',
  'rerere.version',
  'rerere.cards.calendarview'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/view1'});
}]);
