(function () {
  'use strict';

  describe('Flipflops Route Tests', function () {
    // Initialize global variables
    var $scope,
      FlipflopsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _FlipflopsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      FlipflopsService = _FlipflopsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('flipflops');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/flipflops');
        });

        it('Should be abstract', function () {
          expect(mainstate.abstract).toBe(true);
        });

        it('Should have template', function () {
          expect(mainstate.template).toBe('<ui-view/>');
        });
      });

      describe('View Route', function () {
        var viewstate,
          FlipflopsController,
          mockFlipflop;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('flipflops.view');
          $templateCache.put('modules/flipflops/client/views/view-flipflop.client.view.html', '');

          // create mock Flipflop
          mockFlipflop = new FlipflopsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Flipflop Name'
          });

          // Initialize Controller
          FlipflopsController = $controller('FlipflopsController as vm', {
            $scope: $scope,
            flipflopResolve: mockFlipflop
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:flipflopId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.flipflopResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            flipflopId: 1
          })).toEqual('/flipflops/1');
        }));

        it('should attach an Flipflop to the controller scope', function () {
          expect($scope.vm.flipflop._id).toBe(mockFlipflop._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/flipflops/client/views/view-flipflop.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          FlipflopsController,
          mockFlipflop;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('flipflops.record');
          $templateCache.put('modules/flipflops/client/views/record-flipflop.client.view.html', '');

          // create mock Flipflop
          mockFlipflop = new FlipflopsService();

          // Initialize Controller
          FlipflopsController = $controller('FlipflopsController as vm', {
            $scope: $scope,
            flipflopResolve: mockFlipflop
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.flipflopResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/flipflops/create');
        }));

        it('should attach an Flipflop to the controller scope', function () {
          expect($scope.vm.flipflop._id).toBe(mockFlipflop._id);
          expect($scope.vm.flipflop._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/flipflops/client/views/form-flipflop.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          FlipflopsController,
          mockFlipflop;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('flipflops.edit');
          $templateCache.put('modules/flipflops/client/views/form-flipflop.client.view.html', '');

          // create mock Flipflop
          mockFlipflop = new FlipflopsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Flipflop Name'
          });

          // Initialize Controller
          FlipflopsController = $controller('FlipflopsController as vm', {
            $scope: $scope,
            flipflopResolve: mockFlipflop
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:flipflopId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.flipflopResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            flipflopId: 1
          })).toEqual('/flipflops/1/edit');
        }));

        it('should attach an Flipflop to the controller scope', function () {
          expect($scope.vm.flipflop._id).toBe(mockFlipflop._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/flipflops/client/views/form-flipflop.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
