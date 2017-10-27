var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
titlize = require('mongoose-title-case');
var validate = require('mongoose-validator');

var nameValidator = [
  validate({
    validator: 'matches',
    arguments: /^(([a-zA-Z]{1,25})+[ ]+([a-zA-Z]{2,30})+)+$/,
    message: 'Name must be atleast 2 character, max 30, no special characters or numbers, must have space in between name '
  }),
  validate({
    validator: 'isLength',
    arguments: [3, 30],
    message: 'Name be between {ARGS[0]} and {ARGS[1]} characters'
  })

];

var emailValidator = [
  validate({
    validator: 'isEmail',
    message: 'Is not a valid Email'
  }),
  validate({
    validator: 'isLength',
    arguments: [3, 50],
    message: 'Email be between {ARGS[0]} and {ARGS[1]} characters'
  })

];

var passwordValidator = [
  validate({
    validator: 'matches',
    arguments: /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[\d])(?=.*?[\W]).{8,24}$/,
    message: 'Password must be atleast 8 characters and have 1 lower case,1 uppercase, 1 number , 1 sepcial charater but no more than 24 characters'
  }),
  validate({
    validator: 'isLength',
    arguments: [8, 24],
    message: 'Password be between {ARGS[0]} and {ARGS[1]} characters'
  })

];

var usernameValidator = [
  validate({
    validator: 'isLength',
    arguments: [3, 25],
    message: 'Email be between {ARGS[0]} and {ARGS[1]} characters'
  }),
  validate({
    validator:'isAlphanumeric',
    message:'Username must contain letter and numbers only'
  })
];

var userSchema = new Schema({
  name:{type:String, required:true,validate: nameValidator},
  username: {type:String,lowercase:true,required:true,unique:true, validate: usernameValidator},
  password: {type:String,required:true,validate: passwordValidator, select: false},
  email: {type:String,required:true,lowercase:true,unique:true,validate: emailValidator},
  active:{type: Boolean,required: true, default: false},
  temporarytoken:{type: String,required:true},
  resettoken:{type:String, required:false},
  permission:{type:String, required:true,default: 'user'}
});

//roles - admin moderator user

//before saving the password, exncrypt it
userSchema.pre('save',function(next){
  var user = this;
  //if password hasnt been changed jump out of this function
  if(!user.isModified('password')) return next();
  //implement bcrypt encrption
  bcrypt.hash(user.password,null,null,function(err,hash){
    if(err) return next(err);
    user.password = hash;
    next();
  });

});

userSchema.plugin(titlize, {
  paths: [ 'name' ]
});

userSchema.methods.comparePassword = function(password){
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User',userSchema);
