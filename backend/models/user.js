const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const userschema = new mongoose.Schema({
  name: String,
  phone: { type: String, unique: true },
  email: String,
  password: String,
  role: { type: String, enum: ['user', 'laborer'], required: true },

  isVerified: {
    type: Boolean,
    default: false
},

verificationStatus: {
    type: String,
    enum: ["not_submitted","pending", "approved", "rejected"],
    default: "not_submitted"
},

verificationSubmittedAt: {
    type: Date,
    default: null
},

verificationReviewedAt: {
    type: Date,
    default: null
},

verificationNote: {
    type: String,
    default: ""
},

verificationAddress: String,
verificationExperience: Number,
verificationIdType: String,
verificationIdNumber: {
    type: String,
    default: ""
},

isAdmin: {
    type: Boolean,
    default: false
}
},{timestamps: true});
userschema.plugin(passportLocalMongoose.default || passportLocalMongoose, {
    usernameField: "email"
});
module.exports = mongoose.model("User",userschema);