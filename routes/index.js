var express = require('express');
const { request } = require('http');
var router = express.Router();
const sanitizeHtml = require('sanitize-html');
var multer = require('multer');
var upload = multer({ dest: 'public/images/uploads/', limits: { fileSize: 2*1048576 } });
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/create-club-final', upload.single('img'));

var tempClub = [];

router.post('/create-club', function(req,res,next) {
  if ('club_info' in req.body && 'club_name' in req.body) {
    if (/^[A-Za-z0-9\s]*$/.test(req.body.club_name) && req.body.club_info.length <= 800 && req.body.club_name !== "" && req.body.club_name.length <= 63) {
      req.pool.getConnection(function (cerr, connection) {
        if (cerr) {
          res.sendStatus(500);
          return;
        }
        let query = "SELECT * FROM Clubs WHERE club_name = ?";
        connection.query(query, [req.body.club_name.trim()], function (qerr, rows, fields) {
          connection.release();
          if (qerr) {
            res.sendStatus(500);
            return;
          }
          if (rows.length === 0) {
            var pageUrl = req.body.club_name.trim();
            pageUrl = pageUrl.replace(/\s+/g,'-').toLowerCase();
            tempClub.club_info = req.body.club_info;
            tempClub.image_url = '';
            tempClub.page_url = pageUrl;
            tempClub.club_name = req.body.club_name.trim();
            res.end();
          } else {
            res.sendStatus(406);
          }
        });
      });
    } else {
      res.sendStatus(406);
    }
  }
});

