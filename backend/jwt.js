const pool = require("./db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_KEY = "+EjS86shd[yAA>CA+/L*W.9'4b_r2";

module.exports.makeJWT = (id) => {
  return jwt.sign(id, JWT_KEY);
};

const checkJWT = (token) => {
  let decoded = jwt.verify(token, JWT_KEY);
  if (!decoded) {
    return { success: false };
  }

  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM users WHERE id = ?",
      [decoded],
      (err, result) => {
        if (err) {
          reject();
        } else {
          resolve(result[0]);
        }
      });
  });
};

module.exports.verifyToken = (req) => {
  const bearerHeader = req.header("authorization");

  return new Promise((resolve, reject) => {
    if (bearerHeader) {
      const bearer = bearerHeader.split(" ");
      const bearerToken = bearer[1];

      return resolve(checkJWT(bearerToken));
    } else {
      return reject();
    }
  });
};
