const { router, bcrypt, jwt, getDatabaseInstance } = require("./requires");

const SECRET_KEY = "regtrgergregwe4rgrwegrwegrweg";

router.post("/login", (req, res) => {
  const db = getDatabaseInstance("main", "");
  const { email, password } = req.body;

  const query = "SELECT * FROM users WHERE email = ?";

  db.get(query, [email], (err, user) => {
    if (err) {
      return res.status(500).send("Error on the server.");
    }
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      return res.status(401).send({ auth: false, token: null });
    }

    const token = jwt.sign({ id: user.id }, SECRET_KEY, {
      expiresIn: 86400,
    });

    res.status(200).send({ auth: true, token: token });
    db.close();
  });
});

router.get("/isValidToken", (req, res) => {
  const token = req.headers["x-access-token"];
  if (!token) {
    return res.status(403).send({ auth: false, message: "No token provided." });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(440).send({ auth: false, message: "Session Expired" });
    }
  });
  res.status(200).send({ message: "Token is Valid" });
});

// Verify Token and Check Org Access Middleware
function verifyToken(req, res, next) {
  const token = req.headers["x-access-token"];
  if (!token) {
    return res.status(403).send({ auth: false, message: "No token provided." });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(440).send({ auth: false, message: "Session Expired" });
    }
    req.userId = decoded.id;
    next();
  });
}

// Verify Check Org Access Middleware
function verifyOrgAccess(req, res, next) {
  const db = getDatabaseInstance("main", "");

  const userId = req.userId;

  const query = "SELECT * FROM organization_users WHERE user_id = ?";

  db.get(query, [userId], (err, row) => {
    if (err) {
      return res.status(500).send({ message: "Error checking organization access." });
    }
    if (!row) {
      return res.status(403).send({ message: "User does not have access to any organization." });
    }

    req.body.orgId = row.organization_id;

    next();
    db.close();
  });
}

module.exports = { router, verifyToken, verifyOrgAccess };
