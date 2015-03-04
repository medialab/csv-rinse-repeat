'use strict';

angular.module('rerere.version', [
  'rerere.version.interpolate-filter',
  'rerere.version.version-directive'
])

.value('version', '0.1');
