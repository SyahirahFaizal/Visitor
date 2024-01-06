// middleware.js

function checkAccountLockout(req, res, next) {
    const { user } = req;
  
    // Check if the account is locked out
    if (user && user.lockoutUntil && user.lockoutUntil > new Date()) {
      return res.status(401).send("Account is temporarily locked. Try again later.");
    }
  
    // If not locked out, proceed to the next middleware
    next();
  }
  
  module.exports = { checkAccountLockout };