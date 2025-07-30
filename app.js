const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const mysql = require('mysql2');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: true
}));
app.use(flash());

// DB connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Republic_C207',
    database: 'pet_care_db'
});
db.connect(err => {
    if (err) throw err;
    console.log('Connected to database');
});

// Middleware
const checkAuthenticated = (req, res, next) => {
    if (req.session.user) return next();
    res.redirect('/login');
};

const checkAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') return next();
    res.status(403).send('Access denied.');
};

// Show index page first for everyone
app.get('/', (req, res) => {
    res.render('index', { user: req.session.user || null });
});

// Login
app.get('/login', (req, res) => {
    res.render('login', {
        messages: req.flash('success'),
        errors: req.flash('error')
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.query("SELECT * FROM users WHERE email = ? AND password = SHA1(?)", [email, password], (err, results) => {
        if (err) return res.send("DB Error");
        if (results.length > 0) {
            req.session.user = results[0];
            return res.redirect('/');
        } else {
            req.flash('error', 'Invalid email or password');
            res.redirect('/login');
        }
    });
});

// Registration
app.get('/register', (req, res) => {
    res.render('register', {
        messages: req.flash('error'),
        formData: req.flash('formData')[0]
    });
});

const validateRegistration = (req, res, next) => {
    const { username, email, password, address, contact } = req.body;
    if (!username || !email || !password || !address || !contact) {
        req.flash('error', 'All fields are required.');
        req.flash('formData', req.body);
        return res.redirect('/register');
    }
    if (password.length < 6) {
        req.flash('error', 'Password must be at least 6 characters.');
        req.flash('formData', req.body);
        return res.redirect('/register');
    }
    next();
};

app.post('/register', validateRegistration, (req, res) => {
    const { username, email, password, address, contact, role } = req.body;
    const sql = 'INSERT INTO users (username, email, password, address, contact, role) VALUES (?, ?, SHA1(?), ?, ?, ?)';
    db.query(sql, [username, email, password, address, contact, role], (err) => {
        if (err) throw err;
        req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/login');
    });
});

// ADMIN: Dashboard
app.get("/admin", checkAuthenticated, checkAdmin, (req, res) => {
    db.query("SELECT id, username, email, role FROM users", (err, users) => {
        if (err) return res.send("DB Error");
        res.render("admin_dashboard", { users });
    });
});

// ADMIN: View user details
app.get("/admin/user/:id", checkAuthenticated, checkAdmin, (req, res) => {
    const userId = req.params.id;

    db.query("SELECT * FROM expenses WHERE user_id = ?", [userId], (err, expenses) => {
        if (err) return res.send("DB Error");

        db.query("SELECT * FROM appointments WHERE user_id = ?", [userId], (err2, appointments) => {
            if (err2) return res.send("DB Error");

            db.query("SELECT * FROM care_routines WHERE user_id = ?", [userId], (err3, routines) => {
                if (err3) return res.send("DB Error");

                res.render("admin_user_detail", { userId, expenses, appointments, routines });
            });
        });
    });
});

// USER: Dashboard
app.get("/user", checkAuthenticated, (req, res) => {
    if (req.session.user.role !== "user") return res.status(403).send("Unauthorized");

    const userId = req.session.user.id;

    db.query("SELECT * FROM expenses WHERE user_id = ?", [userId], (err, expenses) => {
        if (err) return res.send("DB Error");

        db.query("SELECT * FROM appointments WHERE user_id = ?", [userId], (err2, appointments) => {
            if (err2) return res.send("DB Error");

            db.query("SELECT * FROM care_routines WHERE user_id = ?", [userId], (err3, routines) => {
                if (err3) return res.send("DB Error");

                res.render("user_dashboard", {
                    expenses,
                    appointments,
                    routines,
                    user: req.session.user
                });
            });
        });
    });
});

// Add Expense
app.get('/addexpense', checkAuthenticated, (req, res) => {
    db.query('SELECT * FROM categories', (err, results) => {
        if (err) throw err;
        res.render('add_expense', { 
            categories: results,
            user: req.session.user 
        });
    });
});

app.post('/addexpense', checkAuthenticated, (req, res) => {
    const { pet_name, categories, vet, amount } = req.body;
    const user_id = req.session.user.id;
    const sql = 'INSERT INTO expenses (user_id, pet_name, categories, vet, amount) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [user_id, pet_name, categories, vet, amount], (err) => {
        if (err) throw err;
        res.redirect('/user');
    });
});

// Add Appointment
app.get('/addappointment', checkAuthenticated, (req, res) => {
    res.render('add_appointment', { user: req.session.user });
});

app.post('/addappointment', checkAuthenticated, (req, res) => {
    const { pet_name, clinic, date, notes } = req.body;
    const user_id = req.session.user.id;
    const sql = 'INSERT INTO appointments (user_id, pet_name, clinic, date, notes) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [user_id, pet_name, clinic, date, notes], (err) => {
        if (err) throw err;
        res.redirect('/user');
    });
});

// Add Care Routine
app.get('/addcareroutine', checkAuthenticated, (req, res) => {
    res.render('add_routine', { user: req.session.user });
});

app.post('/addcareroutine', checkAuthenticated, (req, res) => {
    const { pet_name, routine_type, date, notes } = req.body;
    const user_id = req.session.user.id;
    const sql = 'INSERT INTO routines (user_id, pet_name, routine_type, date, notes) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [user_id, pet_name, routine_type, date, notes], (err) => {
        if (err) throw err;
        res.redirect('/user');
    });
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});