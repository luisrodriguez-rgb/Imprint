import { defineContentScript } from 'wxt/utils/define-content-script';
import { ChatGPTAdapter } from '@imprint/provider-adapters';

export default defineContentScript({
  matches: ['*://chatgpt.com/*', '*://chat.openai.com/*'],
  runAt: 'document_idle',
  main() {
    const adapter = new ChatGPTAdapter();
    let sessionId = getSessionIdFromUrl();
    let lastProcessedTurnCount = 0;
    let isObserving = false;
    let interactionStartTime = 0;

    function getSessionIdFromUrl(): string {
      const match = window.location.pathname.match(/\/c\/([a-zA-Z0-9-]+)/);
      return match ? match[1] : `session-${Date.now()}`;
    }

    // Monitor assistant turns and completion
    function setupMutationObserver() {
      if (isObserving) return;
      isObserving = true;

      const observer = new MutationObserver(() => {
        const turns = document.querySelectorAll(ChatGPTAdapter.SELECTORS.turn);
        const stopButton = document.querySelector(ChatGPTAdapter.SELECTORS.stopButton);

        // When streaming starts
        if (stopButton && interactionStartTime === 0) {
          interactionStartTime = Date.now();
        }

        // When streaming completes (stopButton disappears and turns increased)
        if (!stopButton && turns.length > lastProcessedTurnCount) {
          const currentCount = turns.length;
          const lastTurn = turns[currentCount - 1];

          // Check if last turn is an assistant response
          const assistantBubble = lastTurn.querySelector(
            ChatGPTAdapter.SELECTORS.assistantMessage
          );

          if (assistantBubble) {
            const assistantText = assistantBubble.textContent || '';
            const outputCharCount = assistantText.length;
            const outputWordCount = assistantText.split(/\s+/).filter(Boolean).length;

            // Get user turn preceding this
            let inputCharCount = 150; // Fallback estimate
            let inputWordCount = 25;

            if (currentCount >= 2) {
              const prevUserTurn = turns[currentCount - 2].querySelector(
                ChatGPTAdapter.SELECTORS.userMessage
              );
              if (prevUserTurn && prevUserTurn.textContent) {
                const userText = prevUserTurn.textContent;
                inputCharCount = userText.length;
                inputWordCount = userText.split(/\s+/).filter(Boolean).length;
              }
            }

            const modelInfo = adapter.detectModel(document);
            const durationMs =
              interactionStartTime > 0 ? Date.now() - interactionStartTime : 2500;

            // Reset start time and update index
            interactionStartTime = 0;
            lastProcessedTurnCount = currentCount;
            const interactionIndex = Math.floor(currentCount / 2);

            // Send strictly privacy-safe stats to background worker (NO TEXT STORED)
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
              chrome.runtime.sendMessage({
                type: 'RECORD_INTERACTION',
                payload: {
                  sessionId,
                  provider: 'chatgpt',
                  modelRaw: modelInfo.raw,
                  modelFamily: modelInfo.family,
                  interactionIndex,
                  inputCharCount,
                  inputWordCount,
                  outputCharCount,
                  outputWordCount,
                  reasoningTokens: modelInfo.isReasoningModel ? 800 : 0,
                  durationMs,
                },
              });
            }
          }
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    // Initial setup
    setupMutationObserver();

    // Listen for SPA URL changes
    window.addEventListener('popstate', () => {
      sessionId = getSessionIdFromUrl();
      lastProcessedTurnCount = 0;
    });
  },
});
