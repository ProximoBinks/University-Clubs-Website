const vueinst = Vue.createApp({
  data() {
    return {
      loggedIn: false,
      isAdmin: false,
      users: [],
      unauthorized: false
    };
  },
  methods: {
    logout() {
      var req = new XMLHttpRequest();
      req.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
          vueinst.loggedIn = false;
          vueinst.isAdmin = false;
          window.location.href = '/';
        }
      };
      req.open('POST', '/users/logout');
      req.setRequestHeader('Content-Type', 'application/json');
      req.send();
    },
    fetchUsers() {
      var self = this;
      var req = new XMLHttpRequest();
      req.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
          self.users = JSON.parse(this.responseText);
          self.formatDateOfBirth();
        }
      };
      req.open('GET', '/users/admin/users');
      req.setRequestHeader('Content-Type', 'application/json');
      req.send();
    },
    formatDateOfBirth() {
      for (let user of this.users) {
        if (user.date_of_birth) {
          const date = new Date(user.date_of_birth);
          const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
          user.date_of_birth = formattedDate;
        }
      }
    },
    grantAdminPrivileges(user) {
      const req = new XMLHttpRequest();
      const self = this;
      req.open('PUT', '/users/admin?param1=' + encodeURIComponent(user.id));
      req.setRequestHeader('Content-Type', 'application/json');
      req.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
          location.reload();
        }
      };
      req.send(JSON.stringify({ isAdmin: true }));
    },
    revokeAdminPrivileges(user) {
      const req = new XMLHttpRequest();
      const self = this;
      req.open('PUT', '/users/admin?param1=' + encodeURIComponent(user.id));
      req.setRequestHeader('Content-Type', 'application/json');
      req.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
          location.reload();
        }
      };
      req.send(JSON.stringify({ isAdmin: false }));
    },
    deleteUser(user) {
      const req = new XMLHttpRequest();
      const self = this;
      req.open('POST', '/users/deleteuser');
      req.setRequestHeader('Content-Type', 'application/json');
      req.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
          location.reload();
        }
      };
      req.send(JSON.stringify({ user_id: user.id }));
    }
  },
  beforeMount() {
    var req = new XMLHttpRequest();
    var self = this;
    req.onreadystatechange = function () {
      if (this.readyState === 4 && this.status === 200) {
        var user = JSON.parse(this.responseText);
        vueinst.loggedIn = true;
        self.isAdmin = user.isAdmin;
        if (user.isAdmin) {
          vueinst.fetchUsers();
        } else {
          vueinst.unauthorized = true;
        }
      } else if (this.readyState === 4 && this.status === 401) {
        window.location.href = '/login.html';
      }
    };
    req.open('GET', '/users/profile');
    req.setRequestHeader('Content-Type', 'application/json');
    req.send();
  }
}).mount('#app');
