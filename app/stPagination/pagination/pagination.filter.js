
angular.module('stPagination').filter('pagination', function (Pagination, findPropertyName) {
  'use strict';

  return function (inputCollection, originalCollection) {
    var collectionWithPaginationHandle;

    if (!inputCollection) {
      return;
    }

    collectionWithPaginationHandle = originalCollection || inputCollection;

    if (!Pagination.hasPagination(collectionWithPaginationHandle)) {
      collectionWithPaginationHandle.pagination = new Pagination(inputCollection);

      if (this && this.$watch) {
        var collectionName = findPropertyName(collectionWithPaginationHandle, this);

        if (collectionName) {
          this.$watch(collectionName, function (newCollection, oldCollection) {
            if (Pagination.hasPagination(oldCollection)) {
              newCollection.pagination = oldCollection.pagination;
            }
          });
        } else {
          throw new Error('Collection passed to stPagination filter was not found in the scope. ' +
              'Pass it to the filter if you have other filters in between.\n' +
              'element in collection | orderBy:"id" | stPagination:collection');
        }
      }
    }
    var pagination = collectionWithPaginationHandle.pagination;
    pagination.setInputCollection(inputCollection);
    return pagination.paginatedInputCollection();
  };
});
