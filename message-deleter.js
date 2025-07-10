(function () {
  "use strict";
  
  // ================================
  // CONFIGURATION
  // ================================
  const CONFIG = {
    DELETE_INTERVAL_MS: 2000,      // Delay between deletions
    MAX_RETRIES: 3,                // Maximum retries for failed messages
    SCROLL_AMOUNT: 300,            // How much to scroll each time
    CONTEXT_MENU_TIMEOUT_MS: 5000, // How long to wait for context menu
    SCROLL_CONTAINER_SELECTOR: "div.fui-Primitive.f1yrx710.f1l02sjl"
  };

  // ================================
  // STATE MANAGEMENT
  // ================================
  const state = {
    processedMessages: new Set(),  // Tracks all processed message IDs
    queue: [],                     // Messages waiting to be processed
    retryMap: new Map(),          // Tracks retries for message processing
    isProcessing: false,          // Is currently processing messages
    totalProcessed: 0,            // Total messages processed
    totalDeleted: 0               // Total messages successfully deleted
  };

  // ================================
  // VISUAL FEEDBACK STYLES
  // ================================
  const STYLES = {
    PROCESSING: "4px solid #007acc",      // Blue - currently processing
    DELETED: "4px solid #28a745",         // Green - successfully deleted
    FAILED: "4px dashed #dc3545",         // Red dashed - permanently failed
    RETRY: "4px solid #ffc107",           // Yellow - will retry
    SKIPPED: "4px solid #6c757d",         // Gray - skipped (not mine)
    ALREADY_DELETED: "4px solid #fd7e14"  // Orange - already deleted
  };

  console.log("[Teams Delete Script] Starting enhanced version...");
  console.log("Configuration:", CONFIG);

  // ================================
  // UTILITY FUNCTIONS
  // ================================
  
  /**
   * Simulate mouse events with better error handling
   * @param {string} eventType - Type of mouse event
   * @param {Element} element - Target element
   * @returns {boolean} - Whether event was dispatched successfully
   */
  const simulateMouseEvent = (eventType, element) => {
    if (!element) {
      throw new Error(`Cannot simulate ${eventType} on null element`);
    }
    const event = new MouseEvent(eventType, {
      view: window,
      bubbles: true,
      cancelable: true,
      buttons: 1,
    });
    return element.dispatchEvent(event);
  };

  /**
   * Apply visual feedback to message element
   * @param {Element} element - Message element
   * @param {string} status - Status type (PROCESSING, DELETED, etc.)
   * @param {string} [message] - Optional message for logging
   */
  const applyVisualFeedback = (element, status, message = '') => {
    if (!element) return;
    
    element.style.outline = STYLES[status] || STYLES.PROCESSING;
    element.style.transition = 'outline 0.3s ease';
    
    // Add animation for processing state
    if (status === 'PROCESSING') {
      element.style.animation = 'pulse 1s ease-in-out infinite alternate';
      // Add CSS animation if not already present
      if (!document.getElementById('teams-delete-styles')) {
        const style = document.createElement('style');
        style.id = 'teams-delete-styles';
        style.textContent = `
          @keyframes pulse {
            0% { outline-color: #007acc; }
            100% { outline-color: #005a9e; }
          }
        `;
        document.head.appendChild(style);
      }
    } else {
      element.style.animation = '';
    }
    
    if (message) {
      console.log(`[Visual Feedback] ${message}`);
    }
  };

  /**
   * Scroll up to load more messages
   */
  const scrollToLoadMessages = () => {
    const scrollContainer = document.querySelector(CONFIG.SCROLL_CONTAINER_SELECTOR);
    if (scrollContainer) {
      const beforeScrollTop = scrollContainer.scrollTop;
      scrollContainer.scrollBy({ top: -CONFIG.SCROLL_AMOUNT, behavior: "auto" });
      console.log("[Scroll] Scrolled up to load more messages");
      
      // Check if we're at the top
      setTimeout(() => {
        if (scrollContainer.scrollTop === 0 && beforeScrollTop === 0) {
          console.log("[Scroll] Reached top of conversation");
        }
      }, 100);
    } else {
      console.warn("[Scroll] Warning: Scroll container not found");
    }
  };

  // ================================
  // CORE PROCESSING FUNCTIONS
  // ================================
  
  /**
   * Process a single message with enhanced visual feedback
   * @param {Element} messageElement - The message element to process
   */
  const processMessage = async (messageElement) => {
    if (!messageElement) return;

    const messageId = messageElement.getAttribute("data-mid");
    if (!messageId) {
      console.warn("[Process] Warning: Message element missing data-mid attribute");
      return;
    }

    // Skip already-processed messages
    if (state.processedMessages.has(messageId)) {
      console.log(`[Process] Skipping already-processed message ID: ${messageId}`);
      return;
    }

    state.totalProcessed++;

    try {
      // Apply processing visual feedback
      applyVisualFeedback(messageElement, 'PROCESSING');

      const contentElement = messageElement.querySelector("p");
      const content = contentElement ? contentElement.textContent.trim().substring(0, 50) : "(No Content)";
      const isMine = Array.from(messageElement.classList).some((cls) => cls.includes("ChatMyMessage"));

      console.log(`[Process] Processing message ${state.totalProcessed}: "${content}${content.length > 50 ? '...' : ''}" | Mine: ${isMine}`);

      // Skip if not my message
      if (!isMine) {
        console.log(`[Process] Skipping message ID: ${messageId} (not mine)`);
        state.processedMessages.add(messageId);
        applyVisualFeedback(messageElement, 'SKIPPED', `Skipped (not mine): ${content.substring(0, 20)}...`);
        return;
      }

      // Check if already deleted
      const undoButton = messageElement.querySelector("[data-tid=message-undo-delete-btn]");
      if (undoButton) {
        console.log(`[Process] Message ID: ${messageId} already deleted (Undo button detected)`);
        state.processedMessages.add(messageId);
        applyVisualFeedback(messageElement, 'ALREADY_DELETED', `Already deleted: ${content.substring(0, 20)}...`);
        return;
      }

      // Find message content element
      const messageContentElement = document.querySelector(`#content-${messageId}`);
      if (!messageContentElement) {
        throw new Error(`Content element not found for message ID: ${messageId}`);
      }

      // Right-click to open context menu
      simulateMouseEvent("contextmenu", messageContentElement);

      // Wait for delete option
      const deleteOption = await new Promise((resolve, reject) => {
        const startTime = Date.now();
        const interval = setInterval(() => {
          if (Date.now() - startTime > CONFIG.CONTEXT_MENU_TIMEOUT_MS) {
            clearInterval(interval);
            reject(new Error("Delete option timeout"));
            return;
          }
          
          // Look for delete option with multiple strategies
          const deleteElements = Array.from(document.querySelectorAll("div, span")).filter(
            el => el.textContent && el.textContent.trim().toLowerCase().includes("delete")
          );
          
          const deleteOption = deleteElements.find(el => {
            const text = el.textContent.trim().toLowerCase();
            return text === "delete" || text === "delete message";
          });
          
          if (deleteOption) {
            clearInterval(interval);
            resolve(deleteOption);
          }
        }, 100);
      });

      // Click delete option
      simulateMouseEvent("click", deleteOption);
      console.log(`[Process] Successfully deleted message ID: ${messageId}`);
      state.processedMessages.add(messageId);
      state.totalDeleted++;

      // Apply success visual feedback
      applyVisualFeedback(messageElement, 'DELETED', `Deleted: ${content.substring(0, 20)}...`);

    } catch (error) {
      console.error(`[Process] Error processing message ID: ${messageId} -`, error.message);

      // Retry logic
      const retries = state.retryMap.get(messageId) || 0;
      if (retries < CONFIG.MAX_RETRIES) {
        console.log(`[Process] Retrying message ID: ${messageId} (Attempt ${retries + 1}/${CONFIG.MAX_RETRIES})`);
        state.retryMap.set(messageId, retries + 1);
        state.queue.push(messageElement);
        
        // Apply retry visual feedback
        applyVisualFeedback(messageElement, 'RETRY', `Retry ${retries + 1}/${CONFIG.MAX_RETRIES}: ${messageId}`);
      } else {
        console.warn(`[Process] Warning: Permanently failed message ID: ${messageId} after ${CONFIG.MAX_RETRIES} retries`);
        state.retryMap.delete(messageId);
        state.processedMessages.add(messageId);
        
        // Apply permanent failure visual feedback
        applyVisualFeedback(messageElement, 'FAILED', `Failed permanently: ${messageId}`);
      }
    }

    // Log progress every 10 messages
    if (state.totalProcessed % 10 === 0) {
      console.log(`[Progress] ${state.totalProcessed} processed | ${state.totalDeleted} deleted | ${state.queue.length} queued`);
    }

    await new Promise((resolve) => setTimeout(resolve, CONFIG.DELETE_INTERVAL_MS));
  };

  /**
   * Process the message queue
   */
  const processQueue = async () => {
    if (state.isProcessing) return;
    state.isProcessing = true;

    try {
      while (state.queue.length > 0) {
        const messageElement = state.queue.shift();
        await processMessage(messageElement);
      }

      console.log("[Queue] Queue empty - scrolling to load more messages...");
      scrollToLoadMessages();
      scanMessages();
    } catch (error) {
      console.error("[Queue] Error in processQueue:", error);
    } finally {
      state.isProcessing = false;
    }
  };

  /**
   * Scan for new messages and add to queue
   */
  const scanMessages = () => {
    const newMessages = Array.from(document.querySelectorAll("div[data-mid]"))
      .reverse()
      .filter((msg) => {
        const messageId = msg.getAttribute("data-mid");
        return messageId && !state.queue.includes(msg) && !state.processedMessages.has(messageId);
      });

    if (newMessages.length > 0) {
      console.log(`[Scan] Found ${newMessages.length} new messages to process`);
      state.queue.push(...newMessages);
    }
  };

  // ================================
  // INITIALIZATION
  // ================================
  
  /**
   * Start the script with enhanced initialization
   */
  const startScript = () => {
    console.log("[Init] Starting Teams message deletion script...");
    
    // Set up DOM observer for new messages
    const observer = new MutationObserver(() => {
      scanMessages();
      if (!state.isProcessing) processQueue();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Initial scan and processing
    scanMessages();
    processQueue();

    // Set up periodic scroll check
    setInterval(() => {
      if (state.queue.length === 0 && !state.isProcessing) {
        console.log("[Timer] Auto-scroll check - loading more messages...");
        scrollToLoadMessages();
      }
    }, 100);

    console.log("[Init] Script initialized successfully!");
    console.log(`[Init] Settings: ${CONFIG.DELETE_INTERVAL_MS}ms delay | ${CONFIG.MAX_RETRIES} max retries`);
    console.log("[Init] Visual feedback: Processing=Blue | Deleted=Green | Failed=Red | Retry=Yellow | Skipped=Gray");
  };

  // Start the script
  startScript();

})();
