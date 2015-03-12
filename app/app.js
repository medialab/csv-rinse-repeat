'use strict';

// Declare app level module which depends on views, and components
angular.module('rerere', [
  'ngRoute',
  'rerere.cards.calendarview',
  'rerere.cards.wordcloud',
  'rerere.view1',
  'rerere.view_board',
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/view1'});
}]);
