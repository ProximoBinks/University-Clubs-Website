var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/login', function(req, res, next) {
  var { email, password } = req.body;
  req.pool.getConnection(function (cerr, connection) {
    if (cerr) {
      res.sendStatus(500);
      return;
    }
    let query = "SELECT id, first_name, last_name, email, date_of_birth, bio, isAdmin, password FROM Users WHERE email = ? LIMIT 1";
    connection.query(query, [email], function (qerr, rows, fields) {
      if (qerr) {
        res.sendStatus(500);
        return;
      }
      if (rows.length === 0) {
        res.sendStatus(401);
        return;
      }
      bcrypt.compare(password, rows[0].password, function(err, result) {
        if (err) {
          res.sendStatus(500);
          return;
        }
        if (result) {
          req.session.user = rows[0];
          res.sendStatus(200);
        } else {
          res.sendStatus(401);
        }
      });
    });
  });
});

router.post('/logout', function(req, res, next) {
  req.session.destroy(function(err) {
    if (err) {
      res.sendStatus(500);
      return;
    }
    res.sendStatus(200);
  });
});

router.get('/check-login', function(req, res, next) {
  if (req.session.user) {
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
});

router.post('/register', function(req, res, next) {
  var { firstName, lastName, email, password } = req.body;
  req.pool.getConnection(function (cerr, connection) {
    if (cerr) {
      res.sendStatus(500);
      return;
    }
    let query = "SELECT first_name, last_name, email FROM Users WHERE email = ? LIMIT 1";
    connection.query(query, [email], function (qerr, rows, fields) {
      if (qerr) {
        res.sendStatus(500);
        return;
      }
      if (rows.length > 0) {
        res.sendStatus(409);
        return;
      }
      bcrypt.hash(password, 10, function(err, hash) {
        if (err) {
          res.sendStatus(500);
          return;
        }
        let insertQuery = "INSERT INTO Users (first_name, last_name, email, password, date_of_birth, bio) VALUES (?, ?, ?, ?, NULL, NULL)";
        connection.query(insertQuery, [firstName, lastName, email, hash], function (iqerr, irows, ifields) {
          connection.release();
          if (iqerr) {
            res.sendStatus(500);
            return;
          }
          res.sendStatus(200);
        });
      });
    });
  });
});

router.get('/profile', function(req, res, next) {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.sendStatus(401);
  }
});

router.post('/save-profile', function(req, res, next) {
  var { firstName, lastName, dateOfBirth, bio } = req.body;
  var userId = req.session.user.id;
  req.pool.getConnection(function (cerr, connection) {
    if (cerr) {
      res.sendStatus(500);
      return;
    }
    let updateQuery = "UPDATE Users SET first_name = ?, last_name = ?, date_of_birth = ?, bio = ? WHERE id = ?";
    connection.query(updateQuery, [firstName, lastName, dateOfBirth, bio, userId], function (qerr, result) {
      connection.release();
      if (qerr) {
        res.sendStatus(500);
        return;
      }
      req.session.user.first_name = firstName;
      req.session.user.last_name = lastName;
      req.session.user.date_of_birth = dateOfBirth;
      req.session.user.bio = bio;
      res.sendStatus(200);
    });
  });
});

router.get('/admin/users', function(req, res, next) {
  if (req.session.user && req.session.user.isAdmin) {
    req.pool.getConnection(function (cerr, connection) {
      if (cerr) {
        res.sendStatus(500);
        return;
      }
      let query = "SELECT id, first_name, last_name, email, date_of_birth, bio, isAdmin FROM Users";
      connection.query(query, function (qerr, rows, fields) {
        connection.release();
        if (qerr) {
          res.sendStatus(500);
          return;
        }
        res.json(rows);
      });
    });
  } else {
    res.sendStatus(401);
  }
});

router.put('/admin', function(req, res, next) {
  if (req.session.user && req.session.user.isAdmin) {
    console.log(req.query.param1);
    console.log(req.body.isAdmin);
    req.pool.getConnection(function(cerr, connection) {
      if (cerr) {
        res.sendStatus(500);
        return;
      }
      let updateQuery = "UPDATE Users SET isAdmin = ? WHERE id = ?";
      connection.query(updateQuery, [req.body.isAdmin, req.query.param1], function(qerr, result) {
        connection.release();
        if (qerr) {
          res.sendStatus(500);
          return;
        }
        res.sendStatus(200);
      });
    });
  } else {
    res.sendStatus(401);
  }
});

router.post('/deleteuser', function(req, res, next) {
  if (req.session.user && req.session.user.isAdmin) {
    console.log(req.body.user_id);
    req.pool.getConnection(function(cerr, connection) {
      if (cerr) {
        res.sendStatus(500);
        return;
      }
      let updateQuery = "DELETE FROM Users WHERE id = ?";
      connection.query(updateQuery, [req.body.user_id], function(qerr, result) {
        connection.release();
        if (qerr) {
          res.sendStatus(500);
          return;
        }
        res.sendStatus(200);
      });
    });
  } else {
    res.sendStatus(401);
  }
});

module.exports = router;
