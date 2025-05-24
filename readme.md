# Google Calendar Meeting Notifier

This Chrome Extension helps users stay on top of their meetings by integrating with Google Calendar and providing timely system notifications. It also offers a simple login and logoff flow using the Chrome profile's Google account.

## Features

- 🔐 **Google Login**  
  Sign in using the Google account associated with your Chrome profile.

- 📅 **Meeting Notifications**  
  The extension checks your Google Calendar for upcoming meetings.

- ⏰ **Dual Notifications**  
  You'll receive two system notifications for each meeting:
  - At the exact scheduled time

## How It Works

1. **Login:**  
   Click the extension icon and log in with your Google account.

2. **Background Sync:**  
   The extension continuously monitors your Google Calendar for upcoming events.

3. **Notifications:**  
   System notifications are triggered based on your event schedule.

## Permissions Required

- `identity`: To authenticate with your Google account.
- `notifications`: To show system notifications.
- `background`: To run calendar checks even when the popup is closed.
- `calendar.readonly`: To read your Google Calendar events.

## Installation

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the extension directory.

## Notes

- Make sure you're logged into Chrome with the Google account you want to use.
- The extension does not store any personal data outside of your browser.
- Only calendar events with a scheduled time are considered for notifications.

## License

MIT License
