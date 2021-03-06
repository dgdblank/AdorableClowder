angular.module('profileCtrl', [])

.controller('profileController', function (Users, $location, $window) {

  var vm = this;

  vm.user = {};

  vm.getProfile = function () {

    //using Users factory from factories.js to do GET
    Users.getUser()
      .then(function (user) {
        vm.user = user;
      })
      .catch(function (err) {
        console.log(err);
        //if can't get user, redirect to login
        $location.path('/login');
      });
  };
  vm.getProfile();

  
  // set ng-show and ng-hide values
  vm.editorEnabled = false;
  vm.editOffers = false;
  vm.editWants = false;

 // makes fields editable when Edit Profile button clicked
  vm.editProfile = function() {
    vm.editorEnabled = true;
    vm.editOffers = true;
    vm.editWants = true;
    vm.editableOffers = vm.user.offer;
    vm.editableWants = vm.user.want;
  }

// saves changes from user when button clicked
  vm.save = function() {
    vm.user.offer = vm.editableOffers;
    vm.user.want = vm.editableWants;
    vm.editorEnabled = false;
    vm.editOffers = false;
    vm.editWants = false;
    // vm.submitChanges(vm.user);
  }

  vm.submitChanges = function(user){
    Users.saveChanges(user);
  }

});
