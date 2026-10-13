function authorizedRoles(...allowedRoles){
    return(req,res,next)=>{
        if(!req.isAuthenticated()){
            return res.status(401).json({
                message: "Please log in first"
            })
        }
        if(!allowedRoles.includes(req.user.role)){
            return res.status(403).json({
                message: "You are not authorized to access"
            })
        }
        next();
    }
}
module.exports= authorizedRoles;