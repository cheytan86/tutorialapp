angular.module('userControllers',['userServices'])

.controller('regCtrl',function($http,$location,$timeout,User){
//$timeout - used for adding wait on the page
//User is the object created in userServices.js
  var app = this;

  this.regUser = function(regData,valid){
    app.disabled = true;
    app.loading = true;
    app.errorMessage = false;
    //console.log('form submitted');

    if(valid){
      // pass this to backend services (api) to call register api
      //User is the custom function created to call the http request (api backend)
      User.create(app.regData).then(function(data){
        //console.log(data.data.success);
        //console.log(data.data.message);
        if(data.data.success){
          app.loading = false;
          //create success message
          //console.log('inside true');
          app.successMsg = data.data.message + '....Redirecting';
          //Redirect to home page
          $timeout(function(){
              $location.path('/');
          },2000);

        }else {
          //create an error message
          app.loading = false;
          app.disabled = false;
          //console.log('inside false');
          app.errorMessage = data.data.message;
        }
      });
    }else {
      app.loading = false;
      app.disabled = false;
      //console.log('inside false');
      app.errorMessage = 'Please ensure form is filled out properly';
    }
  }

  //checkusername(regData);
  this.checkusername = function(regData){
    app.checkingUsername=true;
    app.usernameMsg = false;
    app.usernameinvalid= false;
    User.checkusername(app.regData).then(function(data){
      if(data.data.success){
        //username is not taken
        app.checkingUsername=false;
        app.usernameinvalid= false;
        app.usernameMsg = data.data.message;
      }else{
        app.checkingUsername=false;
        app.usernameinvalid= true;
        app.usernameMsg = data.data.message;
      }
    })
  }

  //checkusername(regData);
  this.checkemail = function(regData){
    app.checkingEmail=true;
    app.emailMsg = false;
    app.emailinvalid= false;
    User.checkemail(app.regData).then(function(data){
      if(data.data.success){
        //username is not taken
        app.checkingEmail=false;
        app.emailinvalid= false;
        app.emailMsg = data.data.message;
      }else{
        app.checkingEmail=false;
        app.emailinvalid= true;
        app.emailMsg = data.data.message;
      }
    })
  }

  //User.checkemail(regData)
  //User.checkusername(regData)

})

// creating a custom directive for matching password and confirm password
.directive('match', function() {
  return {
    restrict: 'A',
    controller:function($scope){
      $scope.confirmed = false;

      $scope.doConfirm = function(values){
        values.forEach(function(ele){
          if($scope.confirm == ele){
            $scope.confirmed = true;
          }else{
            $scope.confirmed = false;
          }

        });
      }
    },
    link: function(scope, element, attrs){
        attrs.$observe('match', function(){
          scope.matches = JSON.parse(attrs.match);
          scope.doConfirm(scope.matches);
        });
        scope.$watch('confirm',function(){
          scope.matches = JSON.parse(attrs.match);
          scope.doConfirm(scope.matches);
        });
    }
  };
})

.controller('facebookCtrl',function($routeParams, Auth, $location, $window){
  var app = this;
  app.errorMessage = false;
  app.expired = false;
  app.disabled = true;

  //Auth.facebook(token);
  //console.log($routeParams.token);
  if($window.location.pathname == '/facebookerror'){
    //provide an error variable
    app.errorMessage = 'facebook email not found in database';

  }else if($window.location.pathname == '/facebook/inactive/error'){
    app.expired = true;
    app.errorMessage = 'Account is not yet activated. Please check your email for activation link';
  }else{
    Auth.facebook($routeParams.token);
    $location.path('/');
  }

})

.controller('twitterCtrl',function($routeParams, Auth, $location, $window){
  var app = this;
  app.errorMessage = false;
  app.expired = false;
  app.disabled = true;

  //Auth.twitter(token);
  //console.log($routeParams.token);
  if($window.location.pathname == '/twittererror'){
    //provide an error variable
    app.errorMessage = 'twitter email not found in database';

  }else if($window.location.pathname == '/twitter/inactive/error'){
    app.expired = true;
    app.errorMessage = 'Account is not yet activated. Please check your email for activation link';
  }else{
    Auth.facebook($routeParams.token);
    $location.path('/');
  }

})

.controller('googleCtrl',function($routeParams, Auth, $location, $window){
  var app = this;
  app.errorMessage = false;
  app.expired = false;
  app.disabled = true;

  //Auth.twitter(token);
  //console.log($routeParams.token);
  if($window.location.pathname == '/googleerror'){
    //provide an error variable
    app.errorMessage = 'google email not found in database';

  }else if($window.location.pathname == '/google/inactive/error'){
    app.expired = true;
    app.errorMessage = 'Account is not yet activated. Please check your email for activation link';
  }else{
    Auth.facebook($routeParams.token);
    $location.path('/');
  }

});
