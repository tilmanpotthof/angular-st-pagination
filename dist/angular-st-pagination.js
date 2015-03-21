/*!
 * angular-st-pagination v0.2.0
 * source: git@github.com:tilmanpotthof/angular-st-pagination.git
 * license: MIT (https://raw.githubusercontent.com/tilmanpotthof/angular-st-pagination/master/LICENCE)
 */
angular.module("stPagination", []);

angular.module("stPagination").factory("StPagination", [ "indexUtil", function(indexUtil) {
  "use strict";
  function StPagination(inputCollection) {
    this.$inputCollection = inputCollection;
    this.$limit = 10;
    this.$page = 0;
    this.$cachedReducedIndices = {};
  }
  function hasPagination(collection) {
    return collection && collection.pagination instanceof StPagination;
  }
  function isNumberOrDefault(number, defaultValue) {
    return angular.isNumber(number) ? number : defaultValue;
  }
  StPagination.hasPagination = hasPagination;
  angular.extend(StPagination.prototype, {
    setInputCollection: function(inputCollection) {
      this.$inputCollection = inputCollection;
      this.checkPageLimits();
    },
    paginatedInputCollection: function() {
      return this.$inputCollection.slice(this.start(), this.stop());
    },
    inputCollection: function() {
      return this.$inputCollection;
    },
    start: function() {
      return this.offset();
    },
    stop: function() {
      var stop = this.offset() + this.limit();
      if (stop < this.length()) {
        return stop;
      } else {
        return this.length();
      }
    },
    length: function() {
      return this.$inputCollection.length;
    },
    setLimit: function(limit) {
      this.$limit = limit;
    },
    totalPages: function() {
      return Math.ceil(this.$inputCollection.length / this.limit()) || 1;
    },
    offset: function() {
      return this.$page * this.$limit;
    },
    page: function() {
      return this.$page;
    },
    next: function() {
      this.$page += 1;
      this.checkPageLimits();
    },
    prev: function() {
      this.$page -= 1;
      this.checkPageLimits();
    },
    limit: function() {
      return this.$limit;
    },
    setPage: function(page) {
      if (!angular.isArray(page)) {
        this.$page = page;
      } else {
        var middleIndex = Math.floor((page.length - 1) / 2);
        this.$page = page[middleIndex];
      }
      this.checkPageLimits();
    },
    checkPageLimits: function() {
      if (this.$page < 0) {
        this.$page = 0;
      } else if (this.$page > this.lastPage()) {
        this.$page = this.lastPage();
      }
    },
    onFirstPage: function() {
      return this.page() === 0;
    },
    onLastPage: function() {
      return this.page() === this.lastPage();
    },
    onPage: function(page) {
      return this.page() === page;
    },
    lastPage: function() {
      return this.totalPages() - 1;
    },
    reducedIndices: function(midRange, edgeRange) {
      midRange = isNumberOrDefault(midRange, 3);
      edgeRange = isNumberOrDefault(edgeRange, 3);
      var indexCacheKey = this.indexCacheKey(midRange, edgeRange);
      if (this.$cachedReducedIndices[indexCacheKey]) {
        return this.$cachedReducedIndices[indexCacheKey];
      } else {
        var page = this.page();
        var total = this.totalPages();
        var rangeBuilder = indexUtil.rangeBuilder(total).foldWithMidAndEdgeRangeForIndex(page, midRange, edgeRange);
        var indices = rangeBuilder.build();
        this.$cachedReducedIndices[indexCacheKey] = indices;
        return indices;
      }
    },
    indexCacheKey: function(midRange, edgeRange) {
      return this.page() + "-" + this.limit() + "-" + this.length() + "-" + midRange + "-" + edgeRange;
    },
    displayPage: function() {
      return this.page() + 1;
    },
    displayStart: function() {
      return this.start() + 1;
    }
  });
  return StPagination;
} ]);

angular.module("stPagination").filter("stPagination", [ "StPagination", function(StPagination) {
  "use strict";
  return function(inputCollection, originalCollection) {
    var collectionWithPaginationHandle;
    if (!inputCollection) {
      return;
    }
    collectionWithPaginationHandle = originalCollection || inputCollection;
    if (!StPagination.hasPagination(collectionWithPaginationHandle)) {
      collectionWithPaginationHandle.pagination = new StPagination(inputCollection);
    }
    var pagination = collectionWithPaginationHandle.pagination;
    pagination.setInputCollection(inputCollection);
    return pagination.paginatedInputCollection();
  };
} ]);