router.post('/create-club-final', function(req,res,next) {
  if (tempClub.club_name !== "") {
    req.pool.getConnection(function (cerr, connection) {
      if (cerr) {
          res.sendStatus(500);
          return;
      }
      let query = `INSERT INTO Clubs (
                        club_info,
                        image_url,
                        page_url,
                        club_name
                    ) VALUES (
                        ?,
                        ?,
                        ?,
                        ?
                    );`;
      connection.query(
        query,
        [tempClub.club_info,
        "images/uploads/"+req.file.filename,
        tempClub.page_url+".html",
        tempClub.club_name],
        function (qerr, rows, fields) {
          connection.release();
          if (qerr) {
              res.sendStatus(500);
              return;
          }
          // WRITING THE NEW PAGE POG
          var html = `<!DOCTYPE html>
          <html lang="en">
          <head>
              <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
              <link rel="stylesheet" href="/stylesheets/main_style.css"/>
              <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
              <script type="text/javascript" src="/javascripts/main.js" defer></script>
              <meta charset="UTF-8">
              <meta http-equiv="X-UA-Compatible" content="IE=edge">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <script src="https://kit.fontawesome.com/59a3f0812f.js" crossorigin="anonymous"></script>
              <title>University Clubs</title>
          </head>
          <body>
              <div id="app">
                  <header>
                      <i class="fa-solid fa-bars" v-on:click="toggleSideBar"></i>
                      <h1 class="logo"><a href="/">University Clubs</a></h1>
                      <nav class="nav-link">
                          <a href="/">Home</a>
                          <a href="/about.html">About</a>
                          <a v-on:click="createClubLogin">Create Club</a>
                          <template v-if="loggedIn">
                              <a href="/profile.html">Profile</a>
                              <button class="pure-button login-button" type="button" v-on:click="logout">Logout</button>
                          </template>
                          <template v-else>
                              <button class="pure-button login-button" type="button" v-on:click="toLogin">Login</button>
                          </template>
                      </nav>
                  </header>
                  <div class="sidebar nav-link" v-if="side_active">
                      <a href="/">Home</a>
                      <a href="/about.html">About</a>
                      <a v-on:click="createClubLogin">Create Club</a>
                      <div class="sidebar-login">
                          <template v-if="loggedIn">
                              <a href="/profile.html">Profile</a>
                          </template>
                          <template v-if="loggedIn">
                              <button class="pure-button logout-button" type="button" v-on:click="logout">Logout</button>
                          </template>
                          <template v-else>
                              <a href="/login.html" class="sidebar-login-button">Login</a>
                          </template>
                      </div>
                  </div>

                  <main>
                      <div class="main-content current-events">
                          <div class="club-page-info">
                              <img src=/images/uploads/` + req.file.filename + `>
                              <h3 id="THIS-IS-CLUB-NAME">` + tempClub.club_name + `</h3>
                              <p>` + tempClub.club_info + `</p>
                              <button type="button" class="pure-button join-button" v-on:click="joinClub(curr_club[0].id)" v-if="!curr_enrolment.isMember">Join Club</button>
                              <button type="button" class="pure-button join-button" v-on:click="leaveClub(curr_club[0].id)" v-if="curr_enrolment.isMember && !curr_enrolment.isManager">Leave Club</button>
                              <button type="button" class="pure-button delete-button" v-on:click="deleteClub(curr_club[0].id)" v-if="curr_enrolment.isManager">Delete Club</button>
                          </div>
                      </div>
                      <div class="main-content new-update" v-if="curr_enrolment.isManager">
                          <h2>Create new post</h2>
                          <div class="new-update-input">
                              <label>Post Title</label>
                              <input id="update-title" type="text" placeholder="Post Title" v-model="tempPost.post_title"/>
                          </div>
                          <div class="new-update-input">
                              <label>Post Description</label>
                              <textarea id="post-content" placeholder="Details..." v-model="tempPost.post_info"></textarea>
                          </div>
                          <div class="new-update-input half-width">
                              <label>Date of Event (optional)</label>
                              <input id="date-input" type="datetime-local" v-bind:min="date" v-model="tempPost.event_time"/>
                          </div>
                          <div class="new-update-input half-width">
                              <label class="checkbox-label">Private post</label>
                              <input id="private-update" type="checkbox" name="Private post" v-model="tempPost.isPrivate"/>
                          </div>
                          <div class="new-update-input" v-if="incorrect_fields.value">
                              <p>Some information was invalid</p>
                          </div>
                          <div class="new-update-input">
                              <button type="button" class="pure-button" v-on:click="newPost">Create Post</button>
                          </div>
                      </div>
                      <div class="main-content show-users" v-if="curr_enrolment.isManager">
                          <button type="button" class="pure-button" v-on:click="showUsers(curr_club[0].id)" v-if="!usersShown">Show users</button>
                          <button type="button" class="pure-button" v-on:click="hideUsers" v-if="usersShown">Hide users</button>
                          <table class="admin-table" v-if="usersShown">
                              <tr>
                                  <th>First Name</th>
                                  <th>Last Name</th>
                              </tr>
                              <tr v-for="user_index in club_users" :key="user_index.id">
                                  <td>{{ user_index.first_name }}</td>
                                  <td>{{ user_index.last_name }}</td>
                              </tr>
                          </table>
                      </div>
                      <div class="event-page-list">
                          <div v-for="event_index in club_events">
                              <div class="main-content event-page" v-if="!event_index.isPrivate || curr_enrolment.isMember">
                                  <div class="event-page-title">
                                      <h2>{{ event_index.post_title }}</h2>
                                      <p>{{ (new Date(event_index.post_created)).toLocaleString() }}</p>
                                  </div>
                                  <p>{{ event_index.post_info }}</p>
                                  <p class="event-page-time" v-if="event_index.event_time">Event time: {{ (new Date(event_index.event_time)).toLocaleString() }}</p>
                                  <button type="button" class="pure-button" v-if="event_index.event_time" v-on:click="doRSVP(event_index.id)">RSVP</button>
                                  <p v-if="event_index.hasRSVP">You have already RSVP'd!</p>
                                  <button type="button" class="pure-button delete-button" v-on:click="deletePost(event_index.id)" v-if="curr_enrolment.isManager">Delete Post</button>
                                  <button type="button" class="pure-button" v-on:click="showRSVPs(event_index.id)" v-if="!event_index.showUsers && curr_enrolment.isManager">Show users</button>
                                  <button type="button" class="pure-button" v-on:click="hideRSVPs(event_index.id)" v-if="event_index.showUsers">Hide users</button>
                                  <table class="admin-table" v-if="event_index.showUsers">
                                      <tr>
                                          <th>First Name</th>
                                          <th>Last Name</th>
                                      </tr>
                                      <tr v-for="user_index in event_index.rsvps" :key="user_index.id">
                                          <td>{{ user_index.first_name }}</td>
                                          <td>{{ user_index.last_name }}</td>
                                      </tr>
                                  </table>
                              </div>
                          </div>
                      </div>
                  </main>
              </div>
          </body>
          </html>`;

          fs.writeFileSync('public/clubs/'+tempClub.page_url+'.html', html, function(err) {
            if (err) {
              throw err;
            }
            console.log('file made');
          });
        }
      );
    });
    req.pool.getConnection(function (cerr, connection) {
      if (cerr) {
          res.sendStatus(500);
          return;
      }
      let query = `INSERT INTO Club_Enrolments (
                      user_id,
                      club_id,
                      is_manager
                  ) VALUES (
                      ?,
                      (SELECT id FROM Clubs WHERE club_name = ?),
                      TRUE
                  );`;
      connection.query(
        query,
        [req.session.user.id,
        tempClub.club_name],
        function (qerr, rows, fields) {
          connection.release();
          if (qerr) {
              res.sendStatus(500);
              return;
          }
          res.redirect(301,'/clubs/'+tempClub.page_url+'.html');
        }
      );
    });
  } else {
    res.sendStatus(500);
  }
});



