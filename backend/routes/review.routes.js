const express = require("express");
const router = express.Router();
const Labour= require("../models/labour");
const Booking = require("../models/booking");
const Review = require("../models/review");

router.post("/",async (req,res)=>{
    try{
        if(!req.isAuthenticated()) return res.status(401).json({error: "Not logged in"});
        const {bookingId , rating, comment} = req.body;
        const booking = await Booking.findById(bookingId);
        if(!booking) return res.status(404).json({error: "No booking found"});
        if(booking.status != "completed") return res.status(400).json({error: "Booking is not completed"})
        if(booking.userId.toString() != req.user._id.toString()){
            return res.status(403).json({error: "Only customer of that booking can only review "});
        }
        const existed = await Review.findOne({bookingId});
        if(existed){
            return res.status(400).json({error: "Review already existed"});
        }
        const newReview = await  Review.create({
            bookingId,
            userId: req.user._id,
            labourId: booking.labourId,
            rating,
            comment
        })
        const stats = await Review.aggregate([
            { $match: { labourId: booking.labourId } },
            { $group: { _id: "$labourId", avg: { $avg: "$rating" }, count: { $sum: 1 } } }
        ]);

        await Labour.findByIdAndUpdate(booking.labourId, {
            avgRating: Math.round(stats[0].avg * 10) / 10,
            ratingCount: stats[0].count
        });
        res.json(newReview);
    }catch(err){
        return res.status(400).json({error: err.message})
    }
})
router.get("/labour/:labourId",async(req,res)=>{
    try{
 const review = await Review.find({labourId: req.params.labourId}).populate("userId", "name")
            .sort({ createdAt: -1 });
            res.json(review);
    }catch(err){
        return res.status(400).json({error: err.message});
    }
})
module.exports = router;