const mongoose = require("mongoose");
const laborerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  skills: [String],
  bio: String,
  photoUrl: String,
  hourlyRate: Number,
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } 
  },
  avgRating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  availability: { type: Boolean, default: true }
}, { timestamps: true });

laborerSchema.index({ location: '2dsphere' }); 
module.exports = mongoose.model('Labour',laborerSchema);