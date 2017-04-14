'use strict';

describe('Flipflops E2E Tests:', function () {
  describe('Test Flipflops page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/flipflops');
      expect(element.all(by.repeater('flipflop in flipflops')).count()).toEqual(0);
    });
  });
});
