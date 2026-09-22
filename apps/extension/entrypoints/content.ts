import { defineContentScript } from 'wxt/utils/define-content-script';
import {
  getAdapterForUrl,
  ChatGPTAdapter,
  ClaudeAdapter,
  GeminiAdapter,
  GrokAdapter,
} from '@imprint/provider-adapters';

export default defineContentScript({
  matches: [
    '*://chatgpt.com/*',
    '*://chat.openai.com/*',
    '*://claude.ai/*',
    '*://gemini.google.com/*',
    '*://grok.com/*',
    '*://x.ai/*',
  ],
  runAt: 'document_idle',
  main() {
    const adapter = getAdapterForUrl(window.location.href);
    if (!adapter) return;
    const activeAdapter = adapter;

    let sessionId = getSessionIdFromUrl(activeAdapter.id);
    let lastProcessedTurnCount = 0;
    let isObserving = false;
    let interactionStartTime = 0;

    function getSessionIdFromUrl(provider: string): string {
      const path = window.location.pathname;
      const match = path.match(/\/(?:c|chat|app)\/([a-zA-Z0-9-]+)/);
      return match ? `${provider}-${match[1]}` : `${provider}-session-${Date.now()}`;
    }

    function getSelectorsForProvider(providerId: string) {
      switch (providerId) {
        case 'claude':
          return ClaudeAdapter.SELECTORS;
        case 'gemini':
          return GeminiAdapter.SELECTORS;
        case 'grok':
          return GrokAdapter.SELECTORS;
        case 'chatgpt':
        default:
          return ChatGPTAdapter.SELECTORS;
      }
    }

    const selectors = getSelectorsForProvider(adapter.id);

    function setupMutationObserver() {
      if (isObserving) return;
      isObserving = true;

      const observer = new MutationObserver(() => {
        const turnSelector = 'turnContainer' in selectors ? (selectors as any).turnContainer : (selectors as any).turn;
        const turns = document.querySelectorAll(turnSelector);
        const stopButton = selectors.stopButton ? document.querySelector(selectors.stopButton) : null;

        // When streaming starts
        if (stopButton && interactionStartTime === 0) {
          interactionStartTime = Date.now();
        }

        // When streaming completes
        if (!stopButton && turns.length > lastProcessedTurnCount) {
          const currentCount = turns.length;
          const lastTurn = turns[currentCount - 1];

          // Check if last turn is an assistant response
          const assistantBubble = lastTurn.querySelector(selectors.assistantMessage) || lastTurn;

          if (assistantBubble) {
            const assistantText = assistantBubble.textContent || '';
            const outputCharCount = assistantText.length;
            const outputWordCount = assistantText.split(/\s+/).filter(Boolean).length;

            // Get user turn preceding this
            let inputCharCount = 140;
            let inputWordCount = 22;

            if (currentCount >= 2) {
              const prevUserTurn = turns[currentCount - 2].querySelector(selectors.userMessage);
              if (prevUserTurn && prevUserTurn.textContent) {
                const userText = prevUserTurn.textContent;
                inputCharCount = userText.length;
                inputWordCount = userText.split(/\s+/).filter(Boolean).length;
              }
            }

            const modelInfo = activeAdapter.detectModel(document);
            const durationMs = interactionStartTime > 0 ? Date.now() - interactionStartTime : 2200;

            interactionStartTime = 0;
            lastProcessedTurnCount = currentCount;
            const interactionIndex = Math.max(1, Math.floor(currentCount / 2));

            // Send strictly privacy-preserving telemetry to background (ZERO PROMPT TEXT)
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
              chrome.runtime.sendMessage({
                type: 'RECORD_INTERACTION',
                payload: {
                  sessionId,
                  provider: activeAdapter.id,
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

    setupMutationObserver();

    window.addEventListener('popstate', () => {
      sessionId = getSessionIdFromUrl(adapter.id);
      lastProcessedTurnCount = 0;
    });
  },
});
