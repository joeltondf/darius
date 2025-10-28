# 🎬 Filtros - Extensão Chrome para YouTube

Uma extensão poderosa para Google Chrome que permite filtrar e analisar vídeos do YouTube com filtros avançados.

## 🚀 Recursos Principais

### Filtros Avançados
- **Visualizações**: Filtre por número de visualizações (0 - 10M+)
- **Inscritos**: Filtre por número de inscritos do canal (0 - 10M+)
  - Extração inteligente do DOM do YouTube com fallback assíncrono
  - Suporte para português e inglês (mil, K, mi, M, milhões)
  - Cache de dados para melhor performance
- **Duração**: Filtre por duração do vídeo (0 - 180+ minutos)
- **VPH (Visualizações Por Hora)**: Descubra vídeos em crescimento rápido
- **Data de Publicação**: Últimas 24h, 7 dias, 30 dias, 3 meses, 1 ano ou todos

### Funcionalidades
- ✅ Captura automática de vídeos da página do YouTube
- ✅ Extração inteligente de inscritos com múltiplos seletores DOM
- ✅ Busca assíncrona de dados de canal quando não disponíveis no DOM
- ✅ Cálculo automático de VPH para cada vídeo
- ✅ Múltiplas opções de ordenação (visualizações, VPH, duração, data, inscritos)
- ✅ Filtros por tipo (Vídeos, Shorts, Live)
- ✅ Detecção de transmissões ao vivo via badges
- ✅ Exportação completa para CSV
- ✅ Interface dark moderna e intuitiva
- ✅ Painel lateral não-intrusivo
- ✅ Carregamento dinâmico de mais vídeos

## 📦 Instalação

### Método 1: Modo Desenvolvedor (Recomendado para testes)

1. Faça download ou clone este repositório
2. Abra o Google Chrome
3. Digite `chrome://extensions/` na barra de endereços
4. Ative o **"Modo do desenvolvedor"** no canto superior direito
5. Clique em **"Carregar sem compactação"**
6. Selecione a pasta deste projeto que contém o `manifest.json`
7. A extensão "Filtros" será instalada e aparecerá no Chrome

## 🎯 Como Usar

1. **Acesse o YouTube**: Navegue para https://www.youtube.com
2. **Abra o Painel**: Clique no ícone 🎬 da extensão na barra de ferramentas
3. **Ative os Filtros**: Clique em "Abrir Painel de Filtros"
4. **Configure os Filtros**: Ajuste os sliders e opções conforme desejado
5. **Visualize Resultados**: Os vídeos serão filtrados em tempo real
6. **Exporte Dados**: Clique em "Baixar CSV" para exportar os resultados

## 🎨 Interface

A extensão apresenta um **painel modal centralizado** (similar ao VideoQ) ao invés de um painel lateral:
- Modal centralizado com 90% da largura (max 1000px)
- Backdrop escuro com blur
- Design moderno com bordas arredondadas
- Fácil fechamento clicando fora do painel

## 📊 Estrutura de Arquivos

```
filtros-youtube-extension/
├── manifest.json           # Configuração da extensão (Manifest V3)
├── popup.html             # Interface do popup da extensão
├── popup.js               # Lógica do popup
├── options.html           # Página de configurações (API Key)
├── options.js             # Lógica das configurações
├── content.js             # Script principal injetado no YouTube
├── panel.html             # HTML do painel modal
├── panel.css              # Estilos do painel
├── background.js          # Service worker
├── icons/                 # Ícones da extensão
│   ├── icon16.png
│   ├── icon48.png
│   ├── icon128.png
│   └── icon.svg
├── README.md              # Documentação principal
├── INSTRUCOES_INSTALACAO.md  # Guia de instalação
└── COMO_USAR_API.md       # Tutorial da YouTube API
```

## 🎨 Filtros Disponíveis

### Visualizações
- Range: 0 a 10.000.000+
- Encontre vídeos virais ou nichos pequenos

