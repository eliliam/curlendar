import colors, { stripColors } from 'colors/safe';
import Table from 'easy-table';
import { google } from 'googleapis';
import moment from 'moment';

export const listEvents = async (auth, disableColors = false) => {
	const days = await buildEvents(auth);

	let finalText = '';
	for (const day of Object.keys(days)) {
		const table = createDayTable(days[day]);
		const tableLines = table.trim().split('\n');
		finalText += `${colors.bold(day)}\n`;
		for (const line of tableLines) finalText += `    ${line}\n`;
		finalText += '\n';
	}

	return disableColors ? stripColors(finalText) : finalText;
};

/**
 * Lists the events for the next 7 days on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
export const buildEvents = async (auth) => {
	const calendar = google.calendar({ version: 'v3', auth });
	const res = await calendar.events.list({
		calendarId: 'primary',
		timeMin: moment().startOf('day').toISOString(),
		singleEvents: true,
		orderBy: 'startTime',
		timeMax: moment().startOf('day').add(7, 'days').toISOString(),
	});

	const events = res.data.items;
	if (!events || events.length === 0) return 'No upcoming events found.';

	const days = {};
	for (const event of events) {
		const day = moment(event.start.dateTime || event.start.date).format('dddd, MMM D, YYYY');
		if (!days[day]) days[day] = [];
		days[day].push(event);
	}

	return days;
};

const createDayTable = (events) => {
	const t = new Table();
	const now = moment();
	// This is a separate loop so that all day events are shown first
	for (const event of events) {
		const { start, end } = event;

		const startBeforeNow = moment(start.dateTime || start.date).isBefore(now);
		const endAfterNow = moment(end.dateTime || end.date).isAfter(now);
		const isHappeningNow = startBeforeNow && endAfterNow;

		const format = isHappeningNow ? colors.green : !endAfterNow ? colors.gray : (text) => text;
		if (!event.start.dateTime) {
			t.cell('Time', format('All day'));
			t.cell('Summary', format(event.summary));
			t.cell('Organizer', format(event.organizer.displayName || event.organizer.email));
			t.cell('Attendees', format(createAttendeesText(event.attendees || [])));
			t.newRow();
		}
	}

	for (const event of events) {
		const { start, end } = event;

		const startBeforeNow = moment(start.dateTime || start.date).isBefore(now);
		const endAfterNow = moment(end.dateTime || end.date).isAfter(now);
		const isHappeningNow = startBeforeNow && endAfterNow;

		const format = isHappeningNow ? colors.green : !endAfterNow ? colors.gray : (text) => text;
		if (event.start.dateTime) {
			const timeString = `${moment(event.start.dateTime).format('h:mma')} - ${moment(event.end.dateTime).format(
				'h:mma'
			)}`;
			t.cell('Time', format(timeString));
			t.cell('Summary', format(event.summary));
			t.cell('Organizer', format(event.organizer.displayName || event.organizer.email));
			t.cell('Attendees', format(createAttendeesText(event.attendees || [])));
			t.newRow();
		}
	}

	return t.toString();
};

const createAttendeesText = (attendees) => {
	const attendeesWithName = attendees.map((attendee) => {
		const { displayName, email } = attendee;
		if (displayName) return displayName;
		else
			return email
				.split('@')[0]
				.split('.')
				.join(' ')
				.replace(/\b\w/g, (l) => l.toUpperCase());
	});
	let finalAttendees = Array.from(attendeesWithName);

	if (attendeesWithName.length > 3) {
		finalAttendees = attendeesWithName.slice(0, 3);
		finalAttendees.push('and ' + (attendees.length - 3) + ' more');
	}
	return finalAttendees.join(', ');
};
