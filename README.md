# How to Set Up Your University Club's Website

## Setup Instructions

Follow these steps to set up and launch your website:

1. **Download and Launch Docker**
    - Download Docker from its official website and run the application.

2. **Open Project Folder in VSCode**
    - Open the folder containing the project files in Visual Studio Code.

3. **Build Dev Container**
    - Press `F1` and execute the command `Dev Containers: Rebuild and Reopen in Container`.

4. **Start MySQL Daemon**
    - Open a terminal within VSCode and run the command `mysqld start`.

5. **Initialize MySQL Daemon**
    - In the same terminal, enter the command `mysqld`.

6. **Open New Terminal**
    - Click to open a new terminal within VSCode.

7. **Import Database Backup**
    - Run the command `mysql < db/DatabaseBackup.sql` to import the database backup.

8. **Start Application**
    - Run the command `npm start` to launch the web application.

9. **Visit Localhost**
    - Open your web browser and go to `http://localhost:8080/`.

10. **Final Steps**
    - Congratulations! You have successfully set up the University Club's website.

## Additional Information

- **Administrator Access (Test Admin Account)**
  - Logging in with `test@test.com` and the password `test` grants you admin privileges. Access the admin dashboard at `http://localhost:8080/admin.html` to manage users, permissions, and more. To add more admins, you can either use SQL commands or the GUI on the admin page.

- **Creating and Managing Clubs**
  - Clubs can only be created by logged-in users through a button at the top of the webpage. Club creators become managers by default. Initially, the database contains no clubs, allowing you to test the system by creating or deleting as many clubs as you wish.