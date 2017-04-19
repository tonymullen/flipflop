(function () {
  'use strict';

  angular
    .module('flipflops')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Flipflops',
      state: 'flipflops',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'flipflops', {
      title: 'My Flipflops',
      state: 'flipflops.list',
      roles: ['user']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'flipflops', {
      title: 'Judge Flipflops',
      state: 'judge',
      roles: ['user']
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'flipflops', {
      title: 'Create Flipflop',
      state: 'flipflops.record',
      roles: ['user']
    });
  }
}());
