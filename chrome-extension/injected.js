(function () {
  'use strict';

  const originalFetch = window.fetch;

  window.fetch = async function (resource, options) {
    const isAuthorizationHeaderPresent =
      options && options.headers && options.headers.Authorization;

    if (isAuthorizationHeaderPresent) {
      const authorizationHeader = options.headers.Authorization;
      const tokenMatch = authorizationHeader.match(/Bearer\s+(.+)/i);

      if (tokenMatch) {
        const extractedToken = tokenMatch[1];

        window.postMessage(
          {
            type: 'GPT_TOKEN_CAPTURED',
            token: extractedToken,
          },
          '*'
        );
      }
    }

    return originalFetch.call(this, resource, options);
  };

  console.log('🔧 Fetch interceptor installed');
})();
