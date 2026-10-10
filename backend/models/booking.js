const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  labourId: { type: mongoose.Schema.Types.ObjectId, ref: "Labour", required: true },
  category: String,
  status: {
    type: String,
    enum: ["pending", "accepted","rejected", "completed", "cancelled"],
    default: "pending"
  },
  scheduledAt: Date
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);