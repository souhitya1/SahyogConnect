const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
const Labour = require("../models/labour");
const mongoose = require("mongoose");

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
router.get("/my",async(req,res)=>{
 try{
    if(!req.isAuthenticated()) return res.status(401).json({error: "Not logged in"});
   const bookings = await Booking.find({
    userId: req.user._id,
   }).populate({ 
    path: "labourId", 
    populate: { path: "userId", select: "name email phone", }, 
}).sort({ scheduledAt: 1 });
return res.json(bookings);
 }catch(err){
    return res.status(400).json({error: err.message});
 }
})
router.get("/labourer/my",async(req,res)=>{
    try{
    if(!req.isAuthenticated()) return res.status(401).json({error: "Not logged in"}); 
    const labour = await Labour.findOne({
        userId: req.user._id,
    })
    if(!labour){
         return res.status(404).json({
        error: "Labour profile not found for this account",
      });
    }
    const bookings = await Booking.find({
         labourId: labour._id,
    })
      .populate("userId", "name email phone")
      .sort({ scheduledAt: 1 });

    return res.json(bookings);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
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
async function updatestatus(req,res,currentstatus,newstatus){
    try{
    if(!req.isAuthenticated()) return res.status(401).json({error: "Not logged in"});
     if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid booking ID" });
    }
    const labour = await Labour.findOne({
        userId: req.user._id
    })
    if (!labour) {
      return res.status(404).json({ error: "Labour profile not found" });
    }
    const booking = await Booking.findOneAndUpdate({
        _id: req.params.id,
        labourId: labour._id,
        status: currentstatus
    },
     { $set: { status: newstatus } },
      { new: true, runValidators: true })
       if (!booking) {
      return res.status(404).json({ error: "Booking not found or status has changed" });
    }

    return res.json(booking);
    }catch(err){
     return res.status(500).json({ error: err.message });
    }
}
router.patch("/:id/accept",(req,res)=>{
    updatestatus(req,res,"pending","accepted")
})
router.patch("/:id/reject",(req,res)=>{
    updatestatus(req,res,"pending","rejected")
})
router.patch("/:id/complete",(req,res)=>{
    updatestatus(req,res,"accepted","completed")
})
router.patch("/:id/cancel",async(req,res)=>{
    try{
    if(!req.isAuthenticated()) return res.status(401).json({error: "Not logged in"});
     if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid booking ID" });
    }
    const booking = await Booking.findOneAndUpdate({
        _id : req.params.id,
        userId: req.user._id
    },{
        $set: { status: "cancelled" },
      },
      {
        new: true,
        runValidators: true,
      }
    );
      if(!booking){
        return res.status(404).json({
        error: "Booking not found or can no longer be cancelled"
      });
    }
    return res.json(booking)
      }catch(err){
        return res.status(500).json({ error: err.message });
      }
    })
module.exports = router