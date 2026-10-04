const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user")


router.post("/signup",async(req,res)=>{
    try{
        let { name, email, password, role, phone } = req.body;
        let newUser = new User({ name, email , role, phone});
        let registeruser = await User.register(newUser, password);
        req.logIn(registeruser, (err) => {
         if (err) return res.status(500).json({ error: "Login after signup failed" });
         res.status(201).json({ message: "Successfully signed up", user: registeruser });
        })
    }catch(err){
      res.status(400).json({ error: err.message });
    }
});


router.post("/login",(req,res,next)=>{
    passport.authenticate("local",(err,user,info)=>{
    if (err) return res.status(500).json({ error: "Something went wrong" });
    if (!user) return res.status(401).json({ error: info?.message || "Invalid credentials" });
    req.logIn(user,(err)=>{
    if (err) return res.status(500).json({ error: "Login failed" });
    res.json({ message: "Successfully logged in", user });
    })
    })(req,res,next);
})
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: "Logout failed" });
    res.json({ message: "Logged out" });
  });
});
router.get("/me",(req,res)=>{
    if(req.isAuthenticated()) return res.json({user: req.user});
      res.status(401).json({ error: "Not logged in" });
})
module.exports = router