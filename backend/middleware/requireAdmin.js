module.exports = function requireAdmin(req,res,next){
    if(!req.isAuthenticated()){
        return res.status(401).json({
            error: "Please log in first"
        })
    }
    if(req.user.isAdmin() != true){
                return res.status(403).json({
            error: "Admin access required."
        });
    }
    next();
}