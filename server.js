const mongoose = require('mongoose');
const express = require('express');
const bcrypt = require('bcrypt');  
const User = require('./models/user');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log(' MongoDB connected'))
    .catch(err => console.error(' MongoDB connection error:', err));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});


app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});


app.post('/signup', async (req, res) => {
    const { username, usermail, password, mobileno } = req.body;
    try {
        const existingUser = await User.findOne({ usermail });
        if (existingUser) {
            return res.send('<h2>User already exists. Please <a href="/">Login</a>.</h2>');
        }

       
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            usermail,
            password: hashedPassword,
            mobileno
        });

        await newUser.save();
        res.send('<h2>Account created successfully! <a href="/">Login here</a></h2>');
    } catch (err) {
        console.error(' Error creating account:', err);
        res.status(500).send('Server error');
    }
});


app.post('/login', async (req, res) => {
    const { username, usermail, password } = req.body;
    try {
        const existingUser = await User.findOne({ username, usermail });
        if (!existingUser) {
            return res.send('<h2>Invalid credentials. <a href="/">Try again</a></h2>');
        }

        
        const isMatch = await bcrypt.compare(password, existingUser.password);

        if (isMatch) {
            res.send(`<h2>Welcome, ${existingUser.username}!</h2>`);
        } else {
            res.send('<h2>Invalid credentials. <a href="/">Try again</a></h2>');
        }
    } catch (err) {
        console.error(' Error checking login:', err);
        res.status(500).send('Server error');
    }
});


app.listen(PORT, () => {
    console.log(` Server is running on http://localhost:${PORT}`);
});
