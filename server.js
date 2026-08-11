const express = require('express');
const { OAuth2Client } = require('google-auth-library');

const app = express();
const CLIENT_ID = '588066206740-50feus2h2qk27mk3264sq54oartfkkgf.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

let sharedData = null;

app.use(express.json());
app.use(express.static('New folder'));

app.post('/api/google-login', async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        
        sharedData = {
            message: "Hello from the server! User logged in successfully.",
            sender: payload.name
        };

        res.json({ status: 'success', user: payload });
    } catch (error) {
        res.status(400).json({ status: 'error', message: 'Invalid Token' });
    }
});

app.get('/api/shared-data', (req, res) => {
    res.json({ data: sharedData });
});

app.listen(3000, () => {
    console.log('Server running on https://bobtext801-lab.github.io/lo/');
});