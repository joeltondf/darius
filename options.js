document.addEventListener('DOMContentLoaded', function() {
  const apiKeyInput = document.getElementById('apiKey');
  const saveBtn = document.getElementById('saveBtn');
  const clearBtn = document.getElementById('clearBtn');
  const status = document.getElementById('status');

  chrome.storage.sync.get(['youtubeApiKey'], function(result) {
    if (result.youtubeApiKey) {
      apiKeyInput.value = result.youtubeApiKey;
    }
  });

  saveBtn.addEventListener('click', function() {
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
      showStatus('Por favor, insira uma API key válida', 'error');
      return;
    }

    if (!apiKey.startsWith('AIza')) {
      showStatus('API key inválida. Deve começar com "AIza"', 'error');
      return;
    }

    chrome.storage.sync.set({ youtubeApiKey: apiKey }, function() {
      showStatus('✅ Configurações salvas com sucesso!', 'success');
      
      chrome.tabs.query({}, function(tabs) {
        tabs.forEach(tab => {
          if (tab.url && tab.url.includes('youtube.com')) {
            chrome.tabs.sendMessage(tab.id, { 
              action: 'updateApiKey', 
              apiKey: apiKey 
            }).catch(() => {});
          }
        });
      });
    });
  });

  clearBtn.addEventListener('click', function() {
    if (confirm('Tem certeza que deseja remover a API key?')) {
      chrome.storage.sync.remove('youtubeApiKey', function() {
        apiKeyInput.value = '';
        showStatus('API key removida', 'success');
        
        chrome.tabs.query({}, function(tabs) {
          tabs.forEach(tab => {
            if (tab.url && tab.url.includes('youtube.com')) {
              chrome.tabs.sendMessage(tab.id, { 
                action: 'updateApiKey', 
                apiKey: null 
              }).catch(() => {});
            }
          });
        });
      });
    }
  });

  function showStatus(message, type) {
    status.textContent = message;
    status.className = 'status ' + type + ' show';
    
    setTimeout(() => {
      status.classList.remove('show');
    }, 3000);
  }
});
