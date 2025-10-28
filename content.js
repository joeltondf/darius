let panelVisible = false;
let allVideos = [];
let filteredVideos = [];
let filters = {
  viewsMin: 0,
  viewsMax: 10000000,
  subsMin: 0,
  subsMax: 10000000,
  durationMin: 0,
  durationMax: 180,
  vphMin: 0,
  vphMax: 1000,
  publishDate: 'all',
  showVideos: true,
  showShorts: false,
  showLive: false,
  sortBy: 'views'
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'togglePanel') {
    togglePanel();
    sendResponse({ success: true });
  }
  return true;
});

function togglePanel() {
  if (panelVisible) {
    closePanel();
  } else {
    openPanel();
  }
}

function openPanel() {
  if (document.getElementById('filtros-panel-container')) {
    return;
  }

  const container = document.createElement('div');
  container.id = 'filtros-panel-container';
  
  fetch(chrome.runtime.getURL('panel.html'))
    .then(response => response.text())
    .then(html => {
      container.innerHTML = html;
      document.body.appendChild(container);
      panelVisible = true;
      initializePanel();
      captureVideos();
    });
}

function closePanel() {
  const container = document.getElementById('filtros-panel-container');
  if (container) {
    container.remove();
    panelVisible = false;
  }
}

function initializePanel() {
  document.getElementById('closePanel').addEventListener('click', closePanel);
  document.getElementById('loadMoreBtn').addEventListener('click', loadMoreVideos);
  document.getElementById('exportCsvBtn').addEventListener('click', exportToCSV);
  document.getElementById('resetFilters').addEventListener('click', resetFilters);
  
  document.getElementById('filterVideos').addEventListener('change', (e) => {
    filters.showVideos = e.target.checked;
    applyFilters();
  });
  
  document.getElementById('filterShorts').addEventListener('change', (e) => {
    filters.showShorts = e.target.checked;
    applyFilters();
  });
  
  document.getElementById('filterLive').addEventListener('change', (e) => {
    filters.showLive = e.target.checked;
    applyFilters();
  });
  
  document.getElementById('sortBy').addEventListener('change', (e) => {
    filters.sortBy = e.target.value;
    applyFilters();
  });
  
  document.getElementById('publishDateFilter').addEventListener('change', (e) => {
    filters.publishDate = e.target.value;
    applyFilters();
  });
  
  setupSlider('views', 0, 10000000);
  setupSlider('subs', 0, 10000000);
  setupSlider('duration', 0, 180);
  setupSlider('vph', 0, 1000);
}

function setupSlider(name, min, max) {
  const minSlider = document.getElementById(`${name}Min`);
  const maxSlider = document.getElementById(`${name}Max`);
  const minVal = document.getElementById(`${name}MinVal`);
  const maxVal = document.getElementById(`${name}MaxVal`);
  
  const updateValues = () => {
    const minValue = parseInt(minSlider.value);
    const maxValue = parseInt(maxSlider.value);
    
    if (minValue > maxValue) {
      minSlider.value = maxValue;
    }
    if (maxValue < minValue) {
      maxSlider.value = minValue;
    }
    
    filters[`${name}Min`] = parseInt(minSlider.value);
    filters[`${name}Max`] = parseInt(maxSlider.value);
    
    minVal.textContent = formatValue(filters[`${name}Min`], name);
    maxVal.textContent = formatValue(filters[`${name}Max`], name, true);
    
    applyFilters();
  };
  
  minSlider.addEventListener('input', updateValues);
  maxSlider.addEventListener('input', updateValues);
}

