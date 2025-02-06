const Session = require("../models/session.model");
const createError = require("http-errors");

module.exports.checkSession = (req, res, next) => {
  const sessionId = req.headers.cookie
  ?.split(";")
  ?.find((cookie) => cookie.includes("session="))
  ?.split("=")?.[1];

if (!sessionId) {
  next(createError(401, "missing session from cookie header"));
}

Session.findById(sessionId)
.populate("user") // populate user field. thanks to user ref in session model
.then((session) => {
  if (session) {
    if (session.user) {
      // update last access time to keep session alive
      session.lastAccess = new Date();
      session.save();

      // leave user on req object so next middlewares can access to it
      req.session = session;
      req.user = session.user;

      // continue to next middleware or controller
      next();
    } else {
      next(createError(401, "unauthorized. wrong user"));
    }
  } else {
    next(createError(401, "unauthorized. session not found"));
  }
})
.catch(next);
};
  // 1. find session by ID
  // 2. populate user field
  // 3. update session last access
  // 5. save session
  // 6. leave user on req object
  // 7. leave session on req object
  // 8. continue to next middleware or controller
  // 9. handle errors with 401 code

