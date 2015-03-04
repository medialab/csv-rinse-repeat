'use strict';

describe('rerere.version module', function() {
  beforeEach(module('rerere.version'));

  describe('version service', function() {
    it('should return current version', inject(function(version) {
      expect(version).toEqual('0.1');
    }));
  });
});