router.get('/clubs.json', function(req,res,next) {
  req.pool.getConnection(function (cerr, connection) {
    if (cerr) {
      res.sendStatus(500);
      return;
    }
    let query = "SELECT * FROM Clubs";
    connection.query(query, function (qerr, rows, fields) {
      connection.release();
      if (qerr) {
        res.sendStatus(500);
        return;
      }
      res.json(rows);
    });
  });
});


router.get('/club_events.json', function(req,res,next) {
  var member = {
    isMember: false,
    isManager: false
  };
  var dataArray = {
    events: '',
    memberInfo: member
  };
  if (req.session.user) {
    req.pool.getConnection(function (cerr, connection) {
      if (cerr) {
          res.sendStatus(500);
          return;
      }
      let query = `SELECT * FROM Club_Enrolments INNER JOIN Clubs ON Clubs.id = Club_Enrolments.club_id WHERE user_id = ? AND Clubs.club_name = ?;`;
      connection.query(
        query,
        [req.session.user.id,
        req.query.param1],
        function (qerr, rows, fields) {
          connection.release();
          if (qerr) {
              res.sendStatus(500);
              return;
          }
          if (rows.length !== 0) {
            member.isMember = true;
            if (rows[0].is_manager === 1) {
              member.isManager = true;
            }
          }
        }
      );
    });
  }
  req.pool.getConnection(function (cerr, connection) {
    if (cerr) {
      res.sendStatus(500);
      return;
    }
    let query = "SELECT Updates.id, post_title, post_info, post_created, isPrivate, event_time FROM Updates INNER JOIN Clubs ON Clubs.id = Updates.club_id WHERE Clubs.club_name = ? ORDER BY post_created DESC;";
    connection.query(query, [req.query.param1],function (qerr, rows, fields) {
      connection.release();
      if (qerr) {
        res.sendStatus(500);
        return;
      }
      dataArray.events = rows;
      res.json(dataArray);
    });
  });
});


router.get('/curr_club.json', function(req,res,next) {
  req.pool.getConnection(function (cerr, connection) {
    if (cerr) {
      res.sendStatus(500);
      return;
    }
    let query = "SELECT * FROM Clubs WHERE Clubs.club_name = ?;";
    connection.query(query, [req.query.param1],function (qerr, rows, fields) {
      connection.release();
      if (qerr) {
        res.sendStatus(500);
        return;
      }
      res.json(rows);
    });
  });
});


router.post('/newpost', function(req,res,next) {
  if (req.body.post_title !== "" && req.body.post_info !== "") {
    req.pool.getConnection(function (cerr, connection) {
      if (cerr) {
          res.sendStatus(500);
          return;
      }
      let query = `INSERT INTO Updates (
                      post_title,
                      post_info,
                      post_created,
                      event_time,
                      isPrivate,
                      club_id
                  ) VALUES (
                      ?,
                      ?,
                      CURRENT_TIMESTAMP(),
                      ?,
                      ?,
                      ?
                  );`;
      connection.query(
        query,
        [req.body.post_title,
        req.body.post_info,
        req.body.event_time,
        req.body.isPrivate,
        req.body.club_id],
        function (qerr, rows, fields) {
          connection.release();
          if (qerr) {
              res.sendStatus(500);
              return;
          }
          res.sendStatus(200);
        }
      );
    });
  } else {
    res.sendStatus(500);
  }
});

router.get('/all_events.json', function(req,res,next) {
  req.pool.getConnection(function (cerr, connection) {
    if (cerr) {
      res.sendStatus(500);
      return;
    }
    let query = "SELECT post_title, post_info, Clubs.club_name, Clubs.page_url, Clubs.image_url  FROM Updates INNER JOIN Clubs ON Clubs.id = Updates.club_id WHERE isPrivate = 0 ORDER BY post_created DESC;";
    connection.query(query, function (qerr, rows, fields) {
      connection.release();
      if (qerr) {
        res.sendStatus(500);
        return;
      }
      res.json(rows);
    });
  });
});

router.post('/deletepost', function(req,res,next) {
  if (req.body.id !== "") {
    req.pool.getConnection(function (cerr, connection) {
      if (cerr) {
          res.sendStatus(500);
          return;
      }
      let query = "DELETE FROM Updates WHERE id = ?;";
      connection.query(query, [req.body.id], function (qerr, rows, fields) {
          connection.release();
          if (qerr) {
              res.sendStatus(500);
              return;
          }
          res.sendStatus(200);
        });
    });
  } else {
    res.sendStatus(500);
  }
});

