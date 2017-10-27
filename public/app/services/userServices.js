angular.module('userServices', [])

.factory('User',function($http){

  userFactory = {};
  //User.create(regData) - would be called in userCtrl.js controllers - which is front end services
  userFactory.create = function(regData) {
    return $http.post('/api/users',regData);
  }

  //User.checkusername(regData)
  userFactory.checkusername = function(regData) {
    return $http.post('/api/checkusername',regData);
  }

  //User.checkemail(regData)
  userFactory.checkemail = function(regData) {
    return $http.post('/api/checkemail',regData);
  }

  //User.activateAccount(token);
  userFactory.activateAccount = function(token){
    return $http.put('/api/activate/' + token);
  }


  //User.checkCredential(loginData)
  userFactory.checkCredential = function(loginData){
    return $http.post('/api/resend', loginData);
  }


  //User.resendLink(username)
  userFactory.resendLink = function(username){
    return $http.put('/api/resend', username);
  }

  //User.sendUsername(userData);
  userFactory.sendUsername = function(userData){
    return $http.get('/api/resetusername/'+ userData);
  };

  //User.sendPassword(resetData);
  userFactory.sendPassword = function(resetData){
    return $http.put('/api/resetpassword/', resetData);

  };

  //User.resetUser(token);
  userFactory.resetUser = function(token){
    return $http.get('/api/resetpassword/' + token);
  };

  //User.savePassword(regData);
  userFactory.savePassword = function(regData){
    return $http.put('/api/savepassword',regData);
  };

  //User.renewSession(username);
  userFactory.renewSession = function(username){
    return $http.get('/api/renewToken/' + username);
  };

  //User.getPermission();
  userFactory.getPermission = function(){
      return $http.get('/api/permission');
  };

  //User.getUsers();
  userFactory.getUsers = function(){
    return $http.get('/api/management/');
  };

  //User.getUser();
  userFactory.getUser = function(id){
    return $http.get('/api/edit/'+id);
  };

  //User.getUsers();
  userFactory.deleteUser = function(username){
    return $http.delete('/api/management/'+ username);
  };

  //User.editUser(username);
  userFactory.editUser = function(id){
    return $http.put('/api/edit',id);
  };

  return userFactory;
});
