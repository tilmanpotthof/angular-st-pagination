'use strict';

describe('Directive: paginationLimit', function () {

  // load the controller's module
  beforeEach(module('stPagination'));

  beforeEach(function () {
    jasmine.addMatchers(customJasmineMatchers);
  });

  var $scope, $basicPaginationLimit, $directiveScope, $compile, $filter, Pagination;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, _$compile_, _$filter_, _Pagination_) {
    $compile = _$compile_;
    $filter = _$filter_;
    Pagination = _Pagination_;
    $scope = $rootScope.$new();
    $basicPaginationLimit = $compile('<st-pagination-limit collection="commits"></st-pagination-limit>')($scope);
    $directiveScope = $basicPaginationLimit.isolateScope();
  }));

  it('should create and replace the st-pagination-limit with a select tag', function () {
    expect($basicPaginationLimit[0].tagName).toBe("SELECT");
  });

  it('should create a new and isolated scope', function () {
    expect($directiveScope).toBeDefined();
    expect($directiveScope.$id).not.toBe($scope.$id);
    expect($directiveScope.commits).toBe(undefined);
  });

  it('should set default limits to [10,20,50]', function () {
    expect($directiveScope.limits()).toEqual([10,20,50]);
  });

  it('should allow to set the limits to different value', function () {
    var $element = $compile('<st-pagination-limit collection="commits" limits="[10,20,50,100]"></st-pagination-limit>')($scope);
    expect($element.isolateScope().limits()).toEqual([10,20,50,100]);
  });

  it('should extract pagination object correctly from the collection', function () {
    $scope.commits = [];
    $filter("pagination")($scope.commits);

    $scope.$apply();

    expect($directiveScope.pagination).toBe($scope.commits.pagination);
    expect($directiveScope.pagination).toBeInstanceOf(Pagination);
  });


  it('should not define a pagination if non is set to the collection', function () {
    $scope.commits = undefined;

    $scope.$apply();
    expect($directiveScope.pagination).not.toBeDefined();

    $scope.commits = [];
    $scope.$apply();
    expect($directiveScope.pagination).not.toBeDefined();
  });

  it('should reset the pagination if the collection is reset', function () {
    $scope.commits = [];
    $filter("pagination")($scope.commits);

    $scope.$apply();
    expect($directiveScope.pagination).toBeDefined();

    $scope.commits = [];
    $scope.$apply();
    expect($directiveScope.pagination).not.toBeDefined();
  });
});