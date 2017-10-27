angular.module('mainController',['authServices','userServices'])

.controller('mainCtrl',function(Auth, $timeout, $location, $rootScope,$window,$interval,$route,User,AuthToken){
  //console.log('testing main ctrl');
  //$timeout - used for adding wait on the page
  //Auth is the object created in authServices.js
  var app = this;

  app.loadme = false; //Hide main.html until data is obtained in AngularJS

  app.checkSession = function(){
    if(Auth.isLoggedIn()){
      app.checkingSession = true;
      var interval = $interval(function(){
        //console.log('test');
        var token = $window.localStorage.getItem('token');
        if(token == null){
          $interval.cancel(interval); // once the token expires we stop checking session
        }else{
          self.parseJwt = function(token){
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace('-','+').replace('_','/');
            return JSON.parse($window.atob(base64));
          }
          var expireTime = self.parseJwt(token);
          var timeStamp = Math.floor(Date.now()/1000);
          console.log(expireTime.exp);
          console.log(timeStamp);
          var timeCheck = expireTime.exp - timeStamp;
          console.log('timeCheck: '+ timeCheck);
          if(timeCheck <= 25){
            showModal(1);
            $interval.cancel(interval);
          }else{
              console.log('token has not expired');
          }

        }

      },2000);
    }

  };
  app.checkSession();

  //function to make the modal appear when session is about to timeout
  var showModal = function(option){
    app.choiceMade = false;
    app.modalHeader= undefined;
    app.modalBody = undefined;
    app.hideButton = false;

    if(option == 1){
      app.modalHeader= 'Timeout Warning';
      app.modalBody = 'Your session will expire in 5 minutes. Would you like to renew the session';
      $("#myModal").modal({backdrop: "static"});

    } else if(option == 2){
      //logout portion
      app.hideButton = true;
      app.modalHeader = 'Logging out';
      $("#myModal").modal({backdrop: "static"});
      $timeout(function(){
        Auth.logout();
        $location.path('/');
        hideModal();
        $route.reload();
      },2000);


    }
    $timeout(function(){
      if(!app.choiceMade){
        hideModal();
      }
    },4000);


  };

  app.renewSession = function(){
    app.choiceMade = true;

    User.renewSession(app.username).then(function(data){
        if(data.data.success){
          AuthToken.setToken(data.data.token);
          app.checkSession();

        }else {
          app.modalBody = data.data.message;
        }

    });

    hideModal();
  };

  app.endSession = function(){
    app.choiceMade = true;
    hideModal();
    $timeout(function(){
      showModal(2);
    },1000);
  };

  var hideModal = function(){
    $("#myModal").modal('hide');
  };

  // every time a new view loads check for the username variable
  $rootScope.$on('$routeChangeStart',function(){

    if(!app.checkingSession) app.checkSession();

    if(Auth.isLoggedIn()){
      app.isLoggedIn = true;
      Auth.getUser().then(function(data){
        app.username = data.data.username;
        app.useremail = data.data.email;

        User.getPermission().then(function(data){
          if(data.data.permission === 'admin' || data.data.permission === 'moderator'){
            app.authorized = true;
            app.loadme = true;  // load the page only when all the angular stuff is loaded
          }else{
            app.loadme = true;  // load the page only when all the angular stuff is loaded
          }
        });
      });
    }else {
      app.isLoggedIn = false;
      app.username = '';
      app.loadme = true;
    }
    if($location.hash() == '#_=_') $location.hash(null);

  });

  this.facebook = function(){
    app.disabled = true;
    $window.location = $window.location.protocol + '//' + $window.location.host + '/auth/facebook';
    console.log($window.location);
  };

  this.twitter = function(){
    app.disabled = true;
    $window.location = $window.location.protocol + '//' + $window.location.host + '/auth/twitter';
    console.log($window.location);
  };

  this.google = function(){
    app.disabled = true;
    $window.location = $window.location.protocol + '//' + $window.location.host + '/auth/google';

  };

  this.doLogin = function(loginData){
    app.loading = true;
    app.errorMessage = false;
    app.expired = false;
    app.disabled = true;

    // pass this to backend services (api) to call register api
    //User is the custom function created to call the http request (api backend)
    Auth.login(app.loginData).then(function(data){
      if(data.data.success){
        app.loading = false;
        //create success message
        app.successMsg = data.data.message + '....Redirecting';
        //Redirect to home page
        $timeout(function(){
            $location.path('/about');
            app.loginData = '';
            app.successMsg = false;
            app.disabled = false;
            app.checkSession();

        },2000);

      }else {
        //create an error message
        if(data.data.expired){
          app.expired = true;
          app.loading = false;
          app.errorMessage = data.data.message;
        }else{
          app.loading = false;
          app.disabled = false;
          app.errorMessage = data.data.message;
        }
      }
    });
  };

  app.logout = function(){
    showModal(2);
  };

});
