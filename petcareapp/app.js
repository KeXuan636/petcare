const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const flash = require('connect-flash');
const app = express();

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Republic_C207',
    database: 'pet_care_db'
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});

app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    // Session expires after 1 week of inactivity
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 } // 1 week
}));

app.use(flash());
app.set('view engine', 'ejs');

const checkAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    } else {
        req.flash('error', 'Please log in to view this resource.');
        res.redirect('/login');
    }
};

const checkAdmin = (req, res, next) => {
    if (req.session.user.role === 'admin') {
        return next();
    } else {
        req.flash('error', 'Access denied');
        res.redirect('/dashboard');
    }
};

// Homepage route
app.get('/', (req, res) => {
    if (req.session.user) {
        // If logged in, show homepage (browse appointments etc.)
        res.render('index', { user: req.session.user, messages: req.flash('success') });
    } else {
        // If NOT logged in, redirect to login
        res.redirect('/login');
    }
});

// Login page route
app.get('/login', (req, res) => {
    res.render('login', {
        messages: req.flash('success'),
        errors: req.flash('error')
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    //Validate email and password
    if (!email || !password) {
        req.flash('error', 'All fields are required.');
        return res.redirect('/login');
    }

    const sql = 'SELECT * FROM users WHERE email = ? AND password = SHA1(?)';
    db.query(sql, [email, password], (err, results) => {
        if (err) {  
            throw err;
        }

        if (results.length > 0) {
            //Successful login
            req.session.user = results[0]; // store user in session
            req.flash('success', 'Login successful!');
            //******** TODO: Update to redirect users to /dashboard route upon successful log in ********//
            res.redirect('/dashboard');
        } else {
            //Invalid credentials
            req.flash('error', 'Invalid email or password.');
            res.redirect('/login');
        }
    });
});

app.get('/register', (req, res) => {
    res.render('register', { messages: req.flash('error'), formData: req.flash('formData')[0] });
});

// Configure session and flash middleware
const validateRegistration = (req, res, next) => {
    const { username, email, password, address, contact } = req.body;

    if (!username || !email || !password || !address || !contact) {
        return res.status(400).send('All fields are required.');
    }
    if (password.length < 6) {
        req.flash('error', 'Password must be at least 6 or more characters long.');
        req.flash('formData', req.body);
        return res.redirect('/register');
    }
    next(); // If all validations pass, the next function is called, allowing the request to proceed to the next middleware function or route handler.
};

app.post('/register', validateRegistration, (req, res) => {
    const { username, email, password, address, contact, role } = req.body;

    const sql = 'INSERT INTO users (username, email, password, address, contact, role) VALUES (?, ?, SHA1(?), ?, ?, ?)';
    db.query(sql, [username, email, password, address, contact, role], (err, result) => {
        if (err) {
            throw err;
        }
        console.log(result);
        req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/login');
    });
});

app.get('/dashboard', checkAuthenticated, (req, res) => {
    res.render('dashboard', { user: req.session.user });
});

app.get('/', (req, res) => {
    res.render('index', { user: req.session.user, messages: req.flash('success')});
});

app.get('/search', (req, res) => {
  const { query, category } = req.query;
  let sql = 'SELECT * FROM items WHERE 1=1';
  const params = [];

  if (query) {
    sql += ' AND name LIKE ?';
    params.push(`%${query}%`);
  }

  if (category) {
    sql += ' AND category_id = ?';
    params.push(category);
  }

  db.query(sql, params, (err, items) => {
    if (err) return res.status(500).send(err);

    items = items.map(item => ({
      ...item,
      price: parseFloat(item.price)
    }));

    db.query('SELECT * FROM categories', (err, categories) => {
      if (err) return res.status(500).send(err);

      res.render('searchfilter', { items, categories, query, category });
    });
  });
});

app.get('/view', checkAuthenticated, (req, res) => {
    const queries = {
        expenses: 'SELECT * FROM expenses',
        appointments: 'SELECT * FROM appointments',
        careRoutines: 'SELECT * FROM care_routines'
    };

    let data = {};

    db.query(queries.expenses, (err, expenses) => {
        if (err) throw err;
        data.expenses = expenses;

        db.query(queries.appointments, (err, appointments) => {
            if (err) throw err;
            data.appointments = appointments;

            db.query(queries.careRoutines, (err, routines) => {
                if (err) throw err;
                data.routines = routines;

                res.render('view', {
                    expenses: data.expenses,
                    appointments: data.appointments,
                    routines: data.routines,
                    user: req.session.user
                });
            });
        });
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Delete expense
app.post('/deleteExpense/:id', checkAuthenticated, (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM expenses WHERE id = ?', [id], (err) => {
        if (err) throw err;
        res.redirect('/view');
    });
});

// Delete appointment
app.post('/deleteAppointment/:id', checkAuthenticated, (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM appointments WHERE id = ?', [id], (err) => {
        if (err) throw err;
        res.redirect('/view');
    });
});

// Delete care routine
app.post('/deleteRoutine/:id', checkAuthenticated, (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM care_routines WHERE id = ?', [id], (err) => {
        if (err) throw err;
        res.redirect('/view');
    });
});

//Start the server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server is running at https://localhost:${PORT}`);
// });
app.listen(3000, () => {
    console.log('Server started on port 3000');
});
