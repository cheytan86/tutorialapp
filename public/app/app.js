// create an angular module
//inject all other angular files in this file
angular.module('userApp',['appRoutes','userControllers','userServices','ngAnimate','mainController','authServices','emailController','managementController'])

.config(function($httpProvider){
  //this is configure application to intercept all http request with AuthInterceptors factory
  $httpProvider.interceptors.push('AuthInterceptors');
});
