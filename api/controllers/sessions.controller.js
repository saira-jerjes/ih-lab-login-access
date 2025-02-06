const Session = require("../models/session.model");
const User = require("../models/user.model");
const createError = require("http-errors");


module.exports.create = (req, res, next) => {
  const { email, password } = req.body;

  // 1. find user by email
  User.findOne({ email })
  .then((user) => {
    if (user) {
      user
        .checkPassword(password)
        .then((match) => {
          if (match) {
            // if (!user.active) {
            //   next(createError(401, "user not active"));
            //   return;
            // }

            // create session key and send it to the user via set-cookie header
            Session.create({ user: user.id })
              .then((session) => {
                res.setHeader(
                  "Set-Cookie",
                  `session=${session.id}; HttpOnly;` // HttpOnly is a flag that prevents JavaScript from accessing the cookie
                  // Secure is a flag that prevents the cookie from being sent over an unencrypted connection
                );

                res.json(user);
              })
              .catch(next);
          } else {
            next(createError(401, "bad credentials (wrong password)"));
          }
        })
        .catch(next);
    } else {
      next(createError(401, "bad credentials (user not found)"));
    }
  })
  .catch(next);


  // 2. check password
  // 3. create session
  // 4. send session id in a cookie

  res.header("Set-Cookie", "session_id=12345");

  res.json({ message: "TO DO!" });
};

module.exports.destroy = (req, res, next) => {
  // access current request session. remove and send 204 status
  req.session
  .remove()
  .then(() => res.status(204).send())
  .catch(next);
};
