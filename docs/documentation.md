# Teams Message Deletion Script

## 1. Introduction

This document provides a technical explanation of the **Teams Message Deletion Script**. The script is a client-side JavaScript application designed to run in a browser's developer console. Its primary function is to automate the deletion of a user's messages within a Microsoft Teams chat interface by programmatically simulating user interactions.

The architecture is **event-driven** and **asynchronous**, built to be resilient to the timing inconsistencies of a complex web application like Microsoft Teams.

---

## 2. Core Components

The script is encapsulated within an **Immediately Invoked Function Expression (IIFE)**:  
```js
(function () { ... })();
```
This prevents polluting the global namespace of the Teams application.

### 2.1. Configuration (`CONFIG`)

A constant object that centralizes all user-configurable parameters. This design separates configuration from logic.

- **`DELETE_INTERVAL_MS`**: Delay between `processMessage` calls to prevent rapid-fire requests and allow the UI to update.
- **`MAX_RETRIES`**: Number of attempts allowed before a message is considered failed.
- **`SCROLL_CONTAINER_SELECTOR`**: CSS selector that identifies the main chat pane for scrolling and loading older messages.

### 2.2. State Management (`state`)

A single object that holds the script's state:

- **`processedMessages`** (`Set`): Tracks message `data-mid`s that are fully processed.
- **`queue`** (`Array`): FIFO queue of message DOM elements awaiting processing.
- **`retryMap`** (`Map`): Tracks retries per message ID.
- **`isProcessing`** (`Boolean`): Prevents concurrent executions of `processQueue`.
- **`totalProcessed`**, **`totalDeleted`** (`Number`): Logging and progress tracking counters.

### 2.3. Utility Functions

- **`simulateMouseEvent(eventType, element)`**: Dispatches synthetic mouse events like right-clicks and clicks.
- **`applyVisualFeedback(element, status)`**: Sets a CSS outline to communicate message status visually.
- **`scrollToLoadMessages()`**: Scrolls the chat container to trigger Teams' lazy-loading behavior.

---

## 3. Execution Flow

### 3.1. Initialization (`startScript`)

- Logs startup and config info.
- Sets up a `MutationObserver` on `document.body` to detect new messages.
- Observer triggers `scanMessages()` and `processQueue()` when changes are detected.
- Calls `scanMessages()` and `processQueue()` initially to start the process.
- A `setInterval` fallback scrolls periodically if no DOM mutations are detected.

### 3.2. Scanning and Queuing (`scanMessages`)

- Queries DOM for elements with `data-mid` attribute.
- Reverses array to process oldest messages first.
- Filters out messages already processed or queued.
- Pushes valid messages to `state.queue`.

### 3.3. Core Processing (`processQueue` and `processMessage`)

#### `processQueue()`

- Runs a `while` loop as long as there are messages in the queue.
- Retrieves and processes the next message via `queue.shift()` and `processMessage`.
- Uses `isProcessing` flag to prevent concurrent executions.
- Triggers `scrollToLoadMessages()` once the queue is empty.

#### `processMessage(messageElement)`

- **Guards**: Skips elements without `data-mid` or already processed.
- **Ownership Check**: Confirms message belongs to the user via class name (e.g., `"ChatMyMessage"`).
- **Right-Click Simulation**: Simulates a context menu (`contextmenu`) event.
- **Find Delete Option**:
  - Polls the DOM in a `Promise` loop for the "Delete" option.
  - Times out after `CONTEXT_MENU_TIMEOUT_MS` if not found.
- **Click Simulation**: Clicks the "Delete" option once found.
- **Success**:
  - Adds message ID to `processedMessages`.
  - Increments `totalDeleted`.
  - Applies `'DELETED'` visual feedback.
- **Error Handling**:
  - Catches errors, checks retry count.
  - Requeues if under `MAX_RETRIES`; else marks as `'FAILED'`.

---

## 4. Asynchronous Operations and DOM Interaction

The script's resilience relies on robust handling of asynchronous and dynamic DOM interactions.

- **`async/await`**: Makes `processMessage` and delays readable and linear.
- **`Promise`**: Used in polling logic for finding the "Delete" option, with timeout handling.
- **`MutationObserver`**: Efficiently detects DOM changes without polling.