router.post('/deleteclub', function(req,res,next) {
  if (req.body.id !== "") {
    req.pool.getConnection(function (cerr, connection) {
      if (cerr) {
          res.sendStatus(500);
          return;
      }
      let query = "DELETE FROM Clubs WHERE id = ?;";
      connection.query(query, [req.body.id], function (qerr, rows, fields) {
          connection.release();
          if (qerr) {
              res.sendStatus(500);
              return;
          }

          fs.unlinkSync('public/clubs/'+req.body.path);
          fs.unlinkSync('public/'+req.body.img_path);
          res.sendStatus(200);
        });
    });
  } else {
    res.sendStatus(500);
  }
});

router.post('/joinclub', function(req,res,next) {
  req.pool.getConnection(function (cerr, connection) {
    if (cerr) {
        res.sendStatus(500);
        return;
    }
    let query = `INSERT INTO Club_Enrolments (
                    user_id,
                    club_id,
                    is_manager
                ) VALUES (
                    ?,
                    ?,
                    FALSE
                );`;
    connection.query(
      query,
      [req.session.user.id,
      req.body.club_id],
      function (qerr, rows, fields) {
        connection.release();
        if (qerr) {
            res.sendStatus(500);
            return;
        }
        res.sendStatus(200);
      }
    );
  });
});

router.post('/leaveclub', function(req,res,next) {
  req.pool.getConnection(function (cerr, connection) {
    if (cerr) {
        res.sendStatus(500);
        return;
    }
    let query = `DELETE FROM Club_Enrolments WHERE user_id = ? AND club_id = ?;`;
    connection.query(
      query,
      [req.session.user.id,
      req.body.club_id],
      function (qerr, rows, fields) {
        connection.release();
        if (qerr) {
            res.sendStatus(500);
            return;
        }
        res.sendStatus(200);
      }
    );
  });
});

router.post('/doRSVP', function(req,res,next) {
  req.pool.getConnection(function (cerr, connection) {
    if (cerr) {
        res.sendStatus(500);
        return;
    }
    let query = `INSERT INTO Event_RSVPs (
                    user_id,
                    event_id,
                    is_coming
                ) VALUES (
                    ?,
                    ?,
                    TRUE
                );`;
    connection.query(
      query,
      [req.session.user.id,
      req.body.post_id],
      function (qerr, rows, fields) {
        connection.release();
        if (qerr) {
            res.sendStatus(500);
            return;
        }
        res.sendStatus(200);
      }
      );
  });
});

router.get('/showusers', function(req,res,next) {
  req.pool.getConnection(function (cerr, connection) {
    if (cerr) {
      res.sendStatus(500);
      return;
    }
    let query = "SELECT Users.first_name, Users.last_name FROM Club_Enrolments INNER JOIN Users ON Users.id = Club_Enrolments.user_id WHERE club_id = ?;";
    connection.query(query, [req.query.param1],function (qerr, rows, fields) {
      connection.release();
      if (qerr) {
        res.sendStatus(500);
        return;
      }
      res.json(rows);
    });
  });
});

router.get('/showRSVPs', function(req,res,next) {
  req.pool.getConnection(function (cerr, connection) {
    if (cerr) {
      res.sendStatus(500);
      return;
    }
    let query = "SELECT Users.first_name, Users.last_name FROM Event_RSVPs INNER JOIN Users ON Users.id = Event_RSVPs.user_id WHERE event_id = ?;";
    connection.query(query, [req.query.param1],function (qerr, rows, fields) {
      connection.release();
      if (qerr) {
        res.sendStatus(500);
        return;
      }
      res.json(rows);
    });
  });
});

router.post('/receiveupdates', function(req,res,next) {
  req.pool.getConnection(function (cerr, connection) {
    if (cerr) {
        res.sendStatus(500);
        return;
    }
    let query = `UPDATE Club_Enrolments SET has_notification = TRUE WHERE user_id = ? AND club_id = ?`;
    connection.query(
      query,
      [req.session.user.id,
      req.body.club_id],
      function (qerr, rows, fields) {
        connection.release();
        if (qerr) {
            res.sendStatus(500);
            return;
        }
        res.sendStatus(200);
      }
    );
  });
});

router.post('/stopupdates', function(req,res,next) {
  req.pool.getConnection(function (cerr, connection) {
    if (cerr) {
        res.sendStatus(500);
        return;
    }
    let query = `UPDATE Club_Enrolments SET has_notification = TRUE WHERE user_id = ? AND club_id = ?`;
    connection.query(
      query,
      [req.session.user.id,
      req.body.club_id],
      function (qerr, rows, fields) {
        connection.release();
        if (qerr) {
            res.sendStatus(500);
            return;
        }
        res.sendStatus(200);
      }
    );
  });
});


module.exports = router;
