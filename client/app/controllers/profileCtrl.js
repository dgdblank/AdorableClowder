angular.module('profileCtrl', [])

.controller('profileController', function (Users, $location, $window) {

  var vm = this;

  vm.user = {};

  vm.getProfile = function () {

    //using Users factory from factories.js to do GET
    Users.getUser()
      .then(function (user) {
        console.log('user sent back from profile request-------', user);
        vm.user = user;
      })
      .catch(function (err) {
        console.log(err);
        //if can't get user, redirect to login
        $location.path('/login');
      });
  };
  vm.getProfile();
  
  // Send all changes to database
  vm.changesSaved = true;
  vm.submitChanges = function(){
    vm.changesSaved = false;
    console.log("ProfileCtrl", vm.user);
    Users.saveChanges(vm.user);
  };

});
