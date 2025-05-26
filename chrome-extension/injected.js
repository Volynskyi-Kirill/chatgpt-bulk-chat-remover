(function () {
  'use strict';

  // Save original fetch function
  const originalFetch = window.fetch;

  // Override fetch to intercept token
  window.fetch = async function (resource, options) {
    // Check for Authorization header in request
    if (options && options.headers && options.headers.Authorization) {
      const authorizationHeader = options.headers.Authorization;
      const tokenMatch = authorizationHeader.match(/Bearer\s+(.+)/i);

      if (tokenMatch) {
        const extractedToken = tokenMatch[1];
        console.log('🗝️ Token captured by injected script:', extractedToken);

        // Send token to content script via postMessage
        window.postMessage(
          {
            type: 'GPT_TOKEN_CAPTURED',
            token: extractedToken,
          },
          '*'
        );
      }
    }

    // Execute original fetch request
    return originalFetch.call(this, resource, options);
  };

  console.log('🔧 Fetch interceptor installed');
})();
