document.getElementById('togglePanel').addEventListener('click', async () => {
  const statusDiv = document.getElementById('status');
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('youtube.com')) {
      statusDiv.textContent = '⚠️ Por favor, abra uma página do YouTube primeiro';
      statusDiv.style.color = '#ff9800';
      return;
    }
    
    await chrome.tabs.sendMessage(tab.id, { action: 'togglePanel' });
    statusDiv.textContent = '✓ Painel ativado!';
    statusDiv.style.color = '#4caf50';
    
    setTimeout(() => {
      window.close();
    }, 1000);
  } catch (error) {
    statusDiv.textContent = '❌ Erro: Recarregue a página do YouTube';
    statusDiv.style.color = '#f44336';
    console.error('Error:', error);
  }
});

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  const statusDiv = document.getElementById('status');
  if (tab && tab.url.includes('youtube.com')) {
    statusDiv.textContent = '✓ Pronto para usar no YouTube';
    statusDiv.style.color = '#4caf50';
  } else {
    statusDiv.textContent = 'ℹ️ Navegue para o YouTube';
    statusDiv.style.color = '#9e9e9e';
  }
});

document.getElementById('settingsLink').addEventListener('click', function(e) {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});
