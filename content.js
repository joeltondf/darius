let panelVisible = false;
let allVideos = [];
let filteredVideos = [];
let filters = {
  viewsMin: 0,
  viewsMax: 100000000,
  subsMin: 0,
  subsMax: 100000000,
  durationMin: 0,
  durationMax: 180,
  vphMin: 0,
  vphMax: 1000,
  publishDate: 'all',
  hashtags: '',
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
  if (request.action === 'updateApiKey') {
    YOUTUBE_API_KEY = request.apiKey;
    subscriberCache.clear();
    console.log('API Key updated, cache cleared');
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

  const backdrop = document.createElement('div');
  backdrop.id = 'filtros-panel-backdrop';
  backdrop.addEventListener('click', closePanel);
  document.body.appendChild(backdrop);

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
  const backdrop = document.getElementById('filtros-panel-backdrop');
  
  if (container) {
    container.remove();
  }
  if (backdrop) {
    backdrop.remove();
  }
  
  panelVisible = false;
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
  
  document.getElementById('hashtagFilter').addEventListener('input', (e) => {
    filters.hashtags = e.target.value.toLowerCase().trim();
    applyFilters();
  });
  
  setupSlider('views', 0, 100000000);
  setupSlider('subs', 0, 100000000);
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
    if (isMax && value >= 100000000) return '100M+';
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
  
  // Debug: mostra todos os elementos ytd- na página
  console.log('[Filtros] 🔍 DEBUG - Elementos ytd- na página:');
  const allYtdElements = document.querySelectorAll('[id^="content"]');
  console.log('[Filtros] Elementos com id="content":', allYtdElements.length);
  
  // Lista todos os custom elements do YouTube
  const customElements = Array.from(document.querySelectorAll('*')).filter(el => el.tagName.startsWith('YTD-'));
  const uniqueTags = [...new Set(customElements.map(el => el.tagName))];
  console.log('[Filtros] 🔍 Custom elements únicos encontrados:', uniqueTags.slice(0, 20));
  
  // Tenta diferentes seletores dependendo da página
  let videoElements = document.querySelectorAll('ytd-video-renderer');
  console.log('[Filtros] ytd-video-renderer:', videoElements.length);
  
  if (videoElements.length === 0) {
    videoElements = document.querySelectorAll('ytd-grid-video-renderer');
    console.log('[Filtros] ytd-grid-video-renderer:', videoElements.length);
  }
  
  if (videoElements.length === 0) {
    videoElements = document.querySelectorAll('ytd-rich-item-renderer');
    console.log('[Filtros] ytd-rich-item-renderer:', videoElements.length);
  }
  
  if (videoElements.length === 0) {
    videoElements = document.querySelectorAll('ytd-compact-video-renderer');
    console.log('[Filtros] ytd-compact-video-renderer:', videoElements.length);
  }
  
  if (videoElements.length === 0) {
    videoElements = document.querySelectorAll('ytd-rich-grid-media');
    console.log('[Filtros] ytd-rich-grid-media:', videoElements.length);
  }
  
  console.log(`[Filtros] ✓ Encontrou ${videoElements.length} elementos de vídeo na página`);
  if (videoElements.length > 0) {
    console.log(`[Filtros] Tipo de elemento:`, videoElements[0]?.tagName);
  }
  
  const videoDataPromises = [];
  
  videoElements.forEach((element, index) => {
    const video = extractVideoData(element);
    if (video) {
      allVideos.push(video);
      console.log(`[Filtros] Vídeo #${index + 1}: "${video.title}" - Inscritos: ${video.subscribers !== null ? video.subscribers : 'null (não encontrado)'}`);
      
      if (video.channelUrl && video.subscribers === null) {
        if (YOUTUBE_API_KEY) {
          console.log(`[Filtros] Buscando inscritos via API para: ${video.channelName}`);
          videoDataPromises.push(
            fetchSubscriberCount(video.channelUrl).then(subs => {
              video.subscribers = subs;
              if (subs !== null) {
                console.log(`[Filtros] ✓ API retornou ${subs} inscritos para ${video.channelName}`);
              }
            })
          );
        } else {
          console.log(`[Filtros] ⚠️ API Key não configurada - configure em chrome://extensions > Filtros > Opções`);
        }
      }
    }
  });
  
  console.log(`[Filtros] ✓ Capturou ${allVideos.length} vídeos`);
  applyFilters();
  
  if (videoDataPromises.length > 0 && YOUTUBE_API_KEY) {
    console.log(`[Filtros] Aguardando ${videoDataPromises.length} requisições da API...`);
    await Promise.all(videoDataPromises);
    console.log(`[Filtros] ✓ Atualizou contagem de inscritos de ${videoDataPromises.length} canais`);
    applyFilters();
  } else if (videoDataPromises.length > 0 && !YOUTUBE_API_KEY) {
    console.warn('[Filtros] ⚠️ Para obter dados precisos de inscritos, configure sua API Key do YouTube em chrome://extensions');
  }
}

function extractVideoData(element) {
  try {
    // Tenta vários seletores para o título
    const titleElement = element.querySelector('#video-title') || 
                        element.querySelector('a#video-title-link') ||
                        element.querySelector('h3 a') ||
                        element.querySelector('a[href*="/watch"]');
    
    if (!titleElement || !titleElement.href || !titleElement.href.includes('/watch')) {
      return null;
    }
    
    const title = titleElement.textContent.trim();
    if (!title) return null;
    
    const url = titleElement.href;
    
    const thumbnailElement = element.querySelector('img');
    const thumbnail = thumbnailElement?.src || '';
    
    // Busca por metadata em todo o elemento (não apenas em um seletor específico)
    const wholeText = element.textContent || '';
    
    // Extrai visualizações usando regex
    let viewsText = '';
    const viewsMatch = wholeText.match(/(\d+[.,]?\d*)\s*(mil|K|mi|M|milhões?|milhoes?)?\s*visualizaç(ões|oes)|(\d+[.,]?\d*)\s*(K|M)\s*views/i);
    if (viewsMatch) {
      viewsText = viewsMatch[0];
    }
    
    // Extrai data usando regex (aceita plural e "mes" sem acento)
    let publishDateText = '';
    const dateMatch = wholeText.match(/há\s+\d+\s+(segundos?|minutos?|horas?|dias?|semanas?|m[eê]s(?:es)?|anos?)/i) ||
                     wholeText.match(/\d+\s+(segundos?|minutos?|horas?|dias?|semanas?|m[eê]s(?:es)?|anos?)\s+atrás/i);
    if (dateMatch) {
      publishDateText = dateMatch[0];
    }
    
    const views = parseViews(viewsText);
    const publishDate = parsePublishDate(publishDateText);
    
    console.log(`[Filtros] ✓ "${title.substring(0, 40)}..." - Views: "${viewsText}" (${views}) - Data: "${publishDateText}"`);
    
    // Duração - tenta múltiplos seletores
    const durationElement = element.querySelector('ytd-thumbnail-overlay-time-status-renderer span#text') ||
                           element.querySelector('ytd-thumbnail-overlay-time-status-renderer') ||
                           element.querySelector('.ytd-thumbnail-overlay-time-status-renderer') ||
                           element.querySelector('span.style-scope.ytd-thumbnail-overlay-time-status-renderer');
    
    let durationText = durationElement?.textContent?.trim() || '';
    
    // Se não encontrou, busca no atributo aria-label da thumbnail
    if (!durationText || durationText === '') {
      const thumbnailOverlay = element.querySelector('[aria-label]');
      if (thumbnailOverlay) {
        const ariaMatch = thumbnailOverlay.getAttribute('aria-label')?.match(/(\d+:\d+)/);
        if (ariaMatch) durationText = ariaMatch[1];
      }
    }
    
    const duration = parseDuration(durationText || '0:00');
    console.log(`[Filtros] Duração extraída: "${durationText}" = ${duration}s`);
    
    // Canal
    const channelElement = element.querySelector('ytd-channel-name a') || 
                          element.querySelector('#channel-name a') ||
                          element.querySelector('a[href*="/@"]') ||
                          element.querySelector('a[href*="/channel/"]');
    const channelName = channelElement?.textContent.trim() || 'Unknown';
    const channelUrl = channelElement?.href || '';
    
    const channelAvatarElement = element.querySelector('#avatar img') || 
                                element.querySelector('ytd-channel-thumbnail img') ||
                                element.querySelector('img[height="36"]');
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
  if (!viewsText || viewsText === '0') {
    return 0;
  }
  
  const match = viewsText.match(/(\d+)[.,]?(\d*)/);
  if (!match) {
    return 0;
  }
  
  // Extrai número com decimais (ex: "1,1" ou "1.5")
  let num = parseFloat(match[1] + (match[2] ? '.' + match[2] : ''));
  
  // Detecta multiplicador (ordem importa: milhões antes de mil)
  if (viewsText.match(/\bmilhões?\b|\bmilhoes?\b/i) || viewsText.match(/\bmi\b/i)) {
    return Math.floor(num * 1000000);
  }
  if (viewsText.match(/\bmil\b/i) || viewsText.match(/\bK\b/)) {
    return Math.floor(num * 1000);
  }
  if (viewsText.match(/\bM\b/) && !viewsText.match(/\bmil\b/i)) {
    return Math.floor(num * 1000000);
  }
  
  return Math.floor(num);
}

function parsePublishDate(dateText) {
  const now = Date.now();
  
  // Regex atualizado para aceitar plural e "mes" sem acento
  const match = dateText.match(/(\d+)\s*(segundos?|minutos?|horas?|dias?|semanas?|m[eê]s(?:es)?|anos?|seconds?|minutes?|hours?|days?|weeks?|months?|years?)/i);
  if (!match) {
    console.log('[Filtros] ⚠️ Data não reconhecida:', dateText);
    return now;
  }
  
  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  
  // Normaliza o texto para a forma singular
  const normalizedUnit = unit
    .replace(/segundos?/i, 'segundo')
    .replace(/minutos?/i, 'minuto')
    .replace(/horas?/i, 'hora')
    .replace(/dias?/i, 'dia')
    .replace(/semanas?/i, 'semana')
    .replace(/m[eê]s(?:es)?/i, 'mês')
    .replace(/anos?/i, 'ano')
    .replace(/seconds?/i, 'second')
    .replace(/minutes?/i, 'minute')
    .replace(/hours?/i, 'hour')
    .replace(/days?/i, 'day')
    .replace(/weeks?/i, 'week')
    .replace(/months?/i, 'month')
    .replace(/years?/i, 'year');
  
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
  
  const multiplier = multipliers[normalizedUnit] || 0;
  const calculatedDate = now - (value * multiplier);
  
  console.log(`[Filtros] 📅 Data: "${dateText}" = ${value} ${normalizedUnit} atrás`);
  
  return calculatedDate;
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
  
  // Shorts DEVEM ter /shorts/ na URL
  if (url && url.includes('/shorts/')) return 'short';
  
  // Caso contrário é vídeo normal (mesmo que seja curto)
  return 'video';
}

const subscriberCache = new Map();
let YOUTUBE_API_KEY = null;

chrome.storage.sync.get(['youtubeApiKey'], function(result) {
  if (result.youtubeApiKey) {
    YOUTUBE_API_KEY = result.youtubeApiKey;
  }
});

async function getChannelIdFromUrl(channelUrl) {
  if (!channelUrl) return null;
  
  const urlPatterns = [
    /youtube\.com\/(channel|c|user)\/([^/?]+)/,
    /youtube\.com\/@([^/?]+)/
  ];
  
  for (const pattern of urlPatterns) {
    const match = channelUrl.match(pattern);
    if (match) {
      if (match[1] === 'channel') {
        return match[2];
      }
      return await resolveChannelHandle(match[2] || match[1]);
    }
  }
  
  return null;
}

async function resolveChannelHandle(handle) {
  if (!YOUTUBE_API_KEY) return null;
  
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(handle)}&key=${YOUTUBE_API_KEY}&maxResults=1`
    );
    const data = await response.json();
    
    if (data.items && data.items.length > 0 && data.items[0].id) {
      return data.items[0].id.channelId;
    }
  } catch (error) {
    console.log('Error resolving channel handle:', error);
  }
  
  return null;
}

async function fetchSubscriberCountViaAPI(channelId) {
  if (!channelId || !YOUTUBE_API_KEY) return null;
  
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`
    );
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const subs = parseInt(data.items[0].statistics.subscriberCount);
      return isNaN(subs) ? null : subs;
    }
  } catch (error) {
    console.log('Error fetching subscriber count via API:', error);
  }
  
  return null;
}

