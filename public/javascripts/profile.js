const vueinst = Vue.createApp({
    data() {
        return {
            loggedIn: false,
            firstName: '',
            lastName: '',
            email: '',
            dateOfBirth: '',
            bio: '',
            editingProfile: false,
            newDateOfBirth: '',
            newFirstName: '',
            newLastName: '',
            newBio: '',
            side_active: false
        };
    },
    methods: {
        // Rest of the methods

        logout() {
            var req = new XMLHttpRequest();
            req.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    vueinst.loggedIn = false;
                    window.location.href = '/';
                }
            };
            req.open('POST', '/users/logout');
            req.setRequestHeader('Content-Type', 'application/json');
            req.send();
        },
        createClubLogin() {
            if (!this.loggedIn) {
                window.location.href = '/login.html';
            } else {
                window.location.href = '/clubs/create.html';
            }
        },
        editProfile() {
            this.editingProfile = true;
            // Set the values for editing
            this.newDateOfBirth = this.dateOfBirth; // Set the current date of birth
            this.newFirstName = this.firstName; // Set the current first name
            this.newLastName = this.lastName; // Set the current last name
            this.newBio = this.bio; // Set the current bio
        },
        cancelEditProfile() {
            this.editingProfile = false;
        },
        saveProfile() {
            // Send the updated profile data to the server for saving
            var self = this;
            var req = new XMLHttpRequest();
            req.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    // Update the profile data with the saved values
                    self.firstName = self.newFirstName;
                    self.lastName = self.newLastName;
                    // Clear the editing values and exit the editing mode
                    self.newDateOfBirth = '';
                    self.newFirstName = '';
                    self.newLastName = '';
                    self.newBio = '';
                    self.editingProfile = false;
                }
            };
            req.open('POST', '/users/save-profile');
            req.setRequestHeader('Content-Type', 'application/json');
            req.send(JSON.stringify({
                dateOfBirth: self.newDateOfBirth,
                firstName: self.newFirstName,
                lastName: self.newLastName,
                bio: self.newBio
            }));
            window.location.reload();
        },
        toggleSideBar() {
            if (this.side_active) {
                this.side_active = false;
            } else {
                this.side_active = true;
            }
        },
    },
    beforeMount() {
        var req = new XMLHttpRequest();
        var self = this;
        req.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                var user = JSON.parse(this.responseText);
                vueinst.loggedIn = true;
                vueinst.firstName = user.first_name;
                vueinst.lastName = user.last_name;
                vueinst.email = user.email;

                // Format the date of birth as dd-mm-yyyy
                if (user.date_of_birth){
                    var dateOfBirth = new Date(user.date_of_birth);
                    var day = String(dateOfBirth.getDate()).padStart(2, '0');
                    var month = String(dateOfBirth.getMonth() + 1).padStart(2, '0');
                    var year = dateOfBirth.getFullYear();
                    self.dateOfBirth = day + '-' + month + '-' + year;
                }
                else{
                    self.dateOfBirth=null;
                }
                vueinst.bio = user.bio; // New line
            } else if (this.readyState === 4 && this.status === 401) {
                window.location.href = '/login.html';
            }
        };
        req.open('GET', '/users/profile');
        req.setRequestHeader('Content-Type', 'application/json');
        req.send();
    }
}).mount('#app');