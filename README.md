# Microsoft Teams Message Deleter

This JavaScript code snippet is designed to automatically delete your messages in Microsoft Teams chat when accessed through a web browser (Chromium-based browsers are recommended). The script will run in the browser's developer console and will loop through the chat messages, deleting the ones identified as yours.

**Please note**: This script is unofficial and not endorsed by Microsoft. Use it at your own risk, and always exercise caution when running scripts from third-party sources.

## Features

- Automatically detects and deletes your messages in the current chat
- Simulates mouse events for a smooth user experience
- Provides a confirmation prompt to prevent accidental message deletion
- Uses JavaScript and jQuery, making it easy to run in a browser console

## How to use

1. Open Microsoft Teams in a Chromium-based web browser (e.g., Google Chrome, Microsoft Edge).
2. Access the chat where you want to delete your messages.
3. Open the browser console by pressing F12 (or Ctrl+Shift+J in Chrome, or Ctrl+Shift+K in Edge).
4. The script will start running and will automatically delete your messages in the chat.
5. The script will stop running after 30 seconds of inactivity (no new messages).

## Code Explanaition

The code uses jQuery to interact with the DOM and identify your messages. It then simulates mouse events to delete the identified messages.

- mouse function: Simulates mouse events on DOM elements
- processQueue function: Processes the messages queue and deletes your messages
- loadMoreMessages function: Scrolls up to load older messages when needed
- waitForLoading function: Waits for older messages to load when scrolling up
- repeat: The main interval loop that runs the script every 1 second

## Important considerations

- Before using this script, make sure you understand the risks associated with running third-party scripts in your browser.
- Always test the script in a safe environment (e.g., a test chat with a friend) before using it in a real conversation.
- This script is provided "as is" without warranty of any kind. The author is not responsible for any issues, data loss, or other negative consequences that may result from using the script

## Limitations

- The script works only in Microsoft Teams accessed through a web browser (Chromium-based browsers are recommended).
- It does not work with the Microsoft Teams desktop application.
- The script might not work as intended if the web app structure changes or if there are modifications to the DOM elements.

## Disclaimer

This script is provided for educational purposes only. Use it at your own risk. The author is not responsible for any consequences resulting from the use of this code. Always follow your organization's policies and guidelines regarding the usage of Microsoft Teams and message deletion.

## Contributing

If you have any suggestions for improvements or would like to report any issues, please open an issue on this repository. Contributions are welcome!

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
