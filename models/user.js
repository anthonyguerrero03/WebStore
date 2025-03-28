// models/user.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstName: {type: String, required: [true, 'first name is required']},
    lastName: {type: String, required: [true, 'last name is required']},
    email: {type: String, required: [true, 'email address is required'], unique: [true, 'this email address has been used'] },
    password: { type: String, required: [true, 'password is required'] },
});

// Hash password before saving
userSchema.pre('save', function(next){
    let user = this;
    if (!user.isModified('password'))
        return next();
    bcrypt.hash(user.password, 10)
    .then(hash => {
      user.password = hash;
      next();
    })
    .catch(err => next(err));
  });

// Password comparison
userSchema.methods.comparePassword = function(inputPassword) {
    let user = this;
    return bcrypt.compare(inputPassword, user.password);
  };

module.exports = mongoose.model('User', userSchema);
