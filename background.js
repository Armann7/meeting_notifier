import { getValidToken, fetchAllCalendarEvents } from './googleApi.js';


// Checks calendar events and creates notifications as needed.
async function checkCalendarEvents() {
  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);    
    const token = await getValidToken(false);
    const events = await fetchAllCalendarEvents(token, tomorrow);
    console.log('Fetched events: ', events.length);

    events.forEach(event => {
      const eventStart = new Date(event.start.dateTime).getTime();
      const diffMinutes = (eventStart - now) / (1000 * 60);
      var already_exist = false;
      chrome.storage.local.get([event.id]).then((result) => {
        if (result[event.id] !== undefined)
          already_exist = true;
      });

      if (diffMinutes > 0 && diffMinutes <= 30 && already_exist == false) {
        chrome.storage.local.set({ [event.id]:  ''});
        createAlarm(event.summary, 'Event is starting now', eventStart);
        const tenMinutesBefore = eventStart - (10 * 60 * 1000);
        createAlarm(event.summary, 'Event is starting in 10 minutes', tenMinutesBefore);
      };
    });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
  }
}


function createAlarm(title, message, notification_start) {
  const notification = {
    'title': title,
    'message': message};
  const notification_id = title + ':' + message + ':' + notification_start
  chrome.storage.local.set({ [notification_id]: notification });
  chrome.alarms.create(notification_id, { when: notification_start });
}


function createNotification(notification_id, notification) {
  chrome.notifications.create(
    notification_id,
    {
      type: 'basic',
      iconUrl: 'icon128.png',
      title: notification.title || 'Calendar Event',
      message: notification.message,
      priority: 2
    },
    (system_notification_id) => {
      console.log('Notification created:', system_notification_id);
    }
  );
}


// Listen for the alarm to trigger event checking.
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'pollCalendar') {
    checkCalendarEvents();
    return;
  }

  chrome.storage.local.get([alarm.name]).then((result) => {
    const notification = result[alarm.name]
    if (notification !== undefined) {
      createNotification(alarm.name, notification);
      chrome.storage.local.remove([alarm.name]).then();    
    }
  });
});


chrome.alarms.create('pollCalendar', { periodInMinutes: 5 });

