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

// Main Login Endpoint - Grants immediate access upon login
app.post('/api/google-login', async (req, res) => {
    const { token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();

        // Print details directly to Render logs
        console.log('--- LOGIN SUCCESSFUL ---');
        console.log('Email:', payload.email);
        console.log('Name:', payload.name);
        console.log('Google ID (sub):', payload.sub);
        console.log('------------------------');

        // Create application session token immediately
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

        // Send full login access data directly to the client
        res.status(200).json({
            success: true,
            message: 'Access granted automatically',
            token: sessionToken,
            user: {
                name: payload.name,
                email: payload.email,
                picture: payload.picture,
                id: payload.sub
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