async function fetchSubscriberCount(channelUrl) {
  if (!channelUrl) return null;
  
  if (subscriberCache.has(channelUrl)) {
    return subscriberCache.get(channelUrl);
  }
  
  if (YOUTUBE_API_KEY) {
    try {
      const channelId = await getChannelIdFromUrl(channelUrl);
      if (channelId) {
        const subs = await fetchSubscriberCountViaAPI(channelId);
        if (subs !== null) {
          subscriberCache.set(channelUrl, subs);
          return subs;
        }
      }
    } catch (error) {
      console.log('API method failed, falling back to scraping:', error);
    }
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
    console.log('[Filtros] Tentando extrair inscritos do elemento:', element.tagName);
    
    const subElement = element.querySelector('ytd-video-meta-block #owner-sub-count');
    
    if (subElement && subElement.textContent.trim()) {
      const text = subElement.textContent.trim();
      console.log('[Filtros] Encontrou #owner-sub-count:', text);
      const result = parseSubscriberText(text);
      if (result !== null) {
        console.log('[Filtros] ✓ Inscritos extraídos:', result);
        return result;
      }
    }
    
    console.log('[Filtros] ✗ Não encontrou inscritos no DOM para este vídeo');
    return null;
  } catch (error) {
    console.error('[Filtros] Erro ao extrair inscritos:', error);
    return null;
  }
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
    // Filtro de tipo de vídeo
    const hasTypeFilter = filters.showVideos || filters.showShorts || filters.showLive;
    if (hasTypeFilter) {
      let typeMatches = false;
      if (filters.showVideos && video.type === 'video') typeMatches = true;
      if (filters.showShorts && video.type === 'short') typeMatches = true;
      if (filters.showLive && video.type === 'live') typeMatches = true;
      if (!typeMatches) return false;
    }
    
    // Filtro de visualizações
    if (video.views < filters.viewsMin || video.views > filters.viewsMax) {
      return false;
    }
    
    // Filtro de inscritos (apenas se o valor estiver disponível)
    if (video.subscribers !== null) {
      if (video.subscribers < filters.subsMin || video.subscribers > filters.subsMax) {
        return false;
      }
    }
    
    // Filtro de duração (converte para minutos)
    const durationMinutes = video.duration / 60;
    if (durationMinutes < filters.durationMin || durationMinutes > filters.durationMax) {
      return false;
    }
    
    // Filtro de VPH
    if (video.vph < filters.vphMin || video.vph > filters.vphMax) {
      return false;
    }
    
    // Filtro de data de publicação
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
      
      if (hoursDiff > limits[filters.publishDate]) {
        return false;
      }
    }
    
    // Filtro de hashtags
    if (filters.hashtags && filters.hashtags.trim().length > 0) {
      const searchHashtags = filters.hashtags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      if (searchHashtags.length > 0) {
        const videoTitle = video.title.toLowerCase();
        const hasHashtag = searchHashtags.some(tag => {
          const cleanTag = tag.startsWith('#') ? tag : '#' + tag;
          const tagFound = videoTitle.includes(cleanTag);
          if (tagFound) {
            console.log(`[Filtros] ✓ Hashtag encontrada: "${cleanTag}" em "${video.title}"`);
          }
          return tagFound;
        });
        
        if (!hasHashtag) {
          console.log(`[Filtros] ✗ Vídeo ignorado (sem hashtag): "${video.title}"`);
          return false;
        }
      }
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
  
  // Calcula VPH médio de todos os vídeos (baseline)
  const totalVph = allVideos.reduce((sum, v) => sum + v.vph, 0);
  const averageVph = allVideos.length > 0 ? totalVph / allVideos.length : 1;
  
  videoList.innerHTML = filteredVideos.map(video => {
    // Gera badges baseado nas características do vídeo (máximo 2 badges)
    const badgesList = [];
    
    // Prioridade 1: Badge de tipo (mais importante)
    if (video.type === 'live') {
      badgesList.push('<span class="video-badge badge-live">🔴 AO VIVO</span>');
    } else if (video.type === 'short') {
      badgesList.push('<span class="video-badge badge-short">📱 Short</span>');
    }
    
    // Prioridade 2: Badge de Novo (menos de 7 dias)
    const hoursOld = (Date.now() - video.publishDate) / (1000 * 60 * 60);
    const daysOld = hoursOld / 24;
    if (daysOld < 7 && badgesList.length < 2) {
      badgesList.push('<span class="video-badge badge-new">✨ Novo</span>');
    }
    
    // Prioridade 3: Badge de Trending (VPH alto) ou Remix
    if (badgesList.length < 2) {
      if (video.vph > 1000) {
        badgesList.push('<span class="video-badge badge-trending">🔥 Trending</span>');
      } else if (video.title.toLowerCase().includes('remix') || video.title.toLowerCase().includes('react')) {
        badgesList.push('<span class="video-badge badge-remix">⚡ Remix</span>');
      }
    }
    
    const badges = badgesList.join('');
    
    // Calcula multiplicador de VPH (quantas vezes acima da média)
    const vphMultiplier = averageVph > 0 ? video.vph / averageVph : 0;
    let multiplierBadge = '';
    
    if (vphMultiplier >= 2) {
      const multiplierValue = Math.round(vphMultiplier);
      multiplierBadge = `<span class="vph-multiplier">${multiplierValue}x</span>`;
    }
    
    return `
      <div class="video-item" onclick="window.open('${video.url}', '_blank')">
        <div class="video-thumbnail">
          <img src="${video.thumbnail}" alt="${video.title}">
          <div class="video-duration">${formatDuration(video.duration)}</div>
        </div>
        <div class="video-info">
          <div class="video-title">${video.title}</div>
          ${badges ? `<div class="video-badges">${badges}</div>` : ''}
          <div class="video-stats">
            <span>👁️ ${formatNumber(video.views)}</span>
            <span>•</span>
            <span>${video.publishDateText}</span>
            <span class="stat-badge vph">⚡ ${formatNumber(video.vph)} VPH ${multiplierBadge}</span>
          </div>
          <div class="video-channel">
            <div class="channel-avatar">
              ${video.channelAvatar ? `<img src="${video.channelAvatar}" alt="${video.channelName}">` : ''}
            </div>
            <div class="channel-info">
              <div class="channel-name">${video.channelName}</div>
              <div class="channel-subs">${video.subscribers !== null ? formatNumber(video.subscribers) + ' inscritos' : 'Inscritos não disponíveis'}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
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
  const headers = ['Título', 'URL', 'Visualizações', 'Canal', 'Inscritos', 'Data Publicação', 'Duração', 'VPH'];
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
    viewsMax: 100000000,
    subsMin: 0,
    subsMax: 100000000,
    durationMin: 0,
    durationMax: 180,
    vphMin: 0,
    vphMax: 1000,
    publishDate: 'all',
    hashtags: '',
    showVideos: true,
    showShorts: false,
    showLive: false,
    sortBy: 'views'
  };
  
  document.getElementById('viewsMin').value = 0;
  document.getElementById('viewsMax').value = 100000000;
  document.getElementById('subsMin').value = 0;
  document.getElementById('subsMax').value = 100000000;
  document.getElementById('durationMin').value = 0;
  document.getElementById('durationMax').value = 180;
  document.getElementById('vphMin').value = 0;
  document.getElementById('vphMax').value = 1000;
  document.getElementById('publishDateFilter').value = 'all';
  document.getElementById('hashtagFilter').value = '';
  document.getElementById('filterVideos').checked = true;
  document.getElementById('filterShorts').checked = false;
  document.getElementById('filterLive').checked = false;
  document.getElementById('sortBy').value = 'views';
  
  document.getElementById('viewsMinVal').textContent = '0';
  document.getElementById('viewsMaxVal').textContent = '100M+';
  document.getElementById('subsMinVal').textContent = '0';
  document.getElementById('subsMaxVal').textContent = '100M+';
  document.getElementById('durationMinVal').textContent = '0:00';
  document.getElementById('durationMaxVal').textContent = '180+';
  document.getElementById('vphMinVal').textContent = '0';
  document.getElementById('vphMaxVal').textContent = '1000+';
  
  applyFilters();
}