### Inscritos do Canal
- Range: 0 a 10.000.000+
- Filtre por tamanho do canal

### Duração do Vídeo
- Range: 0 a 180+ minutos
- Separe Shorts, vídeos curtos, médios ou longos

### VPH (Visualizações Por Hora)
- Range: 0 a 1.000+
- Identifique vídeos em crescimento rápido
- Cálculo: (visualizações / horas desde publicação)

### Data de Publicação
- Last 24 hours
- Last 7 days
- Last 30 days
- Last 3 months
- Last year
- All time

## 🔍 Extração de Dados de Inscritos

A extensão utiliza uma estratégia em duas camadas para obter dados de inscritos:

### 1. Extração Direta do DOM
A extensão tenta primeiro extrair os inscritos diretamente dos elementos da página usando vários seletores:
- `#owner-sub-count` - Contador principal de inscritos
- `ytd-video-owner-renderer #owner-sub-count` - Elemento do proprietário do vídeo
- `#subscriber-count` - Contador alternativo
- `yt-formatted-string#subscriber-count` - String formatada do YouTube
- E outros seletores de fallback

### 2. Busca Assíncrona (Fallback)
Quando os dados não estão disponíveis no DOM da página atual:
- A extensão faz uma requisição assíncrona à página do canal
- Extrai os dados do `ytInitialData` embutido na página
- Armazena em cache para evitar requisições repetidas
- Atualiza a interface automaticamente quando os dados chegam

### Suporte Multilíngue
A função de parsing reconhece formatos em:
- **Português**: "1,5 mil inscritos", "6,22 mi de assinantes", "500 milhões de inscritos"
- **Inglês**: "1.5K subscribers", "6.22M subscribers"

### Comportamento quando dados não disponíveis
- Interface mostra: "Inscritos não disponíveis"
- CSV exporta: "N/A"
- Filtros ignoram vídeos sem dados de inscritos (não os excluem)

## 💾 Exportação CSV

Os dados exportados incluem:
- Título do vídeo
- URL completa
- Número de visualizações
- Nome do canal
- Número de inscritos
- Data de publicação
- Duração (formato HH:MM:SS)
- VPH (Visualizações Por Hora)

## 🔧 Tecnologias Utilizadas

- **Manifest V3**: Última versão do sistema de extensões do Chrome
- **JavaScript Vanilla**: Sem dependências externas
- **HTML5/CSS3**: Interface moderna e responsiva
- **Chrome Extension APIs**: 
  - Content Scripts
  - Background Service Worker
  - Storage API
  - Downloads API

## 📝 Notas Importantes

- A extensão só funciona em páginas do YouTube (youtube.com)
- Os dados de assinantes são estimados (YouTube não expõe via scraping)
- A extensão respeita a privacidade - não coleta dados do usuário
- Todos os dados são processados localmente no navegador

## 🐛 Solução de Problemas

### A extensão não aparece
- Verifique se está no modo desenvolvedor
- Recarregue a extensão em chrome://extensions/

### O painel não abre
- Certifique-se de estar em uma página do YouTube
- Recarregue a página do YouTube
- Verifique o console para erros

### Vídeos não aparecem
- Role a página do YouTube para carregar mais vídeos
- Clique em "Load more videos"
- Verifique se os filtros não estão muito restritivos

## 📜 Licença

Este projeto é de código aberto e está disponível para uso pessoal e educacional.

## 👨‍💻 Desenvolvimento

### Para contribuir ou modificar:

1. Clone o repositório
2. Faça suas modificações nos arquivos
3. Teste carregando a extensão no Chrome
4. Recarregue a extensão após cada mudança

### Arquivos principais para editar:

- `content.js`: Lógica de captura e filtragem
- `panel.css`: Estilos da interface
- `panel.html`: Estrutura do painel

---

**Desenvolvido com ❤️ para criadores de conteúdo dark e analistas de YouTube**
