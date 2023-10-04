const vueinst = Vue.createApp({
    data() {
        return {
            s_text: '',
            side_active: false,
            forgot: false,
            show_register: false,
            c_create_name: '',
            c_create_text: '',
            clubs: [],
            to_image: false,
            incorrect_fields: {
                value: false,
                success: false
            }, // WHY DOES THIS WORK, NO OTHER METHOD WORKS BUT THIS DOES
            date: new Date().toISOString().split('T')[0]+"T00:00",
            curr_club: [],
            club_events: [],
            tempPost: {
                post_title: '',
                post_info: '',
                event_time: null,
                isPrivate: false,
                club_id: ''
            },
            events: [],
            loggedIn: false, // Added loggedIn flag
            loginEmail: '',
            loginPassword: '',
            loginError: '',
            registerEmail: '',
            registerPassword: '',
            registrationError: '',
            firstName: '', // Added firstName
            lastName: '', // Added lastName
            curr_enrolment: {
                isMember: false,
                isManager: false
            },
            club_users: [],
            usersShown: false
        };
    },
    methods: {
        doSearch() {
            for (const club of this.clubs) {
                if (this.s_text === '') {
                    club.shown = true;
                } else if (club.club_name.toUpperCase().includes(this.s_text.toUpperCase())) {
                    club.shown = true;
                } else {
                    club.shown = false;
                }
            }
        },
        toLogin() {
            window.location.href='/login.html';
        },
        toggleSideBar() {
            if (this.side_active) {
                this.side_active = false;
            } else {
                this.side_active = true;
            }
        },
        toClub(club_url) {
            window.location.href='/clubs/' + club_url;
        },
        addClub() {
            let newClub = {
                club_name: this.c_create_name,
                club_info: this.c_create_text
            };
            var { incorrect_fields } = this;
            var req = new XMLHttpRequest();
            req.onreadystatechange = function(){
                if (this.readyState === 4 && this.status === 200) {
                    incorrect_fields.value = false;
                    incorrect_fields.success = true;
                } else if (this.readyState === 4 && this.status === 406) {
                    incorrect_fields.value = true;
                }
            };
            req.open('POST','/create-club');
            req.setRequestHeader('Content-Type','application/json');
            req.send(JSON.stringify(newClub));
        },
        showClubs() {
            var { clubs } = this;
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    var data = JSON.parse(this.responseText);
                    clubs.splice(0,clubs.length,...data);
                    for (let club of clubs) {
                        club.shown = true;
                    }
                }
            };

            xhttp.open("GET", "/clubs.json", true);
            xhttp.send();
        },
        newPost () {
            let newPost = {
                post_title: this.tempPost.post_title,
                post_info: this.tempPost.post_info,
                event_time: this.tempPost.event_time,
                isPrivate: this.tempPost.isPrivate,
                club_id: this.curr_club[0].id
            };
            var self = this;
            var req = new XMLHttpRequest();
            req.onreadystatechange = function(){
                if (this.readyState === 4 && this.status === 200) {
                    self.incorrect_fields.value = false;
                    self.incorrect_fields.success = true;
                } else if (this.readyState === 4 && this.status === 500) {
                    self.incorrect_fields.value = true;
                }
            };
            req.open('POST','/newpost');
            req.setRequestHeader('Content-Type','application/json');
            req.send(JSON.stringify(newPost));

        },
        getCurrClub (club_name) {
            var self = this;
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    var data = JSON.parse(this.responseText);
                    self.curr_club = data;
                }
            };

            xhttp.open("GET", "/curr_club.json?param1=" + encodeURIComponent(club_name), true);
            xhttp.send();
        },
        getAllEvents() {
            var self = this;
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    var data = JSON.parse(this.responseText);
                    var tempEvents = data;
                    /* self.events.splice(0,self.events.length,...data); */
                    self.events = tempEvents.slice(0,3);
                }
            };

            xhttp.open("GET", "/all_events.json", true);
            xhttp.send();
        },
        deletePost(postID) {
            /* var self = this; */
            var req = new XMLHttpRequest();
            /* req.onreadystatechange = function(){
                if (this.readyState === 4 && this.status === 200) {
                }
            }; */
            var thisID = {
                id: postID
            };
            req.open('POST','/deletepost');
            req.setRequestHeader('Content-Type','application/json');
            req.send(JSON.stringify(thisID));
        },
        deleteClub(clubID) {
            /* var self = this; */
            var req = new XMLHttpRequest();
            req.onreadystatechange = function(){
                if (this.readyState === 4 && this.status === 200) {
                    window.location.href='/';
                }
            };
            var thisID = {
                id: clubID,
                path: this.curr_club[0].page_url,
                img_path: this.curr_club[0].image_url
            };
            req.open('POST','/deleteclub');
            req.setRequestHeader('Content-Type','application/json');
            req.send(JSON.stringify(thisID));
        },
        login(event) {
            event.preventDefault();
            var { loginEmail, loginPassword } = this;
            var req = new XMLHttpRequest();
            req.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    vueinst.loggedIn = true; // Update loggedIn flag
                    window.location.href = '/';
                } else if (this.readyState === 4 && this.status === 401) {
                    vueinst.loginError = 'Invalid email or password';
                }
            };
            req.open('POST', '/users/login');
            req.setRequestHeader('Content-Type', 'application/json');
            req.send(JSON.stringify({ email: loginEmail, password: loginPassword }));
        },
        register(event) {
            event.preventDefault();
            var {
                firstName,
                lastName,
                registerEmail,
                registerPassword
            } = this;
            var req = new XMLHttpRequest();
            req.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    window.location.href = '/';
                } else if (this.readyState === 4 && this.status === 409) {
                    vueinst.registrationError = 'Email already exists';
                }
            };
            req.open('POST', '/users/register');
            req.setRequestHeader('Content-Type', 'application/json');
            req.send(JSON.stringify({
                firstName,
                lastName,
                email: registerEmail,
                password: registerPassword
            }));
        },
        logout() {
            var self = this;
            var req = new XMLHttpRequest();
            req.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    self.loggedIn = false; // Update loggedIn flag
                    window.location.href = '/';
                }
            };
            req.open('POST', '/users/logout');
            req.setRequestHeader('Content-Type', 'application/json');
            req.send();
        },
        checkLogin() {
            var req = new XMLHttpRequest();
            var self = this;
            req.onreadystatechange = function(){
                if (this.readyState === 4 && this.status === 200) {
                    self.loggedIn = true; // Update loggedIn flag
                }
            };
            req.open('GET','/users/check-login');
            req.setRequestHeader('Content-Type','application/json');
            req.send();
        },
        joinClub(clubID) {
            if (!this.loggedIn) {
                window.location.href = '/login.html';
            } else {
                var req = new XMLHttpRequest();
                var thisID = {
                    club_id: clubID
                };
                req.open('POST','/joinclub');
                req.setRequestHeader('Content-Type','application/json');
                req.send(JSON.stringify(thisID));
            }
        },
        leaveClub(clubID) {
            if (!this.loggedIn) {
                window.location.href = '/login.html';
            } else {
                var req = new XMLHttpRequest();
                var thisID = {
                    club_id: clubID
                };
                req.open('POST','/leaveclub');
                req.setRequestHeader('Content-Type','application/json');
                req.send(JSON.stringify(thisID));
            }
        },
        createClubLogin() {
            if (!this.loggedIn) {
                window.location.href = '/login.html';
            } else {
                window.location.href = '/clubs/create.html';
            }
        },
        doRSVP (postID) {
            if (!this.loggedIn) {
                window.location.href = '/login.html';
            } else {
                var req = new XMLHttpRequest();
                var self = this;
                req.onreadystatechange = function(){
                    if (this.readyState === 4 && this.status === 200) {
                        console.log("rsvp'd for event");
                    } else if (this.readyState === 4 && this.status === 500) {
                        var found = self.club_events.findIndex(function (element) {
                            return element.id === postID;
                        });
                        self.club_events[found].hasRSVP = true;
                    }
                };
                var thisID = {
                    post_id: postID
                };
                req.open('POST','/doRSVP');
                req.setRequestHeader('Content-Type','application/json');
                req.send(JSON.stringify(thisID));
            }
        },
        showUsers(clubID) {
            var req = new XMLHttpRequest();
                var self = this;
                req.onreadystatechange = function(){
                    if (this.readyState === 4 && this.status === 200) {
                        var data = JSON.parse(this.responseText);
                        self.club_users.splice(0,self.club_users.length,...data);
                        self.usersShown = true;
                    }
                };
                req.open('GET','/showusers?param1=' + encodeURIComponent(clubID), true);
                req.setRequestHeader('Content-Type','application/json');
                req.send();
        },
        hideUsers () {
            this.usersShown = false;
        },
        showRSVPs(eventID) {
            var req = new XMLHttpRequest();
                var self = this;
                req.onreadystatechange = function(){
                    if (this.readyState === 4 && this.status === 200) {
                        var data = JSON.parse(this.responseText);
                        var found = self.club_events.findIndex(function (element) {
                            return element.id === eventID;
                        });
                        self.club_events[found].rsvps.splice(
                            0,
                            self.club_events[found].rsvps.length,
                            ...data
                            );

                        self.club_events[found].showUsers = true;
                    }
                };
                req.open('GET','/showRSVPs?param1=' + encodeURIComponent(eventID), true);
                req.setRequestHeader('Content-Type','application/json');
                req.send();
        },
        hideRSVPs(eventID) {
            var self = this;
            var found = self.club_events.findIndex(function (element) {
                return element.id === eventID;
            });
            self.club_events[found].showUsers = false;
        },
        receiveUpdates(clubID) {
            if (!this.loggedIn) {
                window.location.href = '/login.html';
            } else {
                var req = new XMLHttpRequest();
                req.onreadystatechange = function(){
                    if (this.readyState === 4 && this.status === 200) {
                        console.log("signed up");
                    }
                };
                var thisID = {
                    club_id: clubID
                };
                req.open('POST','/receiveupdates');
                req.setRequestHeader('Content-Type','application/json');
                req.send(JSON.stringify(thisID));
            }
        },
        stopUpdates(clubID) {
            if (!this.loggedIn) {
                window.location.href = '/login.html';
            } else {
                var req = new XMLHttpRequest();
                req.onreadystatechange = function(){
                    if (this.readyState === 4 && this.status === 200) {
                        console.log("left");
                    }
                };
                var thisID = {
                    club_id: clubID
                };
                req.open('POST','/stopupdates');
                req.setRequestHeader('Content-Type','application/json');
                req.send(JSON.stringify(thisID));
            }
        }
    },
    beforeMount() {
        this.showClubs();
        this.getAllEvents();
        this.checkLogin();
    },
    mounted: function () {
        if (window.location.href.indexOf("/clubs/") > -1) {
            var name = document.getElementById("THIS-IS-CLUB-NAME").innerText;
            this.getCurrClub(name);
            var self = this;
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    var data = JSON.parse(this.responseText);
                    self.club_events.splice(0,self.club_events.length,...data.events);
                    self.curr_enrolment = data.memberInfo;
                    for (let event of self.club_events) {
                        event.showUsers = false;
                        event.rsvps = [];
                        event.hasRSVP = false;
                    }
                }
            };

            xhttp.open("GET", "/club_events.json?param1=" + encodeURIComponent(name), true);
            xhttp.send();


        }
    }
}).mount('#app');
