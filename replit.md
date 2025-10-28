# Filtros - YouTube Video Filter Extension

## Visão Geral
Extensão Chrome desenvolvida para filtrar e analisar vídeos do YouTube com filtros avançados de visualizações, assinantes, duração e VPH (Visualizações Por Hora).

## Status Atual
✅ Extensão Chrome completa e funcional
✅ Interface dark moderna com painel lateral
✅ Sistema de filtros avançados implementado
✅ Exportação CSV funcional
✅ Servidor de teste configurado para pré-visualização

## Estrutura do Projeto
- **manifest.json**: Configuração Chrome Extension Manifest V3
- **popup.html/popup.js**: Interface do ícone da extensão
- **content.js**: Script injetado no YouTube para captura e filtragem
- **panel.html/panel.css**: Interface do painel lateral com filtros
- **background.js**: Service worker para processamento em background
- **test-panel.html**: Página de teste local da interface
- **icons/**: Ícones da extensão (16x16, 48x48, 128x128)

## Arquitetura

### Content Script (content.js)
- Captura vídeos visíveis na página do YouTube
- Extrai metadados: título, views, canal, assinantes, duração, data
- Calcula VPH (Visualizações Por Hora)
- Aplica filtros em tempo real
- Renderiza resultados no painel

### Filtros Implementados
1. **Visualizações**: 0 - 10M+ (slider duplo)
2. **Assinantes**: 0 - 10M+ (slider duplo)
3. **Duração**: 0 - 180+ minutos (slider duplo)
4. **VPH**: 0 - 1000+ (slider duplo)
5. **Data de Publicação**: dropdown com 6 opções
6. **Tipo**: checkboxes (Vídeos, Shorts, Live)
7. **Ordenação**: dropdown (views, VPH, duração, data, assinantes)

### Funcionalidades
- ✅ Captura automática de vídeos da página
- ✅ Filtragem em tempo real
- ✅ Múltiplas ordenações
- ✅ Exportação CSV completa
- ✅ Load more videos (scroll automático)
- ✅ Reset de filtros
- ✅ Interface responsiva e intuitiva

## Como Instalar a Extensão

1. Abra `chrome://extensions/` no Google Chrome
2. Ative "Modo do desenvolvedor"
3. Clique em "Carregar sem compactação"
4. Selecione a pasta do projeto
5. Acesse youtube.com e clique no ícone da extensão

## Como Testar Localmente

O servidor de teste está configurado para visualizar a interface:
- Acesse a porta 5000 para ver test-panel.html
- Veja a interface completa da extensão funcionando

## Tecnologias
- Chrome Extension Manifest V3
- JavaScript Vanilla
- HTML5/CSS3
- Python (apenas para criar ícones e servidor de teste)

## Preferências do Usuário
- Interface em Português Brasileiro
- Tema dark moderno
- Foco em ferramentas para canais dark no YouTube
- Análise de vídeos por métricas de viralização (VPH)

## Próximas Fases (Futuras)
- Filtros premium: Outlier score avançado
- Botões de filtro rápido de duração
- Sistema de tags personalizadas
- Histórico de buscas salvas
- Analytics dashboard com gráficos
