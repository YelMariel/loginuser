const mysql2 = require("mysql2");
const express = require("express");
const bodyParser = require("body-parser");
const encoder = bodyParser.urlencoded();
const session = require("express-session");

const app = express();
app.use("/assets", express.static("assets"));

// Use express-session for session management
app.use(session({
    secret: "your-secret-key", // Replace with a secret key for session encryption
    resave: false,
    saveUninitialized: true
}));

const connection = mysql2.createConnection({
    host: "localhost",
    port: "3306",
    user: "root",
    password: "mariel",
    database: "nodejs"
});

// Connection to the database
connection.connect(function (error) {
    if (error) throw error;
    else console.log("Connected to the database successfully!");
});

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.post("/", encoder, function (req, res) {
    var username = req.body.username;
    var password = req.body.password;

    if (!username || !password) {
        // Check if either username or password is empty
        res.redirect("/");
    } else {
        connection.query("SELECT * FROM loginuser WHERE user_name = ? AND user_password = ?", [username, password], function (error, results, fields) {
            if (results.length > 0) {
                // Store user information in the session
                req.session.user = username;
                res.redirect("/welcome");
            } else {
                res.redirect("/");
            }
            res.end();
        });
    }
});

// Welcome page with session-based authentication
app.get("/welcome", function (req, res) {
    if (req.session.user) {
        // User is authenticated; allow access to the welcome page
        res.sendFile(__dirname + "/welcome.html");
    } else {
        // User is not authenticated; redirect to the login page
        res.redirect("/");
    }
});

// Logout route to clear the session
app.get("/logout", function (req, res) {
    req.session.destroy();
    res.redirect("/");
});

// Set app port
app.listen(4000);
