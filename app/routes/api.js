var User = require('../models/user');
var jwt = require('jsonwebtoken');  // for user session
var secret = "chetanmalhotra";
var nodemailer = require('nodemailer');
//var sgTransport = require('nodemailer-sendgrid-transport');

module.exports = function(router) {

/*var options = {
  auth: {
    api_user: 'cheytan',
    api_key: 'cm_delhi_1986'
  }
}*/

 var client = nodemailer.createTransport({ service: 'Zoho', auth: { user: 'chetan@laundrywala.co.in', pass: 'cm_delhi_86' },tls: { rejectUnauthorized: false } });


  //http://localhost:8080/api/users
  //User Registration route
  router.post('/users',function(req,res){
    var user = new User();
    user.username = req.body.username;
    user.password = req.body.password;
    user.email = req.body.email;
    user.name = req.body.name;
    user.temporarytoken = jwt.sign({username: user.username, email: user.email }, secret, { expiresIn: '24h'});

    if(req.body.username == null || req.body.username == '' || req.body.password == null || req.body.password == ''  || req.body.email == null ||
    req.body.email == '' || req.body.name == null || req.body.name == ''){
      //res.send('Ensure username, email or password was provided'); was used while creasting service
      console.log('username:' + req.body.username  + 'password:'+ req.body.password + 'email:' + req.body.email );
      res.json({success: false, message: 'Ensure username, email or password was provided'}); // to psss info to front end for success or failure we will use res.json
    }else{
      user.save(function(err){
        if(err){

            if(err.errors != null){

                if(err.errors.name){
                  res.json({success: false, message: err.errors.name.message });
                }else if(err.errors.email){
                  res.json({success: false, message: err.errors.email.message });
                }else if(err.errors.username){
                  res.json({success: false, message: err.errors.username.message });
                }else if(err.errors.password){
                  res.json({success: false, message: err.errors.password.message });
                }else {
                  res.json({success: false, message: err });
                }

            }else if(err){
              if(err.code = 11000){
                res.json({success: false, message: 'Username or e-mail already taken' });
              }else{
                res.json({success: false, message: err });
              }
            }

        }else{



            var email = {
              from: 'chetan@laundrywala.co.in',
              to: user.email,
              subject: 'Localhost Activation Link',
              text: 'Hello' + user.name + ',Thank you for registering at localhost.com. Please click on the link to complete activation:http://localhost:8080/activate/'+ user.temporarytoken,
              html: 'Hello<strong>' + user.name + '</strong>,<br><br>Thank you for registering at localhost.com. Please click on the link below to complete activation:<br><br><a href="http://localhost:8080/activate/'+ user.temporarytoken +'">http://localhost:8080/activate/</a>'
            };

            client.sendMail(email, function(err, info){
                if (err ){
                  console.log('Error on sending email:' + err);
                }
                else {
                  console.log('Message sent: ' + info);
                }
            });

          res.json({success: true, message: 'Account Registered! Please check your e-mail for activation link.'});
        }
      });

    }

  });


  //http://localhost:8080/api/checkusername
  router.post('/checkusername', function(req,res){
    User.findOne({ username: req.body.username}).select('username').exec(function(err,user){
      if(err) throw err;

      if(user){
        res.json({success: false,message:'Username is already taken'});
      }else{
        res.json({success: true,message:'Valid username'});
      }
    });
  });

  //http://localhost:8080/api/checkusername
  router.post('/checkemail', function(req,res){
    User.findOne({ email: req.body.email}).select('email').exec(function(err,user){
      if(err) throw err;

      if(user){
        res.json({success: false,message:'email is already taken'});
      }else{
        res.json({success: true,message:'Valid email'});
      }
    });
  });

  //User Login Route
  //http://localhost:8080/api/authenticate
  router.post('/authenticate', function(req,res){
    User.findOne({ username: req.body.username}).select('email username password active').exec(function(err,user){
      if(err) throw err;

      if(!user) {
        res.json({success: false,message: 'Could not authenticate user'});
      }else if( user){
        //start the password validation
        if(req.body.password){
          var validPassword = user.comparePassword(req.body.password);
        }else{
          res.json({success: false,message: 'No password provided!'});
        }

        if(!validPassword){
          res.json({success: false,message: 'Could not authenticate password'});
        }else if(!user.active){
          res.json({success: false,message: 'Account is not yet activated. Please check your email for activation link', expired:true});
        }else{
          //to maintain user session for 24 hr token is created
          var token = jwt.sign({username: user.username, email: user.email }, secret, { expiresIn: '30s'});
          res.json({success: true,message: 'User Authenicated!',token: token});
        }

      }
    });
  });

  router.put('/activate/:token',function(req, res){
    User.findOne({ temporarytoken: req.params.token }, function(err,user){
      if(err) throw err;

      var token = req.params.token;

      jwt.verify(token, secret, function(err, decoded){
        if(err){
          res.json({success: false,message: 'Activation link has expired'});
        }else if(!user){
          res.json({success: false,message: 'Activation link has expired'});
        }else{
          user.temporarytoken = false;
          user.active = true;
          user.save(function(err){
            if(err){
              console.log(err);
            }else{

              var email = {
                from: 'chetan@laundrywala.co.in',
                to: user.email,
                subject: 'Localhost Account Activated',
                text: 'Hello' + user.name + ',Your account has been successfully activated',
                html: 'Hello<strong>' + user.name + '</strong>,<br><br>Your account has been successfully activated'
              };

              client.sendMail(email, function(err, info){
                  if (err ){
                    console.log(err);
                  }
                  else {
                    console.log('Message sent: ' + info.response);
                  }
              });

              res.json({success: true,message: 'Account activated'});
            }
          });
        }
      });

    });
  });


  router.post('/resend', function(req,res){
    User.findOne({ username: req.body.username}).select('username password active').exec(function(err,user){
      if(err) throw err;

      if(!user) {
        res.json({success: false,message: 'Could not authenticate user'});
      }else if( user){
        //start the password validation
        if(req.body.password){
          var validPassword = user.comparePassword(req.body.password);
        }else{
          res.json({success: false,message: 'No password provided!'});
        }

        if(!validPassword){
          res.json({success: false,message: 'Could not authenticate password'});
        }else if(user.active){
          res.json({success: false,message: 'Account is already activated'});
        }else{
          //to maintain user session for 24 hr token is created
          res.json({success:true,user: user});
        }
      }
    });
  });

  router.put('/resend', function(req,res){
    User.findOne({ username: req.body.username}).select('username name email temporarytoken').exec(function(err, user){
      if(err) throw err;

      user.temporarytoken = jwt.sign({username: user.username, email: user.email }, secret, { expiresIn: '24h'});
      user.save(function(err){
        if(err){
          console.log(err);
        }else{

          var email = {
            from: 'chetan@laundrywala.co.in',
            to: user.email,
            subject: 'Localhost Activation Link Request',
            text: 'Hello' + user.name + ',You recently requested a new account activation link.Please click on the link to complete activation:http://localhost:8080/activate/'+ user.temporarytoken,
            html: 'Hello<strong>' + user.name + '</strong>,<br><br>You recently requested a new account activation link Please click on the link below to complete activation:<br><br><a href="http://localhost:8080/activate/'+ user.temporarytoken +'">http://localhost:8080/activate/</a>'
          };

          client.sendMail(email, function(err, info){
              if (err ){
                console.log(err);
              }
              else {
                console.log('Message sent: ' + info);
              }
          });
          res.json({success:true,message:'Activation link has been sent to '+ user.email + '!'});
        }
      });

    });

  });

  router.get('/resetusername/:email', function(req,res){
    User.findOne({email: req.params.email}).select('email name username').exec(function(err,user){
      if(err){
        res.json({success:false, message:err});
      }else {
        if(!req.params.email){
          res.json({success:false, message:'No Email was provided'});
        }else{
          if(!user){
            res.json({success:false, message:'Email was not found'});
          }else {
            var email = {
              from: 'chetan@laundrywala.co.in',
              to: user.email,
              subject: 'Localhost Username Request',
              text: 'Hello' + user.name + ',You recently requested your username. Please save it to your files:' + user.username,
              html: 'Hello<strong>' + user.name + '</strong>,<br><br>You recently requested your username. Please save it to your files:' + user.username
            };

            client.sendMail(email, function(err, info){
                if (err ){
                  console.log(err);
                }
            });

            res.json({success:true, message:'Username has been sent to Email'});
          }
        }
      }
    });
  });

  router.put('/resetpassword',function(req,res){
    User.findOne({ username:req.body.username}).select('username active email resettoken name').exec(function(err,user){

      if(err) throw err;

      if(!user){
        res.json({success:false, message:'Username was not found'});
      }else if(!user.active){
        res.json({success:false, message:'Account has not yet been activated'});
      }else{
        user.resettoken = jwt.sign({username: user.username, email: user.email }, secret, { expiresIn: '24h'});
        user.save(function(err){
          if(err){
            res.json({success:false, message:err});
          }else{

            var email = {
              from: 'chetan@laundrywala.co.in',
              to: user.email,
              subject: 'Localhost Activation Link Request',
              text: 'Hello' + user.name + ',You recently requested a password reset link.Please click on the link below to reset:http://localhost:8080/reset/'+ user.resettoken,
              html: 'Hello<strong>' + user.name + '</strong>,<br><br>You recently requested a password reset link Please click on the link below to reset:<br><br><a href="http://localhost:8080/reset/'+ user.resettoken +'">http://localhost:8080/reset/</a>'
            };
            client.sendMail(email, function(err, info){
                if (err ){
                  console.log(err);
                }
            });
            res.json({success:true, message:'Please check your email for password link'});
          }
        });
      }
    });
  });

  router.get('/resetpassword/:token', function(req, res){

    User.findOne({resettoken:req.params.token }).select().exec(function(err,user){
      if(err) throw err;

      var token = req.params.token;
      //verify token
      jwt.verify(token, secret, function(err, decoded){
        if(err){
          res.json({success: false,message: 'Password link has expired'});
        }else{
          if(!user){
            res.json({success: false,message: 'Password link has expired'});
          }else{
            res.json({success: true,user: user});
          }

        }
      });

    });

  });

  router.put('/savepassword', function(req, res){

    User.findOne({username: req.body.username}).select('username name email password resettoken').exec(function(err, user){

      if(err) throw err;
      if(req.body.password == null ||req.body.password == ''){

        res.json({success: false,message: 'Password not provided'});
      }else{

        user.password = req.body.password;
        user.resettoken = false;
        user.save(function(err){

          if(err){
            res.json({success: false,message: err});
          }else{
            var email = {
              from: 'chetan@laundrywala.co.in',
              to: user.email,
              subject: 'Localhost Reset Password',
              text: 'Hello' + user.name + ',This e-mail is to notify that your password was reset at localhost.com',
              html: 'Hello<strong>' + user.name + '</strong>,<br><br>This e-mail is to notify that your password was reset at localhost.com'
            };
            client.sendMail(email, function(err, info){
                if (err ){
                  console.log(err);
                }
            });
            res.json({success: true,message: 'Password has been reset!'});
          }

        });
      }
    });

  });

  //router.use is used for middle ware
  router.use(function(req,res,next){
    var token = req.body.token || req.body.query || req.headers['x-access-token'];

    if(token){
      //verify token
      jwt.verify(token, secret, function(err, decoded){
        if(err){
          res.json({success: false,message: 'Token invalid'});
        }else{
          req.decoded = decoded;
          // will tell the application to continue to other route
          next();
        }
      });
    }else {
      res.json({success: false,message: 'No token provided'});
    }

  });

  //function placed after middle ware because they can be performed once user is logged out

  router.post('/me',function(req,res){
    res.send(req.decoded);
    //to get the details of the users decrypted , we need a middle ware
    //so we ill create a function to get it - router.use()
  });

  router.get('/renewToken/:username', function(req, res){

    User.findOne({ username: req.params.username}).select().exec(function(err, user){
      if (err) throw err;

      if(!user){

        res.json({success: false, message:'No user was found'});

      }else{

        var newToken = jwt.sign({username: user.username, email: user.email }, secret, { expiresIn: '24h'});
        res.json({success: true,token: newToken});

      }


    });

  });


  router.get('/permission',function(req,res){
    // since it is running after middle ware we can make use of user found in middleware
    User.findOne({ username:req.decoded.username}, function(err,user){
      if(err) throw err;

      if(!user){
        res.json({success: false,message:'No user was found'});
      } else {
        res.json({success: true,permission: user.permission});
      }

    });
  });

  router.get('/management', function(req, res){
    User.find({},function(err, users){

      if(err) throw err;
      User.findOne({username:req.decoded.username}, function(err,mainUser){
        if (err) throw err;

        if(!mainUser){
          res.json({success: false,message:'No user was found'});
        }else{
          if(mainUser.permission === 'admin' || mainUser.permission === 'moderator'){
            if(!users){
              res.json({success: false,message:'Users not found'});
            }else{
              res.json({success: true,users:users, permission: mainUser.permission });
            }

          }else{
            res.json({success:false, message:'Insufficient Permissions'});
          }
        }

      });

    });

  });

  router.delete('/management/:username',function(req, res){
    var deletedUser = req.params.username;
    User.findOne({username:req.decoded.username}, function(err,mainUser){
      if (err) throw err;

      if(!mainUser){
        res.json({success: false,message:'No user was found'});
      }else {
        if(mainUser.permission !== 'admin'){
            res.json({success: false,message:'Insufficient permission'});
        }else{
          User.findOneAndRemove({username: deletedUser}, function(err, user){
            if(err) throw err;
            res.json({success: true})
          })
        }
      }


    });

  });
  router.get('/edit/:id', function(req, res){
    var editUser = req.params.id;
    User.findOne({username: req.decoded.username}, function(err,mainUser){
      if (err) throw err;

      if(!mainUser){
        res.json({success: false,message:'No user was found'});
      }else{
        if(mainUser.permission === 'admin' || mainUser.permission === 'moderator'){
          User.findOne({_id: editUser}, function(err,user){
            if (err) throw err;

            if(!user){
              res.json({success: false,message:'No user was found'});
            }else{
              res.json({success: true,user:user});
            }
          });
        }else{
          res.json({success: false,message:'Insufficient permission'});
        }
      }
    });
  });
  // Route to update/edit a user
  router.put('/edit', function(req, res){
    var editUser = req.body._id; // Assign _id from user to be editted to a variable
    if(req.body.name) var newName = req.body.name;// Check if a change to name was requested
    if(req.body.username) var newUsername = req.body.username;// Check if a change to username was requested
    if(req.body.email) var newEmail = req.body.email;
    if(req.body.permission) var newPermission = req.body.permission;
    User.findOne({username: req.decoded.username},function(err, mainUser){
      if (err) throw err;// Throw err if cannot connnect
      // Check if logged in user is found in database
      if(!mainUser){
        res.json({success: false,message:'No user was found'});
      }else{
        // Check if a change to name was requested
        if(newName){
          // Check if person making changes has appropriate access
          if(mainUser.permission === 'admin' || mainUser.permission === 'moderator'){
            // Look for user in database
            User.findOne({_id: editUser}, function(err, user){
                if (err) throw err;
                // Check if user is in database
                if(!user){
                  res.json({success: false,message:'No user was found'});
                }else{
                  //save the changes
                  user.name= newName; // Assign new name to user in database
                  user.save(function(err){
                    if(err){
                      console.log(err);
                    }else{
                      res.json({success: true,message:'Name has been updated'});
                    }
                  });
                }
            });
          }else{
            res.json({success: false,message:'Insufficient permission'});
          }
        }
        //update username
        if(newUsername){
          // Check if person making changes has appropriate access
          if(mainUser.permission === 'admin' || mainUser.permission === 'moderator'){
            User.findOne({_id: editUser}, function(err, user){
                if (err) throw err;
                if(!user){
                  res.json({success: false,message:'No user was found'});
                }else{
                  //save the changes
                  user.username= newUsername;
                  user.save(function(err){
                    if(err){
                      console.log(err);
                    }else{
                      res.json({success: true,message:'Username has been updated'});
                    }
                  });
                }
            });
          }else{
            res.json({success: false,message:'Insufficient permission'});
          }
        }
        //**************Update username end**************
        //************Edit Email****************
        if(newEmail){
          if(mainUser.permission === 'admin' || mainUser.permission === 'moderator'){
            User.findOne({_id: editUser}, function(err, user){
                if (err) throw err;
                if(!user){
                  res.json({success: false,message:'No user was found'});
                }else{
                  //save the changes
                  user.email= newEmail;
                  user.save(function(err){
                    if(err){
                      console.log(err);
                    }else{
                      res.json({success: true,message:'Email has been updated'});
                    }
                  });
                }
            });
          }else{
            res.json({success: false,message:'Insufficient permission'});
          }
        }
        //************End Edit Email**************
        //************Edit permission****************
        if(newPermission){
          if(mainUser.permission === 'admin' || mainUser.permission === 'moderator'){
            User.findOne({_id: editUser}, function(err, user){
                if (err) throw err;
                if(!user){
                  res.json({success: false,message:'No user was found'});
                }else{
                  if(newPermission === 'user'){
                    if(user.permission ==='admin'){
                      //if some one is trying to downgrade admin to normal user
                      if(mainUser.permission !== 'admin'){
                        res.json({success: false,message:'Insufficient permissions. You must be admin to downgrade an admin'});
                      }else{
                        //save the changes
                        user.permission= newPermission;
                        user.save(function(err){
                          if(err){
                            console.log(err);
                          }else{
                            res.json({success: true,message:'permissions has been updated'});
                          }
                        });
                      }


                  }else{
                    //save the changes
                    user.permission= newPermission;
                    user.save(function(err){
                      if(err){
                        console.log(err);
                      }else{
                        res.json({success: true,message:'permissions has been updated'});
                      }
                    });
                  }
                }
                if(newPermission ==='moderator'){
                  if(user.permission ==='admin'){
                    if(mainUser.permission !== 'admin'){
                      res.json({success: false,message:'Insufficient permissions. You must be admin to downgrade an admin'});
                    }else{
                      //save the changes
                      user.permission= newPermission;
                      user.save(function(err){
                        if(err){
                          console.log(err);
                        }else{
                          res.json({success: true,message:'permissions has been updated'});
                        }
                      });

                    }
                  }else{
                    //save the changes
                    user.permission= newPermission;
                    user.save(function(err){
                      if(err){
                        console.log(err);
                      }else{
                        res.json({success: true,message:'permissions has been updated'});
                      }
                    });
                  }
                }
                if(newPermission === 'admin'){
                  if(mainUser.permission === 'admin'){
                    //save the changes
                    user.permission= newPermission;
                    user.save(function(err){
                      if(err){
                        console.log(err);
                      }else{
                        res.json({success: true,message:'permissions has been updated'});
                      }
                    });

                  }else{
                    res.json({success: false,message:'Insufficient permissions. You must be admin to upgrade an user to admin'});
                  }
                }

              }
            });
          }else{
            res.json({success: false,message:'Insufficient permission'});
          }
        }
        //************End Edit permission**************

      }

    });

  });

  return router;  // Return the router object to server
}
