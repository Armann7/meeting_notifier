
// Retrieves a valid OAuth token (fetches new one if expired)
export async function getValidToken(interactive) {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: interactive }, (token) => {
      if (chrome.runtime.lastError || !token) {
        return reject(chrome.runtime.lastError || new Error("Authorization failed"));
      }
      resolve(token);
    });
  });
}

export async function logoff() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (chrome.runtime.lastError || !token) {
        console.warn('No token found or already logged out.');
        return resolve(); // Resolve even if no token
      }

      fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`)
        .then(() => {
          chrome.identity.removeCachedAuthToken({ token }, () => {
            resolve(); // Done
          });
        })
        .catch((err) => {
          console.error('Error revoking token:', err);
          reject(err);
        });
    });
  });
}

// Retrieves user information from the Google OAuth2 userinfo endpoint.
export async function getUserInfo(token) {
  try {
    const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user info");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error;
  }
}

// Fetches all calendar events from all user calendars
export async function fetchAllCalendarEvents(token, timeMax) {
  try {
    const calendarList = await fetchCalendars(token);

    if (!calendarList || !calendarList.items || calendarList.items.length === 0) {
      console.log("No calendars found.");
      return [];
    }

    const allEvents = [];
    for (const calendar of calendarList.items) {
      console.log(`Calendar: ${calendar.summary} (ID: ${calendar.id})`);
      try {
        const eventsData = await fetchCalendarEvents(calendar.id, timeMax);
        if (!eventsData || !eventsData.items) {
          console.log("  No upcoming events found.");
          continue;
        }

        eventsData.items.forEach(event => {
          // console.log(`  Event: ${event.summary} at ${event.start.dateTime || event.start.date}`);
        });

        allEvents.push(...eventsData.items);
      } catch (error) {
        console.error(`Error fetching events for calendar ${calendar.id}:`, error);
      }
    }

    return allEvents;
  } catch (error) {
    console.error("Error fetching calendar list:", error);
    return [];
  }
}

// Fetches calendar events using the stored access token
async function fetchCalendarEvents(calendarId, timeMax) {
  try {
    const token = await getValidToken();
    const timeMin = new Date().toISOString();
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax.toISOString())}&singleEvents=true&orderBy=startTime`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(`Error fetching events for calendar ${calendarId}: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    throw error;
  }
}

// Fetches user calendars
async function fetchCalendars(token) {
  try {
    const response = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(`Error fetching calendars: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching calendar list:", error);
    throw error;
  }
}
