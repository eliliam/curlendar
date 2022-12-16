import express from 'express';
import { createServer } from 'http';
import { authorize } from './auth';
import { listEvents } from './calendar';

const PORT = 8080;

let client;

authorize().then((auth) => (client = auth));

const app = express();
const server = createServer(app);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', async (req, res) => {
	const isCurl = req.headers && req.headers['user-agent'] && req.headers['user-agent'].includes('curl');
	const events = await listEvents(client, !isCurl);

	if (isCurl) res.send(events);
	else res.send(`<pre>${events}</pre>`);
});

server.listen(PORT, () => {
	console.log(`Curly server listening on port ${PORT}`);
});