function formatValue(value, type, isMax = false) {
  if (type === 'views' || type === 'subs') {
    if (isMax && value >= 10000000) return '10M+';
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
    if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
    return value.toString();
  }
  
  if (type === 'duration') {
    if (isMax && value >= 180) return '180+';
    const hours = Math.floor(value / 60);
    const mins = value % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}`;
    }
    return `${mins}:00`;
  }
  
  if (type === 'vph') {
    if (isMax && value >= 1000) return '1000+';
    return value.toString();
  }
  
  return value.toString();
}

async function captureVideos() {
  allVideos = [];
  
  const videoElements = document.querySelectorAll('ytd-video-renderer, ytd-grid-video-renderer, ytd-rich-item-renderer');
  
  const videoDataPromises = [];
  
  videoElements.forEach(element => {
    const video = extractVideoData(element);
    if (video) {
      allVideos.push(video);
      
      if (video.channelUrl && video.subscribers === null) {
        videoDataPromises.push(
          fetchSubscriberCount(video.channelUrl).then(subs => {
            video.subscribers = subs;
          })
        );
      }
    }
  });
  
  console.log(`Captured ${allVideos.length} videos`);
  applyFilters();
  
  if (videoDataPromises.length > 0) {
    await Promise.all(videoDataPromises);
    console.log(`Updated subscriber counts for ${videoDataPromises.length} channels`);
    applyFilters();
  }
}

function extractVideoData(element) {
  try {
    const titleElement = element.querySelector('#video-title');
    const thumbnailElement = element.querySelector('img');
    const metadataElement = element.querySelector('#metadata-line');
    
    if (!titleElement) return null;
    
    const title = titleElement.textContent.trim();
    const url = titleElement.href;
    const thumbnail = thumbnailElement?.src || '';
    
    const viewsText = metadataElement?.querySelector('span:first-child')?.textContent || '0';
    const views = parseViews(viewsText);
    
    const publishDateText = metadataElement?.querySelector('span:last-child')?.textContent || '';
    const publishDate = parsePublishDate(publishDateText);
    
    const durationElement = element.querySelector('ytd-thumbnail-overlay-time-status-renderer span');
    const duration = parseDuration(durationElement?.textContent || '0:00');
    
    const channelElement = element.querySelector('ytd-channel-name a, #channel-name a');
    const channelName = channelElement?.textContent.trim() || 'Unknown';
    const channelUrl = channelElement?.href || '';
    
    const channelAvatarElement = element.querySelector('#avatar img, ytd-channel-thumbnail img');
    const channelAvatar = channelAvatarElement?.src || '';
    
    const subscribers = extractSubscribers(element);
    
    const hoursAgo = (Date.now() - publishDate) / (1000 * 60 * 60);
    const vph = hoursAgo > 0 ? Math.round(views / hoursAgo) : 0;
    
    const type = determineVideoType(duration, url, element);
    
    return {
      title,
      url,
      thumbnail,
      views,
      publishDate,
      publishDateText,
      duration,
      channelName,
      channelUrl,
      channelAvatar,
      subscribers,
      vph,
      type
    };
  } catch (error) {
    console.error('Error extracting video data:', error);
    return null;
  }
}

function parseViews(viewsText) {
  const match = viewsText.match(/[\d,.]+/);
  if (!match) return 0;
  
  let num = match[0].replace(/[,.]/g, '');
  
  if (viewsText.includes('mi') || viewsText.includes('M')) {
    return parseFloat(num) * 1000000;
  }
  if (viewsText.includes('mil') || viewsText.includes('K')) {
    return parseFloat(num) * 1000;
  }
  
  return parseInt(num) || 0;
}

function parsePublishDate(dateText) {
  const now = Date.now();
  
  const match = dateText.match(/(\d+)\s*(segundo|minuto|hora|dia|semana|mês|ano|second|minute|hour|day|week|month|year)/i);
  if (!match) return now;
  
  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  
  const multipliers = {
    'segundo': 1000,
    'second': 1000,
    'minuto': 60 * 1000,
    'minute': 60 * 1000,
    'hora': 60 * 60 * 1000,
    'hour': 60 * 60 * 1000,
    'dia': 24 * 60 * 60 * 1000,
    'day': 24 * 60 * 60 * 1000,
    'semana': 7 * 24 * 60 * 60 * 1000,
    'week': 7 * 24 * 60 * 60 * 1000,
    'mês': 30 * 24 * 60 * 60 * 1000,
    'month': 30 * 24 * 60 * 60 * 1000,
    'ano': 365 * 24 * 60 * 60 * 1000,
    'year': 365 * 24 * 60 * 60 * 1000
  };
  
  const multiplier = multipliers[unit] || 0;
  return now - (value * multiplier);
}

function parseDuration(durationText) {
  const parts = durationText.trim().split(':').map(p => parseInt(p) || 0);
  
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else {
    return parts[0] || 0;
  }
}

function determineVideoType(durationSeconds, url, element) {
  if (element) {
    const liveBadge = element.querySelector('.badge-style-type-live-now, ytd-badge-supported-renderer[aria-label*="LIVE"], [overlay-style="LIVE"]');
    if (liveBadge) return 'live';
  }
  
  if (url && url.includes('/shorts/')) return 'short';
  if (durationSeconds < 60) return 'short';
  return 'video';
}

const subscriberCache = new Map();

async function fetchSubscriberCount(channelUrl) {
  if (!channelUrl) return null;
  
  if (subscriberCache.has(channelUrl)) {
    return subscriberCache.get(channelUrl);
  }
  
  try {
    const response = await fetch(channelUrl);
    const html = await response.text();
    
    const patterns = [
      /"subscriberCountText":\s*\{"simpleText":\s*"([^"]+)"\}/,
      /"subscriberCountText":\s*\{"accessibility":\s*\{[^}]+\},\s*"simpleText":\s*"([^"]+)"\}/,
      /(\d+[.,]?\d*)\s*(K|M|mil|milhões?|mi)\s*(de\s*)?(inscritos?|subscribers?|assinantes?)/i
    ];
    
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const subText = match[1];
        const numMatch = subText.match(/(\d+[.,]?\d*)\s*(K|M|mil|mi)?/i);
        
        if (numMatch) {
          let num = parseFloat(numMatch[1].replace(',', '.'));
          const multiplier = numMatch[2];
          
          if (multiplier) {
            if (multiplier.match(/M|mi/i)) {
              num *= 1000000;
            } else if (multiplier.match(/K|mil/i)) {
              num *= 1000;
            }
          }
          
          const result = Math.floor(num);
          subscriberCache.set(channelUrl, result);
          return result;
        }
      }
    }
  } catch (error) {
    console.log('Could not fetch subscriber count:', error);
  }
  
  subscriberCache.set(channelUrl, null);
  return null;
}

function extractSubscribers(element) {
  try {
    const subSelectors = [
      '#owner-sub-count',
      'ytd-video-owner-renderer #owner-sub-count',
      '#subscriber-count',
      'yt-formatted-string#subscriber-count',
      '.ytd-channel-renderer #subscriber-count',
      'ytd-subscribe-button-renderer #owner-sub-count'
    ];
    
    for (const selector of subSelectors) {
      const subElement = element.querySelector(selector);
      if (subElement && subElement.textContent.trim()) {
        const result = parseSubscriberText(subElement.textContent.trim());
        if (result !== null) return result;
      }
    }
    
    const metadataText = element.querySelector('#metadata')?.textContent || '';
    const ownerText = element.querySelector('#owner-text, ytd-channel-name')?.textContent || '';
    const videoOwner = element.querySelector('ytd-video-owner-renderer')?.textContent || '';
    const combinedText = metadataText + ' ' + ownerText + ' ' + videoOwner;
    
    const patterns = [
      /(\d+[.,]?\d*)\s*(mil|K)\s*(de\s*)?(inscritos?|assinantes?)/i,
      /(\d+[.,]?\d*)\s*(mi|M|milhões?)\s*(de\s*)?(inscritos?|assinantes?)/i,
      /(\d+[.,]?\d*)\s*(mil|K)\s*subscribers?/i,
      /(\d+[.,]?\d*)\s*(mi|M)\s*subscribers?/i
    ];
    
    for (const pattern of patterns) {
      const match = combinedText.match(pattern);
      if (match) {
        let num = parseFloat(match[1].replace(',', '.'));
        const multiplier = match[2];
        
        if (multiplier && multiplier.match(/M|mi|milhões?/i)) {
          num *= 1000000;
        } else if (multiplier && multiplier.match(/K|mil/i)) {
          num *= 1000;
        }
        
        return Math.floor(num);
      }
    }
  } catch (error) {
    console.log('Could not extract subscriber count:', error);
  }
  
  return null;
}

function parseSubscriberText(text) {
  const match = text.match(/(\d+[.,]?\d*)\s*(K|M|mil|mi|milhões?)?/i);
  if (!match) return null;
  
  let num = parseFloat(match[1].replace(',', '.'));
  const multiplier = match[2];
  
  if (multiplier) {
    if (multiplier.match(/M|mi|milhões?/i)) {
      num *= 1000000;
    } else if (multiplier.match(/K|mil/i)) {
      num *= 1000;
    }
  }
  
  return Math.floor(num);
}

function applyFilters() {
  filteredVideos = allVideos.filter(video => {
    if (filters.showVideos && video.type === 'video') return true;
    if (filters.showShorts && video.type === 'short') return true;
    if (filters.showLive && video.type === 'live') return true;
    return false;
  }).filter(video => {
    if (video.views < filters.viewsMin || video.views > filters.viewsMax) return false;
    
    if (video.subscribers !== null) {
      if (video.subscribers < filters.subsMin || video.subscribers > filters.subsMax) return false;
    }
    
    const durationMinutes = video.duration / 60;
    if (durationMinutes < filters.durationMin || durationMinutes > filters.durationMax) return false;
    
    if (video.vph < filters.vphMin || video.vph > filters.vphMax) return false;
    
    if (filters.publishDate !== 'all') {
      const now = Date.now();
      const diff = now - video.publishDate;
      const hoursDiff = diff / (1000 * 60 * 60);
      
      const limits = {
        '24h': 24,
        '7d': 24 * 7,
        '30d': 24 * 30,
        '3m': 24 * 30 * 3,
        '1y': 24 * 365
      };
      
      if (hoursDiff > limits[filters.publishDate]) return false;
    }
    
    return true;
  });
  
  sortVideos();
  renderVideos();
  updateStats();
}

function sortVideos() {
  filteredVideos.sort((a, b) => {
    switch (filters.sortBy) {
      case 'views':
        return b.views - a.views;
      case 'vph':
        return b.vph - a.vph;
      case 'duration':
        return b.duration - a.duration;
      case 'publishDate':
        return b.publishDate - a.publishDate;
      case 'subscribers':
        return b.subscribers - a.subscribers;
      default:
        return 0;
    }
  });
}

function renderVideos() {
  const videoList = document.getElementById('videoList');
  
  if (filteredVideos.length === 0) {
    videoList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <p>Nenhum vídeo encontrado com os filtros atuais.<br>Tente ajustar os filtros.</p>
      </div>
    `;
    return;
  }
  
  videoList.innerHTML = filteredVideos.map(video => `
    <div class="video-item" onclick="window.open('${video.url}', '_blank')">
      <div class="video-thumbnail">
        <img src="${video.thumbnail}" alt="${video.title}">
        <div class="video-duration">${formatDuration(video.duration)}</div>
      </div>
      <div class="video-info">
        <div class="video-title">${video.title}</div>
        <div class="video-stats">
          <span>👁️ ${formatNumber(video.views)}</span>
          <span>•</span>
          <span>${video.publishDateText}</span>
          <span class="stat-badge vph">⚡ ${formatNumber(video.vph)} VPH</span>
        </div>
        <div class="video-channel">
          <div class="channel-avatar">
            ${video.channelAvatar ? `<img src="${video.channelAvatar}" alt="${video.channelName}">` : ''}
          </div>
          <div class="channel-info">
            <div class="channel-name">${video.channelName}</div>
            <div class="channel-subs">${video.subscribers !== null ? formatNumber(video.subscribers) + ' assinantes' : 'Assinantes não disponíveis'}</div>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

function updateStats() {
  const statsElement = document.getElementById('videoCount');
  statsElement.textContent = `Mostrando ${filteredVideos.length} de ${allVideos.length} vídeos`;
}

function loadMoreVideos() {
  window.scrollBy({ top: 1000, behavior: 'smooth' });
  
  setTimeout(() => {
    captureVideos();
  }, 2000);
}

function exportToCSV() {
  const headers = ['Título', 'URL', 'Visualizações', 'Canal', 'Assinantes', 'Data Publicação', 'Duração', 'VPH'];
  const rows = filteredVideos.map(video => [
    `"${video.title.replace(/"/g, '""')}"`,
    video.url,
    video.views,
    `"${video.channelName.replace(/"/g, '""')}"`,
    video.subscribers !== null ? video.subscribers : 'N/A',
    video.publishDateText,
    formatDuration(video.duration),
    video.vph
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `youtube_filtros_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function resetFilters() {
  filters = {
    viewsMin: 0,
    viewsMax: 10000000,
    subsMin: 0,
    subsMax: 10000000,
    durationMin: 0,
    durationMax: 180,
    vphMin: 0,
    vphMax: 1000,
    publishDate: 'all',
    showVideos: true,
    showShorts: false,
    showLive: false,
    sortBy: 'views'
  };
  
  document.getElementById('viewsMin').value = 0;
  document.getElementById('viewsMax').value = 10000000;
  document.getElementById('subsMin').value = 0;
  document.getElementById('subsMax').value = 10000000;
  document.getElementById('durationMin').value = 0;
  document.getElementById('durationMax').value = 180;
  document.getElementById('vphMin').value = 0;
  document.getElementById('vphMax').value = 1000;
  document.getElementById('publishDateFilter').value = 'all';
  document.getElementById('filterVideos').checked = true;
  document.getElementById('filterShorts').checked = false;
  document.getElementById('filterLive').checked = false;
  document.getElementById('sortBy').value = 'views';
  
  document.getElementById('viewsMinVal').textContent = '0';
  document.getElementById('viewsMaxVal').textContent = '10M+';
  document.getElementById('subsMinVal').textContent = '0';
  document.getElementById('subsMaxVal').textContent = '10M+';
  document.getElementById('durationMinVal').textContent = '0:00';
  document.getElementById('durationMaxVal').textContent = '180+';
  document.getElementById('vphMinVal').textContent = '0';
  document.getElementById('vphMaxVal').textContent = '1000+';
  
  applyFilters();
}