angular.module("stPagination").factory("indexUtil", function() {
  "use strict";
  function RangeBuilder(array) {
    this.array = array;
    this.lastIndex = array.length - 1;
  }
  angular.extend(RangeBuilder.prototype, {
    build: function() {
      return this.array;
    },
    foldGreaterThan: function(offset) {
      return this.foldRange(offset + 1, this.lastIndex);
    },
    foldGreaterEquals: function(offset) {
      return this.foldRange(offset, this.lastIndex);
    },
    foldLessThan: function(limit) {
      return this.foldRange(0, limit - 1);
    },
    foldLessEquals: function(limit) {
      return this.foldRange(0, limit);
    },
    foldRange: function(start, stop) {
      var oldArray = this.array;
      var newArray = this.array = [];
      oldArray.forEach(function(value) {
        if (value < start || value > stop || angular.isArray(value)) {
          newArray.push(value);
        } else {
          var lastElement = newArray[newArray.length - 1];
          if (angular.isArray(lastElement)) {
            lastElement.push(value);
          } else {
            newArray.push([ value ]);
          }
        }
      });
      return this;
    },
    foldFixedLengthForIndex: function(index, length) {
      return this.foldWithMidAndEdgeRangeForIndex(index, length, length);
    },
    foldWithMidAndEdgeRangeForIndex: function(index, midRange, edgeRange) {
      var firstFoldStart = 0 + edgeRange;
      var firstFoldStop = index - midRange;
      var secondFoldStart = index + midRange;
      var secondFoldStop = this.lastIndex - edgeRange;
      if (index <= edgeRange + midRange) {
        firstFoldStart = edgeRange + midRange * 2;
        return this.foldRange(firstFoldStart, secondFoldStop);
      } else if (index >= this.lastIndex - (edgeRange + midRange)) {
        secondFoldStop = this.lastIndex - (edgeRange + midRange * 2);
        return this.foldRange(firstFoldStart, secondFoldStop);
      } else {
        return this.foldRange(firstFoldStart, firstFoldStop).foldRange(secondFoldStart, secondFoldStop);
      }
    }
  });
  function range(length) {
    return Array.apply(null, new Array(length)).map(function(_, i) {
      return i;
    });
  }
  function rangeBuilder(length) {
    return new RangeBuilder(range(length));
  }
  return {
    range: range,
    rangeBuilder: rangeBuilder
  };
});

angular.module("stPagination").filter("displayPaginationIndex", function() {
  "use strict";
  return function(index) {
    if (angular.isNumber(index)) {
      return index + 1;
    } else if (angular.isArray(index)) {
      return "...";
    } else {
      return index;
    }
  };
});

angular.module("stPagination").directive("stPaginationLimit", [ "StPagination", function(StPagination) {
  "use strict";
  var DEFAULT_LIMITS = [ 10, 20, 50 ];
  return {
    restrict: "E",
    replace: true,
    template: '<select ng-options="limit for limit in limits()" ng-model="pagination.$limit"></select>',
    scope: {
      collection: "=",
      getLimits: "&limits"
    },
    link: function($scope) {
      $scope.limits = function() {
        return $scope.getLimits() || DEFAULT_LIMITS;
      };
      $scope.$watch("collection", function(collection) {
        if (StPagination.hasPagination(collection)) {
          $scope.pagination = collection.pagination;
        } else {
          delete $scope.pagination;
        }
      });
    }
  };
} ]);

angular.module("stPagination").directive("stPagination", [ "StPagination", function(StPagination) {
  "use strict";
  var css3UserSelectAliases = [ "-webkit-touch-callout", "-webkit-user-select", "-moz-user-select", "-ms-user-select", "user-select" ];
  var basePagination = "<ul>" + '<li ng-class="{disabled: pagination.onFirstPage()}">' + '<a ng-click="pagination.prev()">&laquo;</a>' + "</li>" + '<li ng-class="{active: pagination.onPage(index)}" ' + 'ng-repeat="index in pagination.reducedIndices(midRange, edgeRange)">' + '<a ng-click="pagination.setPage(index)">{{ index | displayPaginationIndex }}</a>' + "</li>" + '<li ng-class="{disabled: pagination.onLastPage()}">' + '<a ng-click="pagination.next()">&raquo;</a>' + "</li>" + "</ul>";
  var transformationForCssConfig = {
    list: function($element) {
      $element.addClass("pagination");
    },
    divWrappedList: function($element) {
      $element.wrap('<div class="pagination"></div>');
    }
  };
  transformationForCssConfig.bootstrap3 = transformationForCssConfig.list;
  transformationForCssConfig.bootstrap2 = transformationForCssConfig.divWrappedList;
  var allowedValues = '"' + Object.keys(transformationForCssConfig).join('", "') + '"';
  var DEFAULT_CSS_CONFIG = "bootstrap3";
  return {
    restrict: "E",
    replace: true,
    scope: {
      collection: "=",
      edgeRange: "=",
      midRange: "="
    },
    template: basePagination,
    compile: function($element, attributes) {
      var cssConfig = attributes.cssConfig || DEFAULT_CSS_CONFIG;
      var transformation = transformationForCssConfig[cssConfig];
      if (angular.isFunction(transformation)) {
        transformation($element);
      } else {
        var msg = 'Given css-config attribute "' + attributes.cssConfig + '" is not in allowed values ' + allowedValues;
        throw new Error(msg);
      }
    },
    controller: [ "$scope", "$element", "$attrs", function($scope, $element, $attrs) {
      angular.forEach(css3UserSelectAliases, function(alias) {
        $element.css(alias, "none");
      });
      var collectionName = $attrs.collection;
      $scope.$watch("collection", function(collection) {
        if (angular.isArray(collection)) {
          if (StPagination.hasPagination(collection)) {
            $scope.pagination = collection.pagination;
          } else {
            var msg = 'Collection "' + collectionName + '" in the pagination directive is not used with a neccessary ' + "pagination filter.";
            throw new Error(msg);
          }
        }
      });
    } ]
  };
} ]);

angular.module("stPagination").filter("stPageInfo", [ "StPagination", function(StPagination) {
  "use strict";
  var propertyNameToFunctionMapping = {
    total: "length",
    totalPages: "totalPages",
    currentPage: "displayPage",
    startIndex: "displayStart",
    stopIndex: "stop"
  };
  return function(inputCollection, propertyName) {
    if (StPagination.hasPagination(inputCollection) && propertyName) {
      var fnName = propertyNameToFunctionMapping[propertyName];
      if (!fnName) {
        throw new Error('No display property "' + propertyName + '" defined for the stPageInfo filter');
      }
      return inputCollection.pagination[fnName]();
    } else {
      return inputCollection;
    }
  };
} ]);