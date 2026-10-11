const mongoose = require("mongoose");

const reviewschema = new mongoose.Schema({
    bookingId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
        required: true
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    labourId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Labour",
        required: true
    },
    rating:{
        type: Number,
        min: 1,
        max: 5,
        required: true,
        validate:{
            validator: Number.isInteger,
            message: "Number should be a whole number between 1 to 5"
        }
    },
    comment:{
        type: String
    }
},{ timestamps: true })

module.exports = mongoose.model("Review",reviewschema);