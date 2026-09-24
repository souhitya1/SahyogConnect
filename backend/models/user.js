const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const userschema = new mongoose.Schema({
  name: String,
  phone: { type: String, unique: true },
  email: String,
  password: String,
  role: { type: String, enum: ['user', 'laborer'], required: true }
},{timestamps: true});
userschema.plugin(passportLocalMongoose.default || passportLocalMongoose, {
    usernameField: "email"
});
module.exports = mongoose.model("User",userschema);