const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());

const userDBFile = './userDB.json';
const secretKey = 'ooIImnnHH-56ouIooN99-PLokjiCcc';

// Login endpoint
app.post('/login', (req, res) => {

    fs.readFile(userDBFile, 'utf8', (err, data) => {
        const { username,password } = req.body;
        let users = [];
        if (err) {
            return res.status(500).json({ error: 'Failed to read user database' });
        }
        users = JSON.parse(data);
        const user = users.find((user) => user.username === username);

        if (user) {

            bcrypt.compare(password, user.password, (err, result) => {
                if (err) {
                    return res.status(500).json({
                        error: 'Failed to compare passwords'
                    });
                }

                if (!result) {
                    return res.status(401).json({
                        error: 'Invalid username or password'
                    });
                }

                // Generate JWT
                const token = jwt.sign({
                    username: user.username
                }, secretKey, {
                    expiresIn: '7d'
                });

                return res.json({
                    token
                });
            });
            // Generate JWT

        } else {
            return res.status(401).json({
                error: 'Invalid username or password'
            });
        }
    });

    // Find user by username and validate password

});

// Example protected route
app.get('/protected', authenticateToken, (req, res) => {
    res.json({
        message: 'Protected route accessed successfully!'
    });
});

// Middleware to authenticate JWT
function authenticateToken(req, res, next) {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            error: 'Missing token'
        });
    }

    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            return res.status(403).json({
                error: 'Invalid token'
            });
        }

        req.user = user;
        next();
    });
}


app.get('/movies', authenticateToken, (req, res) => {
    res.json(moviesMock);
});

//Looks better if I read this from json file or DB, for now lets go ahead with this.
const moviesMock = [{
        title: 'The Gray Man',
        coverUrl: 'https://m.media-amazon.com/images/M/MV5BOWY4MmFiY2QtMzE1YS00NTg1LWIwOTQtYTI4ZGUzNWIxNTVmXkEyXkFqcGdeQXVyODk4OTc3MTY@._V'
    },
    {
        title: 'Top Gun: Maverick',
        coverUrl: 'https://m.media-amazon.com/images/M/MV5BZWYzOGEwNTgtNWU3NS00ZTQ0LWJkODUtMmVhMjIwMjA1ZmQwXkEyXkFqcGdeQXVyMjkwOTAyMDU@._V'
    },
    {
        title: 'Interceptor',
        coverUrl: 'https://upload.wikimedia.org/wikipedia/en/3/31/Interceptor_%28film%29.jpg'
    },
    {
        title: 'Bullet Train',
        coverUrl: 'https://m.media-amazon.com/images/M/MV5BMDU2ZmM2OTYtNzIxYy00NjM5LTliNGQtN2JmOWQzYTBmZWUzXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V'
    },
    {
        title: 'The Tomorrow War',
        coverUrl: 'https://m.media-amazon.com/images/M/MV5BNTI2YTI0MWEtNGQ4OS00ODIzLWE1MWEtZGJiN2E3ZmM1OWI1XkEyXkFqcGdeQXVyODk4OTc3MTY@._V'
    },
    {
        title: 'Amsterdam',
        coverUrl: 'https://assets.gadgets360cdn.com/pricee/assets/product/202212/Amsterdam_1671200401.jpg'
    },
];

app.post('/register', (req, res) => {

    const {
        username,
        password
    } = req.body;
    // Read the user database file
    fs.readFile(userDBFile, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({
                error: 'Failed to read user database'
            });
        }

        let users = [];


        try {

            users = JSON.parse(data);
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                error: 'Failed to parse user database'
            });
        }

        // Check if the username already exists
        const existingUser = users.find((user) => user.username === username);

        if (existingUser) {
            return res.status(400).json({
                error: 'Username already exists'
            });
        }

        // Hash the password
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                return res.status(500).json({
                    error: 'Failed to hash password'
                });
            }

            // Add the new user to the database
            const newUser = {
                username,
                password: hashedPassword
            };
            users.push(newUser);

            // Write the updated user database file
            fs.writeFile(userDBFile, JSON.stringify(users), (err) => {
                if (err) {
                    return res.status(500).json({
                        error: 'Failed to write user database'
                    });
                }

                res.json({
                    message: 'User registered successfully'
                });
            });
        });
    });
});


// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});