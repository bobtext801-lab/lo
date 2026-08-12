const express = require('express');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 10000;
const CLIENT_ID = '588066206740-50feus2h2qk27mk3264sq54oartfkkgf.apps.googleusercontent.com';
const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-development-secret-key';

const client = new OAuth2Client(CLIENT_ID);

app.use(cors());
app.use(express.json());

// 1. Google Auth & Session Token Issuance
app.post('/api/google-login', async (req, res) => {
    const { token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();

        // Create a signed JWT session token
        const sessionToken = jwt.sign(
            {
                sub: payload.sub,
                email: payload.email,
                name: payload.name,
                picture: payload.picture
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            success: true,
            message: 'Authentication successful',
            token: sessionToken,
            user: {
                name: payload.name,
                email: payload.email,
                picture: payload.picture
            }
        });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ success: false, message: 'Invalid Google token' });
    }
});

// 2. Protected Route Example
app.get('/api/protected-data', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.status(200).json({ message: 'Access granted to protected resources', user: decoded });
    } catch (err) {
        res.status(403).json({ message: 'Invalid or expired session token' });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));