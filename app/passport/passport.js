var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require('../models/user');
var session = require('express-session');
var jwt = require('jsonwebtoken');  // for user session
var secret = "chetanmalhotra";


module.exports = function(app, passport){


  app.use(passport.initialize());
  app.use(passport.session());
  app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: true, cookie: { secure: false } }));


  passport.serializeUser(function(user, done) {
    if(user.active){
      token = jwt.sign({username: user.username, email: user.email }, secret, { expiresIn: '24h'});
    }else{
      token = 'inactive/error';
    }
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
    //https://fast-wave-78621.herokuapp.com/
    //http://localhost:8080
    passport.use(new FacebookStrategy({
      clientID: '137783036865493',
      clientSecret: '81c0be62df180b7dab87e01bf6f50a4f',
      callbackURL: "https://fast-wave-78621.herokuapp.com/auth/facebook/callback",
      profileFields: ['id', 'displayName', 'photos', 'email']
    },
    function(accessToken, refreshToken, profile, done) {
      console.log(profile._json.email);
      User.findOne({ email: profile._json.email }).select('username active password email').exec(function(err, user){
        if(err) done(err);

        if(user && user != null){
          done(null, user);
        }else {
          done(err);
        }

      });
    }
  ));


  //https://fast-wave-78621.herokuapp.com/
  //http://localhost:8080
passport.use(new TwitterStrategy({
    consumerKey: 'kaMYRyC8RXy3JnP5ujUMmQ6ZK',
    consumerSecret: 'K2RmrtcUykYGBm5Vkf890Sp671Du2srFNTuxR2mA1pJncitCz6',
    callbackURL: "https://fast-wave-78621.herokuapp.com/auth/twitter/callback",
    userProfileURL:"https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true"
  },
  function(token, tokenSecret, profile, done) {
    console.log(profile.emails[0].value);
    User.findOne({ email: profile.emails[0].value }).select('username active password email').exec(function(err, user){
      if(err) done(err);

      if(user && user != null){
        done(null, user);
      }else {
        done(err);
      }

    });
  }
));


//https://fast-wave-78621.herokuapp.com/
//http://localhost:8080
passport.use(new GoogleStrategy({
    clientID: '289138466888-33q9o8c4nn4iqbhrhifg44dv5nvn73do.apps.googleusercontent.com',
    clientSecret: 'qkouYfB8GacwtGVndTS0EuoZ',
    callbackURL: "https://fast-wave-78621.herokuapp.com/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile.emails[0].value);
    User.findOne({ email: profile.emails[0].value }).select('username active password email').exec(function(err, user){
      if(err) done(err);

      if(user && user != null){
        done(null, user);
      }else {
        done(err);
      }

    });
  }
));

app.get('/auth/google',passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'profile', 'email'] }));


app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/googleerror' }),function(req, res) {
    res.redirect('/google/'+ token);
  });


app.get('/auth/twitter', passport.authenticate('twitter'));


app.get('/auth/twitter/callback',passport.authenticate('twitter', { failureRedirect: '/twittererror' }), function(req,res){
  res.redirect('/twitter/'+ token);
});


  app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/facebookerror' }), function(req, res){
    res.redirect('/facebook/' + token);
  });

  app.get('/auth/facebook',passport.authenticate('facebook', { scope: 'email' }));

  return passport;
}
