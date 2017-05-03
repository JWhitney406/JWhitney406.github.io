angular.module('app', ['ngResource'])
    .controller('Main', function ($scope, $resource, $filter) {

        $scope.notes = [];
        $scope.item = null;
        $scope.allItems = [];
        $scope.allLocations = [];
        $scope.locDict = {};
        $scope.counter = Math.floor(Math.random() * (10000 - 1)) + 1;

        //Setup Resources
        $scope.notes.push("Creating Resources");

        var ItemService = $resource('https://msucs491-spring17-assignment2.azurewebsites.net/api/item/:itemId', { itemId: '@ID' },
        {
            'query': { method: 'GET', isArray: false },
            'save': { method: 'PATCH' }, //NOTE: default save uses POST. need to override
        });
        var NewItemService = $resource('https://msucs491-spring17-assignment2.azurewebsites.net/api/item/:itemId', { itemId: '@ID' },
        {
            'query': { method: 'GET', isArray: false },
        });
        var AllItemService = $resource('https://msucs491-spring17-assignment2.azurewebsites.net/api/item/',
        {
            'query': { method: 'GET', isArray: false },
        });
        var AllLocationService = $resource('https://msucs491-spring17-assignment2.azurewebsites.net/api/location/',
        {
            'query': { method: 'GET', isArray: false },
        });

        //Get Initial Data
        $scope.notes.push("Fetching Item ID 363");

        $scope.allItems = AllItemService.get();
        $scope.allLocations = AllLocationService.get();
        $scope.item = ItemService.get({ itemId: 363 }, function () {
            $scope.notes.push("Updating Item ID 363");
            $scope.item.Quantity = $scope.item.Quantity + 1; //Increment by 1
            $scope.notes.push("Saving Item ID 363");
            $scope.item.$save(); //Save
        });

        $scope.$watch("newItem.Name", function (newVal, oldVal) {
            if (newVal == "test") {
                alert('You named it test');
            }
        });

        $scope.addNewItem = function()
        {
            $scope.item = NewItemService.get({ itemId: 363 }, function () {
                $scope.item.ID = $scope.counter;
                $scope.item.Name = $scope.newItem.Name;
                $scope.item.Description = $scope.newItem.Description;
                $scope.item.Expiration = $scope.newItem.Expiration;
                $scope.item.Location = 67;//TODO fix this/////////////////////////
                $scope.item.Quantity = $scope.newItem.Quantity;
                $scope.item.$save(); //Save
            });
            
            $scope.allItems = AllItemService.get();//update list
            $scope.counter = $scope.counter + 1;
        }
        $scope.addLocById = function (idNum, idName) {
            $scope.locDict[idNum] = idName;
        }
        $scope.myFormatDate = function (date) {
            let d = new Date(date);
            let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

            /*
                Code (next line, edited) taken from: http://stackoverflow.com/questions/3552461/how-to-format-a-javascript-date
                Credit to StackOverflow users: lorem monkey, and sebastian.i
            */
            var datestring = ("0" + d.getDate()).slice(-2) + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" +
                d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
            return datestring;
        }
        $scope.getLocFromId = function(givenLocId)
        {
            if ($scope.locDict[givenLocId] != null) {
                return $scope.locDict[givenLocId];
            } else {
                return "Invalid Location"
            }
        }
        $scope.getTimeUntil = function (d2) {
            let t1 = new Date().getTime();
            let t2 = new Date(d2).getTime();

            if (t2 == new Date(null).getTime()) {
                return "No expiration date specified";
            }

            let daysUntil = parseInt((t2 - t1) / (24 * 3600 * 1000));
            if (daysUntil > 0) {
                if (daysUntil == 1) {
                    return "Expires tomorrow"
                } else {
                    return "Expires in " + daysUntil + " days";
                }
            } else if (daysUntil == 0) {
                return "Expired Today";
            } else {
                if (daysUntil == -1) {
                    return "Expired yesterday";
                } else {
                    return "Expired " + (-daysUntil) + " days ago";
                }
            }
        }


        /*Filtering 
          ItemService.query(function(results)
          {
  		        $scope.results = $filter('filter')(results.Items, 
                function (value, index) {
        	        return (value.Quantity !== 0);
              });
          });
        */

    });