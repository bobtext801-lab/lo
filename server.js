const express = require('express');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');

const app = express();
const CLIENT_ID = '588066206740-50feus2h2qk27mk3264sq54oartfkkgf.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

let sharedData = null;

app.use(cors());
app.use(express.json());

app.post('/api/google-login', async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        
        console.log('Accepted User Login:', payload);

        sharedData = {
            message: "Hello from the server! User logged in successfully",
            sender: payload.name
        };

        res.json({ status: 'success', user: payload });
    } catch (error) {
        console.error('Login verification error:', error);
        res.status(400).json({ status: 'error', message: 'Invalid Token' });
    }
});

app.get('/api/shared-data', (req, res) => {
    res.json({ data: sharedData });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});