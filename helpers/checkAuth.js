const checkAuth = function(req, res, next) {
    if (req.isAuthenticated()) { 
        return next() 
    }
    res.status(403).send("ah ah ah you didn't say the magic word")
}

module.exports = checkAuth