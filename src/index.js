import express from 'express';
import { createServer } from 'http';
import { authorize } from './auth';
import { listEvents } from './calendar';

const PORT = 8080;

let client;

authorize().then((auth) => (client = auth));

const app = express();
const server = createServer(app);

// TODO: remove this bogus commit that is to trick the build server

//
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', async (req, res) => {
	const events = await listEvents(client);
	res.send(events);
});

server.listen(PORT, () => {
	console.log(`Curly server listening on port ${PORT}`);
});
