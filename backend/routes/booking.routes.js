const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
require("../models/labour");

router.post("/",async (req,res)=>{
    try{
    if(!req.isAuthenticated()) return res.status(401).json({error: "Not logged in"});
        const{ labourId,scheduledAt,category} = req.body;
        const newbooking = await Booking.create({
            userId: req.user._id,
            labourId,
            category,
            scheduledAt
        })
        res.status(201).json(newbooking);
    }catch(err){
        return res.status(400).json({error: err.message})
    }
})
router.patch("/:id/status",async(req,res)=>{
    try{
    if(!req.isAuthenticated()) return res.status(401).json({error: "Not logged in"});
    const{status} = req.body;
    const validatestatus = ["pending", "accepted", "completed", "cancelled"];
    if(!validatestatus.includes(status)){
        return res.status(400).json({error: "Invalid status"})
    }
    const bookingstatus = await Booking.findByIdAndUpdate(
        req.params.id,
        {status},
        {new: true}
    )
    if(!bookingstatus) return res.status(404).json({error: "No booking found"});
    res.json(bookingstatus);
    }catch(err){
        return res.status(400).json({error: err.message});
    }
})
router.get("/user/:userId",async(req,res)=>{
    try{
        const userbooking = await Booking.find({userId: req.params.userId}).populate("labourId");
        res.json(userbooking);
    }catch(err){
        return res.status(400).json({error: err.message});
    }
})
router.get("/labour/:labourId",async(req,res)=>{
    try{
        const labourbooking = await Booking.find({labourId: req.params.labourId}).populate("userId","name email phone");
        res.json(labourbooking);
    }catch(err){
        return res.status(400).json({error: err.message});
    }
})
module.exports = router