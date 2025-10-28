chrome.runtime.onInstalled.addListener(() => {
  console.log('Filtros - YouTube Video Filter instalado com sucesso!');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'exportCSV') {
    const csvContent = request.data;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    chrome.downloads.download({
      url: url,
      filename: `youtube_filtros_${new Date().toISOString().split('T')[0]}.csv`,
      saveAs: true
    });
    
    sendResponse({ success: true });
  }
  return true;
});
