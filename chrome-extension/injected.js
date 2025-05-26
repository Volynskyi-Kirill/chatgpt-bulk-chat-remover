(function () {
  'use strict';

  // Сохраняем оригинальную функцию fetch
  const originalFetch = window.fetch;

  // Переопределяем fetch для перехвата токена
  window.fetch = async function (resource, options) {
    // Проверяем наличие заголовка Authorization в запросе
    if (options && options.headers && options.headers.Authorization) {
      const authorizationHeader = options.headers.Authorization;
      const tokenMatch = authorizationHeader.match(/Bearer\s+(.+)/i);

      if (tokenMatch) {
        const extractedToken = tokenMatch[1];
        console.log(
          '🗝️ Токен перехвачен инъектированным скриптом:',
          extractedToken
        );

        // Отправляем токен в content script через postMessage
        window.postMessage(
          {
            type: 'GPT_TOKEN_CAPTURED',
            token: extractedToken,
          },
          '*'
        );
      }
    }

    // Выполняем оригинальный fetch запрос
    return originalFetch.call(this, resource, options);
  };

  console.log('🔧 Fetch перехватчик установлен');
})();
