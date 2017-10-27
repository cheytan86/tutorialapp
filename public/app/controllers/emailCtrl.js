angular.module('emailController',['userServices'])

.controller('emailCtrl',function($routeParams, User,$timeout,$location){

  app = this;

  //console.log($routeParams.token);

  User.activateAccount($routeParams.token).then(function(data){
    app.successMsg = false;
    app.errorMessage =false;

      if(data.data.success){
        app.successMsg = data.data.message + '... redirecting';
        $timeout(function(){
          $location.path('/login');
        }, 2000);
      }else{
        app.errorMessage = data.data.message + '... redirecting';
        $timeout(function(){
          $location.path('/login');
        }, 2000);
      }
  });

})

.controller('resendCtrl', function(User){

  app = this;

  app.checkCredential = function(loginData){
    app.disabled = true;
    app.errorMessage = false;
    app.successMsg = false;

    User.checkCredential(app.loginData).then(function(data){
        if(data.data.success){

          User.resendLink(app.loginData).then(function(data){
            if(data.data.success){
              app.successMsg = data.data.message;
            }
          });

        }else{
          app.disabled = false;
          app.errorMessage = data.data.message;
        }

    });
  };

})

.controller('usernameCtrl',function(User){
  app = this;

  app.sendUsername = function(userData,valid){
    app.errorMessage =false;
    app.loading = true;
    app.disabled = true;

    if(valid){
      User.sendUsername(app.userData.email).then(function(data){
        app.loading = false;
        if(data.data.success){
          app.successMsg = data.data.message;
        }else{
          app.disabled = false;
          app.errorMessage = data.data.message;
        }
      });
    }else {
      app.disabled = false;
      app.loading = false;
      app.errorMessage = 'Please enter a valid email';
    }

  };

})


.controller('passwordCtrl',function(User){
  app = this;

  app.sendPassword = function(resetData,valid){
    app.errorMessage =false;
    app.loading = true;
    app.disabled = true;

    if(valid){
      User.sendPassword(app.resetData).then(function(data){
        app.loading = false;
        if(data.data.success){
          app.successMsg = data.data.message;
        }else{
          app.disabled = false;
          app.errorMessage = data.data.message;
        }
      });
    }else {
      app.disabled = false;
      app.loading = false;
      app.errorMessage = 'Please enter a valid Username';
    }

  };

})


.controller('resetCtrl', function(User, $routeParams,$scope,$timeout,$location){

  app = this;
  app.hide = true;

  User.resetUser($routeParams.token).then(function(data){
    if(data.data.success){
      app.hide = false;
      app.successMsg = 'Please enter a new password';
      $scope.username = data.data.user.username;
      console.log($scope.username);
    }else{
      app.errorMessage = data.data.message;
    }
  });

  app.savePassword = function(regData, valid, confirmed){
    app.errorMessage= false;
    app.disabled = true;
    app.loading = true;

    if(valid && confirmed){
      app.regData.username = $scope.username;
      User.savePassword(app.regData).then(function(data){
        app.loading = false;
        if(data.data.success){
          app.successMsg = data.data.message + '...redirecting';
          $timeout(function(){
            $location.path('/login');
          },2000);
        }else{
          app.loading = false;
          app.disabled = false;
          app.errorMessage = data.data.message;
        }
      });
    }else{
      app.disabled = false;
      app.loading = false;
      app.errorMessage = 'Please ensure form is filled out properly';
    }

  }


});
