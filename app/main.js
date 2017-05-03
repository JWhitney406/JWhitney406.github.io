var app = angular.module('app', ['ngResource']);

app.factory('NewItemF', ['Resource', function ($resource) {
    return $resource('https://msucs491-spring17-assignment2.azurewebsites.net/api/item/'), {
        'create' : {method: 'POST'},
    };
}]);

    app.controller('Main', function ($scope, $resource, $filter) {

        $scope.notes = [];
        $scope.item = null;
        $scope.allItems = [];
        $scope.allLocations = [];
        $scope.locDict = {};
        $scope.locIdDict = {};
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
            'save': { method: 'POST' },
        });
        var AllLocationService = $resource('https://msucs491-spring17-assignment2.azurewebsites.net/api/location/',
        {
            'query': { method: 'GET', isArray: false },
        });

        //Get Initial Data
        $scope.notes.push("Fetching Item ID 363");

        $scope.allItems = AllItemService.get();
        $scope.allLocations = AllLocationService.get(function () {
            //console.log("Hello");
            
            //var location;
            /*for (let location in $scope.allLocations.Items) {
                //console.log(location.Name+" "+location.PageIndex);
                console.log(location);
                $scope.addLocById(location.ID, location.Name);
            }*/
            $scope.allLocations.Items.forEach(function (location) {
                console.log(location);
                $scope.addLocById(location.ID, location.Name);
            });
            $scope.addRevLoc();
        });
        $scope.item = ItemService.get({ itemId: 363 }, function () {
            $scope.notes.push("Updating Item ID 363");
            $scope.item.Quantity = $scope.item.Quantity + 1; //Increment by 1
            $scope.notes.push("Saving Item ID 363");
            $scope.item.$save(); //Save
        });

        $scope.getColor = function(expVal)
        {
            if (expVal.includes('Expires in 3 days') || expVal.includes('Expires in 2 days') || expVal.includes('Expires tomorrow')) {
                return "yellow";
            } else if (expVal.includes('Expired')) {
                return "red";
            } else {
                return "lightgreen";
            }
        }

        $scope.$watch("newItem.Name", function (newVal, oldVal) {
            if (newVal == "Jack" || newVal == "jack") {
                console.log('I don\'t know that I would consider Jack to be food');
            } else if (newVal == "Andy" || newVal == "andy") {
                console.log('I don\'t know that I would consider Andy to be food');
            }
        });

        $scope.addNewItem = function()
        {
            $scope.item.ID = $scope.counter;
            $scope.item.Name = $scope.newItem.Name;
            $scope.item.Description = $scope.newItem.Description;
            $scope.item.Expires = new Date($scope.newItem.Expires);
            $scope.item.Created = new Date();
            $scope.item.LocationID = $scope.locIdDict[$scope.newItem.Location.trim()];
            $scope.item.Quantity = $scope.newItem.Quantity;
            AllItemService.save($scope.item, function () {
                $scope.allItems = AllItemService.get();//update list
                $scope.counter = $scope.counter + 1;
            });
        }
        $scope.modItem = function (itemNum) {
            if (itemNum == null) {
                alert("You must specify and item to modify");
                return;
            }
            $scope.item = ItemService.get({ itemId: itemNum }, function () {
                $scope.item.ID = itemNum;
                $scope.item.Name = $scope.modItem.Name || $scope.item.Name;
                $scope.item.Description = $scope.modItem.Description || $scope.item.Description;
                $scope.item.Expires = $scope.modItem.Expires || $scope.item.Expires;
                $scope.item.Location = $scope.locIdDict[$scope.modItem.Location] || $scope.item.Location;
                $scope.item.Quantity = $scope.modItem.Quantity || $scope.item.Quantity;
                ItemService.save($scope.item, function () {
                    $scope.allItems = AllItemService.get();//update list
                });
            });
        }

        $scope.addLocById = function (idNum, idName) {
            $scope.locDict[idNum] = idName;
            //console.log(idNum+", "+$scope.locDict[idNum]);
        }
        $scope.addRevLoc = function () {
            for (var key in $scope.locDict) {
                //if ($scope.locDict.hasOwnProperty(key)) {
                    $scope.locIdDict[$scope.locDict[key]] = key;
                //}
            }
            console.log("revLoc");
            console.log("TEST");
            console.log($scope.locIdDict);
        }
        $scope.myFormatDate = function (date) {
            let d = new Date(date);
            //let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

            /*
                Code (next line, edited) taken from: http://stackoverflow.com/questions/3552461/how-to-format-a-javascript-date
                Credit to StackOverflow users: lorem monkey, and sebastian.i
            */
            var datestring = ("0" + d.getDate()).slice(-2) + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" +
                d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
            return d.toDateString();
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

            let daysUntil = parseInt(Math.ceil((t2 - t1) / (24 * 3600 * 1000)));
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