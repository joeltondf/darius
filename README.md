# 🎬 Filtros - Extensão Chrome para YouTube

Uma extensão poderosa para Google Chrome que permite filtrar e analisar vídeos do YouTube com filtros avançados.

## 🚀 Recursos Principais

### Filtros Avançados
- **Visualizações**: Filtre por número de visualizações (0 - 10M+)
- **Assinantes**: Filtre por número de assinantes do canal (0 - 10M+)
- **Duração**: Filtre por duração do vídeo (0 - 180+ minutos)
- **VPH (Visualizações Por Hora)**: Descubra vídeos em crescimento rápido
- **Data de Publicação**: Últimas 24h, 7 dias, 30 dias, 3 meses, 1 ano ou todos

### Funcionalidades
- ✅ Captura automática de vídeos da página do YouTube
- ✅ Cálculo automático de VPH para cada vídeo
- ✅ Múltiplas opções de ordenação (visualizações, VPH, duração, data, assinantes)
- ✅ Filtros por tipo (Vídeos, Shorts, Live)
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

## 🖥️ Pré-visualização da Interface

Antes de instalar a extensão no Chrome, você pode visualizar a interface:

1. Execute `python -m http.server 5000` neste diretório
2. Abra http://localhost:5000/test-panel.html no navegador
3. Veja como a interface da extensão funciona

## 📊 Estrutura de Arquivos

```
filtros-youtube-extension/
├── manifest.json           # Configuração da extensão
├── popup.html             # Interface do popup da extensão
├── popup.js               # Lógica do popup
├── content.js             # Script injetado no YouTube
├── panel.html             # HTML do painel lateral
├── panel.css              # Estilos do painel
├── background.js          # Service worker
├── test-panel.html        # Página de teste da interface
├── icons/                 # Ícones da extensão
│   ├── icon16.png
│   ├── icon48.png
│   ├── icon128.png
│   └── icon.svg
└── README.md              # Este arquivo
```

## 🎨 Filtros Disponíveis

### Visualizações
- Range: 0 a 10.000.000+
- Encontre vídeos virais ou nichos pequenos

### Assinantes do Canal
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

## 💾 Exportação CSV

Os dados exportados incluem:
- Título do vídeo
- URL completa
- Número de visualizações
- Nome do canal
- Número de assinantes
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
