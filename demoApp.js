"use strict";angular.module("paginationDemo",["ngRoute","stPagination"]).config(["$routeProvider",function(a){a.when("/",{templateUrl:"demoApp/views/demo.html"}).otherwise({redirectTo:"/"})}]),angular.module("paginationDemo").controller("demoController",["$scope","$http",function(a,b){function c(a){var b=a.split(" ");return{hash:b[0],comment:b.slice(1).join(" ")}}function d(a){return!/(^\s*$)/.test(a)}b.get("demoApp/data/angular-commits.txt").success(function(b){var e=b.split("\n"),f=e.filter(d).map(c);a.functionNames=["limit","start","stop","page","displayPage","lastPage","totalPages","onFirstPage","onLastPage","length"],a.displayProperties=["total","startIndex","stopIndex","currentPage","totalPages"],a.propertyTemplate=function(a){return"{{ commits | pageInfo:'"+a+"' }}"},a.getResult=function(a,b){return b[a]()},a.commits=f})}]).controller("cssConfigController",["$scope",function(a){a.cssConfigs=[{label:"Bootstrap 3.x",path:"bower_components/bootstrap-css-only/css/bootstrap.css",configKey:"bootstrap3"},{label:"Bootstrap 2.x",path:"demoApp/styles/bootstrap-2.3.2.css",configKey:"bootstrap2"}],a.selectedCssConfig=a.cssConfigs[0],a.$watch("selectedCssConfig",function(a,b){angular.equals(a,b)||(document.querySelector("link[href='"+b.path+"']").remove(),document.head.appendChild(angular.element("<link rel='stylesheet' href='"+a.path+"' />")[0]))})}]);