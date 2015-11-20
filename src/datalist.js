/**
 * DATALIST Directive for AngularJS
 * @version v0.0.1
 * @link http://www.ambersive.com
 * @licence MIT License, http://www.opensource.org/licenses/MIT
 */

(function(window, document, undefined) {

    'use strict';

    angular.module('ambersive.datalist',['ambersive.rest','ambersive.helper']);

    angular.module('ambersive.datalist').run(['$rootScope',
        function ($rootScope) {

        }
    ]);

    angular.module('ambersive.datalist').provider('$datalistSettings',[function(){
        var standardTemplatePath     =  'src/views/datalist.default.html',
            standardEntriesValue     =  'entries',
            standardTitleValue       =  'title',
            standardIdentityValue     =  'id',
            standardEntriesPerPage   = 25,
            setTemplatePath          = function(path){
                standardTemplatePath = path;
                return standardTemplatePath;
            },
            setTitleValue           = function(value){
                standardTitleValue = value;
                return standardTitleValue;
            },
            setEntriesPerPage       = function(value){
                if(angular.isNumber(value)){
                    standardEntriesPerPage = value;
                }
            },
            setEntriesValue       = function(value){
                standardEntriesValue = value;
            };

        return {
            setTemplatePath:setTemplatePath,
            setTitleValue: setTitleValue,
            setEntriesPerPage: setEntriesPerPage,
            setEntriesValue:setEntriesValue,
            $get: function () {
                return {
                    templatePath:standardTemplatePath,
                    titleValue:standardTitleValue,
                    identityValue:standardIdentityValue,
                    entriesPerPage:standardEntriesPerPage,
                    entriesValue:standardEntriesValue,
                };
            }
        };
    }]);

    angular.module('ambersive.datalist').factory('DatalistSrv',['$q','$log','$rootScope','$datalistSettings','RestSrv','HelperSrv',
        function($q,$log,$rootScope,$datalistSettings,RestSrv,HelperSrv){

            var DatalistSrv;

            return DatalistSrv;

        }]);

    angular.module('ambersive.datalist').filter('range', function() {
        return function(input, total) {
            total = parseInt(total);

            for (var i=0; i<total; i++) {
                input.push(i);
            }

            return input;
        };
    });

    angular.module('ambersive.datalist').directive('datalist', ['$compile','HelperSrv','$log',
        function ($compile,HelperSrv,$log) {
            var Datalist = {};

            // Settings

            Datalist.restrict = 'E';
            Datalist.replace = true;
            Datalist.transclude = true;
            Datalist.scope = {
                uniqueName:'@',
                ctrl: '@',
                restUrl: '@',
                restDeleteUrl:'@',
                templateUrl:'@',
                titleValue:'@',
                identityValue:'@',
                entriesPerPage:'@',
                entriesValue:'@',
                identify:'@',
                detailRoute:'@',
                removeQuerystring:'@',
                settings:'='
            };

            Datalist.controller = ['$rootScope','$scope','$controller','$datalistSettings','RestSrv','HelperSrv',
                function ($rootScope,$scope,$controller,$datalistSettings,RestSrv,HelperSrv) {

                    // Variables

                    $scope.templatePath         = $datalistSettings.templatePath;
                    $scope.broadcastID          = HelperSrv.generator.alphanumeric(10);
                    $scope.total                = 0;
                    $scope.pages                = 1;
                    $scope.currentPage          = 1;
                    $scope.data                 = [];
                    $scope.uiRouterAvailable    = false;
                    $scope.actionDisabled       = true;
                    $scope.allSelected          = false;
                    $scope.selectedData         = [];

                    if($scope.settings === undefined){
                        $scope.settings = {};
                    }

                    if($scope.removeQuerystring === undefined){
                        $scope.removeQuerystring = false;
                    } else {
                        if($scope.removeQuerystring === 'true' || $scope.removeQuerystring === true){
                            $scope.removeQuerystring = true;
                        } else {
                            $scope.removeQuerystring = false;
                        }
                    }

                    if($scope.uniqueName === undefined){
                        $scope.uniqueName = 'datalist';
                    }

                    if($scope.templateUrl === undefined || $scope.templateUrl === ''){
                        $scope.templateUrl = $datalistSettings.templatePath;
                    }

                    if($scope.titleValue === undefined || $scope.titleValue === ''){
                        $scope.titleValue = $datalistSettings.titleValue;
                    }

                    if($scope.identityValue === undefined || $scope.identityValue === ''){
                        $scope.identityValue = $datalistSettings.identityValue;
                    }

                    if($scope.entriesPerPage === undefined || $scope.entriesPerPage === ''){
                        $scope.entriesPerPage = $datalistSettings.entriesPerPage;
                    } else {
                        $scope.entriesPerPage = parseInt($scope.entriesPerPage);
                    }

                    if($scope.entriesValue === undefined || $scope.entriesValue === ''){
                        $scope.entriesValue = $datalistSettings.entriesValue;
                    }

                    // Functions

                    var parseResult = function(result){

                        if(result.data.total !== undefined && angular.isNumber(result.data.total)){
                            $scope.total = result.data.total;
                            $scope.pages = Math.ceil($scope.total/$scope.entriesPerPage);
                        }

                        var entriesValue = $scope.entriesValue;

                        if(result.data[entriesValue] !== undefined && angular.isArray(result.data[entriesValue])){
                            $scope.data = result.data[entriesValue];

                            var entries = $scope.data.length;
                            for(var entry=0;entry<entries;entry++){
                                if($scope.selectedData.indexOf($scope.data[entry][$scope.identityValue]) > -1){
                                    $scope.data[entry].isSelected = true;
                                } else {
                                    $scope.data[entry].isSelected = false;
                                }
                            }

                        } else {
                            $log.warn('ambersive.datalist: Json result doesn`t fit the datalist pattern {"total":0,"'+entriesValue+'":[]}');
                        }
                    };

                    $scope.itemCheckClickAll = function (b,ele) {
                        $scope.allSelected = b;

                        var looper = function (dataArr,callback) {
                            var l = dataArr.length;
                            for (var i = 0; i < l; i++) {
                                if (b === true) {
                                    if ($scope.selectedData.indexOf(dataArr[i][ele]) === -1) {
                                        if (dataArr[i][ele]) {
                                            $scope.selectedData.push(parseInt(dataArr[i][ele]));
                                        } else {
                                            $scope.selectedData.push(dataArr[i][ele]);
                                        }
                                    }
                                    if (dataArr[i].children !== undefined) {
                                        /* jshint ignore:start */
                                        looper(dataArr[i].children, function (data) {
                                            dataArr[i].children = data;
                                        });
                                        /* jshint ignore:end */
                                    }
                                } else {
                                    $scope.selectedData = [];
                                }
                                dataArr[i].isSelected = b;
                                if (i + 1 === l) {
                                    callback(dataArr);
                                }
                            }
                        };

                        looper($scope.data,function (data) {
                            $scope.data = data;
                            $scope.listBroadcast();
                        });

                    };

                    $scope.insertItemClick = function (e, selected, item, ele) {

                        var index = -1;

                        if(selected === undefined || selected === null){ selected = false; }

                        try {

                            index = $scope.selectedData.indexOf(item[ele]);

                            if(index === -1 && selected === true){
                                $scope.selectedData.push(item[ele]);
                            } else {
                                $scope.selectedData.splice(index, 1);
                            }

                        } catch(err){
                            $log.error(err);
                        }

                        $scope.listBroadcast();
                    };

                    $scope.setActionDisabled = function(){
                        if($scope.selectedData.length > 0){
                            $scope.actionDisabled = false;
                        } else {
                            $scope.actionDisabled = true;
                        }
                    };

                    $scope.setPage = function(page){
                        $scope.currentPage = parseInt(page);
                        $scope.init();
                    };

                    $scope.setPreviousPage = function(){
                        if($scope.currentPage > 1){
                            $scope.currentPage--;
                            $scope.setPage($scope.currentPage);
                        }
                    };
                    $scope.setNextPage = function(){
                        if($scope.currentPage < $scope.pages){
                            $scope.currentPage++;
                            $scope.setPage($scope.currentPage);
                        }
                    };

                    $scope.getData = function(url){

                        if(url === undefined){
                            url = $scope.restUrl;
                        }

                        RestSrv.call({
                            'method': 'GET',
                            'url':url
                        }, function (result) {
                            parseResult(result);
                        });
                    };

                    $scope.open = function(identifiyValue){
                      $log.warn('ambersive.datalist: Please define a $scope.open function or use detail-route parameter');
                    };

                    $scope.deleteWarning = function(arrIdenityValues,callback){
                        if(callback){
                            callback(true);
                        }
                    };

                    $scope.delete = function(arrIdenityValues){
                        var deleteUrl = $scope.restUrl,
                            amountIDs = arrIdenityValues.length,
                            deleteErrors = 0,
                            deleteFN = function(id,callback){

                                if($scope.removeQuerystring === true || $scope.removeQuerystring === 'true'){
                                    deleteUrl = deleteUrl.split("?")[0];
                                }

                                RestSrv.call({
                                    'method': 'DELETE',
                                    'url':deleteUrl+'/'+id
                                }, function (result) {
                                    if(result.status !== 200){
                                        deleteErrors++;
                                    }
                                    if(callback){
                                        callback();
                                    }
                                });
                            };

                        if($scope.restDeleteUrl !== undefined && $scope.restDeleteUrl !== ''){
                            deleteUrl = $scope.restDeleteUrl;
                        }

                        $scope.deleteWarning(arrIdenityValues,function(next){
                            var counter = 0;
                            if(next === false){return;}
                            deleteErrors = 0;

                            for(var i= 0;i<amountIDs;i++){
                                counter = counter+1;
                                /* jshint ignore:start */
                                deleteFN(arrIdenityValues[i],function(){
                                    if(counter === amountIDs){
                                        $scope.init();
                                        $scope.deleteBroadcast(deleteErrors,arrIdenityValues);
                                        arrIdenityValues = [];
                                        $scope.selectedData = arrIdenityValues;
                                    }
                                });
                                /* jshint ignore:end */
                            }
                        });
                    };

                    $scope.init = function(){
                        var urlAddon = '';

                        try {
                            angular.module('ui.router');
                            if($scope.detailRoute !== undefined && $scope.detailRoute !== '') {
                                $scope.uiRouterAvailable = true;
                            }
                        } catch(err){

                        }

                        if($scope.restUrl !== undefined && $scope.restUrl !== ''){
                            if(angular.isFunction($scope.getData) === true){
                                if($scope.currentPage !== 1){
                                    urlAddon = '?page='+$scope.currentPage;
                                }
                                $scope.getData($scope.restUrl+urlAddon);
                            }
                        } else {
                            $scope.getData = function () {
                                $rootScope.$broadcast('get' + $scope.uniqueName.toUpperCase());
                            };
                            $scope.getData();
                        }

                    };

                    // Broadcastings

                    $scope.listBroadcast = function(){
                        var data = {
                            allSelected:$scope.allSelected,
                            selectedData:$scope.selectedData
                        };

                        $scope.setActionDisabled();
                        $rootScope.$broadcast('update' + $scope.uniqueName.toUpperCase(),data);
                    };

                    $scope.deleteBroadcast = function(deleteErrors,arrIdenityValues){
                        $rootScope.$broadcast('delete' + $scope.uniqueName.toUpperCase(),{
                            'errors':deleteErrors,
                            'ids':arrIdenityValues
                        });
                    };

                    $scope.$on('return' + $scope.uniqueName.toUpperCase(), function (event, args) {
                        parseResult(args);
                    });

                    $scope.$on('update' + $scope.uniqueName.toUpperCase(), function (event, args) {
                        $scope.getData();
                    });

                    $scope.$on('request' + $scope.uniqueName.toUpperCase(), function (event, args) {
                        $rootScope.$broadcast('send' + $scope.uniqueName.toUpperCase(),{
                            'data':$scope.data
                        });
                    });

                    // Load additonal controller

                    var counter = 0;
                    var loadedCtrl = function (ctrl) {
                        if(ctrl === undefined){
                            return;
                        }
                        try {
                            return $controller(ctrl, {
                                $scope: $scope
                            });
                        } catch (err) {
                            $log.error(err);
                        }
                    };

                    loadedCtrl($scope.ctrl);

                    $scope.init();
            }];

            Datalist.link = function (scope, element, attrs) {
                try {
                    var html = HelperSrv.template.forUrl(scope.templateUrl);
                    if(html === '' || html === null){
                        throw 'ambersive.datalist: template is empty';
                    } else {
                        element.html(html);
                        element.replaceWith($compile(element.html())(scope));
                    }
                } catch (err) {
                    alert(err);
                }
            };

            return Datalist;
    }]);

})(window, document, undefined);