# Microsoft Teams Message Deleter

## Version Compatibility Notice (10/07/2025)
This script was significantly updated on 10/07/2025 to ensure compatibility with the new Microsoft Teams (v2) client.
The refactoring addresses changes in the underlying HTML structure and CSS selectors introduced in the new Teams interface. Please ensure you are using this script with the appropriate version of the Teams web application. This version is intended for the new Teams v2 and may not function correctly on the "classic" Teams client.

## Disclaimer

This is an unofficial script and is not supported by Microsoft. It directly interacts with the Teams web client's Document Object Model (DOM). UI changes made by Microsoft may break this script at any time. Use this script at your own risk. The author is not responsible for any unintended consequences, such as accidental data loss or issues with your Microsoft account. It is recommended to review the code before execution.

## Overview

This script automates the process of deleting your own messages from a Microsoft Teams chat or channel directly within a web browser. It is designed to be run from the browser's developer console.

The script intelligently scans the chat history, identifies messages sent by you, and systematically deletes them. It includes advanced features to ensure reliable and transparent operation.

## Features

- **Automated Deletion:** Sequentially deletes all messages sent by the user in the currently open chat.
- **Auto-Scrolling:** Automatically scrolls up to load older messages, allowing for the deletion of an entire chat history.
- **Visual Feedback:** Provides real-time visual cues by highlighting messages with different colored borders to indicate their status:
    - **Blue:** Currently being processed.
    - **Green:** Successfully deleted.
    - **Yellow:** A temporary error occurred; the script will retry.
    - **Red:** Permanently failed after multiple retries.
    - **Gray:** Skipped (e.g., a message from another user).
- **Error Handling & Retries:** If a deletion fails (e.g., due to a slow network or UI lag), the script will automatically retry a configurable number of times before marking the message as failed.
- **Resilient Processing:** Manages a queue of messages to process them one by one, preventing the script from overwhelming the browser or triggering rate-limiting.
- **Configurable:** Key parameters like deletion delay and max retries can be easily adjusted in the script's configuration section.

## Usage Instructions

1.  **Open Microsoft Teams:** Navigate to `teams.microsoft.com` in a web browser (e.g., Chrome, Firefox, Edge).
2.  **Select a Chat:** Open the chat or channel from which you want to delete messages.
3.  **Open Developer Tools:**
    -   **Windows/Linux:** Press `F12` or `Ctrl+Shift+I`.
    -   **macOS:** Press `Cmd+Opt+I`.
4.  **Navigate to Console:** In the Developer Tools panel, select the "Console" tab.
5.  **Paste the Script:** Copy the entire JavaScript code and paste it into the console prompt.
6.  **Execute:** Press `Enter` to run the script.
7.  **Monitor Progress:** The script will begin processing messages. You can observe its progress through the visual outlines on the messages themselves and the detailed logs printed in the console. The script will run until it reaches the top of the conversation.

## Configuration

The script's behavior can be customized by modifying the `CONFIG` object at the top of the file before execution.

- `DELETE_INTERVAL_MS`: The delay in milliseconds between each deletion attempt. (Default: `2000`)
- `MAX_RETRIES`: The maximum number of times to retry deleting a message if it fails. (Default: `3`)
- `SCROLL_AMOUNT`: The number of pixels to scroll up each time the script needs to load more messages. (Default: `300`)
- `CONTEXT_MENU_TIMEOUT_MS`: The maximum time to wait for the context menu (with the "Delete" option) to appear. (Default: `5000`)
- `SCROLL_CONTAINER_SELECTOR`: The CSS selector for the scrollable chat pane. **Warning:** Only change this if you are sure the selector has been updated by Microsoft.

## Troubleshooting

If the script stops working, it is most likely because Microsoft has updated the Teams web application, changing the CSS class names or HTML structure the script relies on. The selectors in the `CONFIG` object or within the code may need to be updated.
