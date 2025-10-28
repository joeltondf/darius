# 📦 Como Instalar a Extensão "Filtros" no Chrome

## Passo a Passo

### 1. Preparar os Arquivos
Você já tem todos os arquivos necessários neste projeto:
- ✅ `manifest.json` - Configuração da extensão
- ✅ `content.js` - Script principal
- ✅ `panel.html` e `panel.css` - Interface do painel
- ✅ `popup.html` e `popup.js` - Popup da extensão
- ✅ `background.js` - Service worker
- ✅ `icons/` - Ícones da extensão

### 2. Abrir o Gerenciador de Extensões do Chrome

1. Abra o Google Chrome
2. Digite na barra de endereços: `chrome://extensions/`
3. Pressione Enter

### 3. Ativar o Modo Desenvolvedor

1. No canto superior direito da página, você verá um botão "Modo do desenvolvedor"
2. Clique nele para ativá-lo (o botão ficará azul)

### 4. Carregar a Extensão

1. Clique no botão **"Carregar sem compactação"** (aparece após ativar o modo desenvolvedor)
2. Na janela que abrir, navegue até **a pasta deste projeto** (a pasta que contém o arquivo `manifest.json`)
3. Selecione a pasta e clique em "Selecionar pasta" ou "Abrir"

### 5. Verificar a Instalação

Após carregar a extensão:
- ✅ Você verá a extensão "Filtros - YouTube Video Filter" na lista de extensões
- ✅ O ícone 🎬 aparecerá na barra de ferramentas do Chrome
- ✅ A extensão estará ativa e pronta para uso

## Como Usar a Extensão

### 1. Acesse o YouTube
- Abra uma nova aba e vá para https://www.youtube.com
- Navegue para qualquer página que mostre vídeos (Home, resultados de busca, canal, etc.)

### 2. Abrir o Painel de Filtros
- Clique no ícone 🎬 da extensão na barra de ferramentas
- Clique no botão **"Abrir Painel de Filtros"**
- Um painel lateral aparecerá no lado esquerdo da página

### 3. Usar os Filtros
- **Visualizações**: Ajuste o slider para filtrar por número de views
- **Assinantes**: Filtre por tamanho do canal
- **Duração**: Escolha a duração dos vídeos (Shorts, vídeos curtos, longos, etc.)
- **VPH**: Filtre por Visualizações Por Hora (encontre vídeos viralizando)
- **Data**: Escolha período de publicação
- **Tipo**: Selecione Vídeos, Shorts ou Lives

### 4. Ordenar Resultados
Use o dropdown "Ordenar por" para organizar os vídeos por:
- Visualizações
- VPH
- Duração
- Data de publicação
- Número de assinantes

### 5. Exportar Dados
- Clique no botão **"Baixar CSV"** para exportar todos os vídeos filtrados
- O arquivo CSV conterá: Título, URL, Visualizações, Canal, Assinantes, Data, Duração, VPH

### 6. Carregar Mais Vídeos
- Clique em **"Load more videos"** para fazer scroll automático na página
- A extensão capturará mais vídeos do YouTube automaticamente

## Notas Importantes

⚠️ **Dados de Assinantes**: 
- A extensão tenta extrair o número de assinantes do DOM do YouTube
- Se não conseguir, mostrará "Assinantes não disponíveis"
- No CSV, valores não disponíveis aparecerão como "N/A"

⚠️ **Detecção de Lives**:
- A extensão detecta lives através de badges específicos do YouTube
- Se um vídeo não tiver badge de LIVE, pode ser classificado incorretamente

⚠️ **Recarregar a Página**:
- Se a extensão não funcionar, tente recarregar a página do YouTube
- Ou recarregue a extensão em `chrome://extensions/`

## Solução de Problemas

### O painel não abre?
1. Certifique-se de estar em uma página do YouTube
2. Recarregue a página do YouTube (F5)
3. Tente desativar e reativar a extensão

### Nenhum vídeo aparece?
1. Verifique se há vídeos na página do YouTube
2. Ajuste os filtros (podem estar muito restritivos)
3. Clique em "Reiniciar Filtros" para resetar

### A extensão não está na lista?
1. Verifique se o Modo Desenvolvedor está ativado
2. Certifique-se de ter selecionado a pasta correta (com manifest.json)
3. Veja se há erros na página de extensões

### Erros aparecem?
1. Abra `chrome://extensions/`
2. Clique em "Detalhes" na extensão Filtros
3. Veja os erros e recarregue a extensão

## Atualizando a Extensão

Quando fizer modificações no código:
1. Vá em `chrome://extensions/`
2. Encontre a extensão "Filtros"
3. Clique no ícone de reload (🔄) para recarregar
4. As mudanças serão aplicadas imediatamente

## Desinstalando

Para remover a extensão:
1. Vá em `chrome://extensions/`
2. Encontre "Filtros - YouTube Video Filter"
3. Clique em "Remover"
4. Confirme a remoção

---

**Aproveite sua análise de vídeos do YouTube! 🎬**
