import Table from 'easy-table';
import { google } from 'googleapis';
import moment from 'moment';

/**
 * Lists the events for the next 7 days on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
export const listEvents = async (auth) => {
	const calendar = google.calendar({ version: 'v3', auth });
	const res = await calendar.events.list({
		calendarId: 'primary',
		timeMin: new Date().toISOString(),
		singleEvents: true,
		orderBy: 'startTime',
		timeMax: moment().startOf('day').add(1, 'days').toISOString(),
	});

	const events = res.data.items;
	if (!events || events.length === 0) {
		console.log('No upcoming events found.');
		return;
	}

	const t = new Table();

	for (const event of events) {
		if (!event.start.dateTime) {
			t.cell('Time', 'All day');
			t.cell('Summary', event.summary);
			t.cell('Organizer', event.organizer.displayName || event.organizer.email);
			t.cell('Attendees', createAttendeesText(event.attendees || []));
			t.newRow();
		}
	}

	for (const event of events) {
		if (event.start.dateTime) {
			const timeString = `${moment(event.start.dateTime).format('h:mma')} - ${moment(event.end.dateTime).format(
				'h:mma'
			)}`;
			t.cell('Time', timeString);
			t.cell('Summary', event.summary);
			t.cell('Organizer', event.organizer.displayName || event.organizer.email);
			t.cell('Attendees', createAttendeesText(event.attendees || []));
			t.newRow();
		}
	}

	return t.toString();
};

const createAttendeesText = (attendees) => {
	const attendeesWithName = attendees
		.filter((attendee) => attendee.displayName)
		.map((attendee) => attendee.displayName);
	let finalAttendees = Array.from(attendeesWithName);
	if (attendeesWithName.length >= 3) {
		finalAttendees = attendeesWithName.slice(0, 3);
		finalAttendees.push('and ' + (attendees.length - 3) + ' more');
	}
	return finalAttendees.join(', ');
};
