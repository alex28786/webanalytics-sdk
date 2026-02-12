import { vi } from 'vitest';

/**
 * Creates a mock alloy function that simulates the integration behavior:
 * 1. Intercepts the 'sendEvent' command.
 * 2. Checks if window.s_onBeforeEventSendHook is defined.
 * 3. Uses the hook to transform the XDM and data objects.
 * 4. Storing the processed content in 'alloy.processedEvents' array for assertions.
 * 
 * @returns {Function} The mock alloy function
 */
export function createAlloyMock() {
    const mock = vi.fn((command, options) => {
        return new Promise((resolve) => {
            if (command === 'sendEvent') {
                let content = options || {};

                // Deep copy if we want to isolate from mutations if the test suite reuses objects, 
                // but usually the hook modifies the passed object. 
                // We'll capture the reference passed to the hook.

                if (typeof window.s_onBeforeEventSendHook === 'function') {
                    try {
                        const ctx = {
                            // Mock context
                        };
                        window.s_onBeforeEventSendHook(content, ctx);
                    } catch (e) {
                        console.error("Error in s_onBeforeEventSendHook:", e);
                    }
                }

                // Store the processed state
                mock.processedEvents.push(content);
            }
            resolve({});
        });
    });

    mock.processedEvents = [];
    mock.nextEventIndex = 0;
    return mock;
}
