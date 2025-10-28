# 🔑 Como Configurar a YouTube Data API v3

## Por que usar a API?

A YouTube Data API v3 permite que a extensão obtenha dados **precisos e confiáveis** de assinantes dos canais, muito superior ao método de scraping do DOM que pode falhar frequentemente.

## Passo a Passo para Obter sua API Key

### 1. Acesse o Google Cloud Console
Vá para: https://console.cloud.google.com/

### 2. Crie um Novo Projeto (ou use um existente)
1. Clique em "Select a project" no topo
2. Clique em "NEW PROJECT"
3. Nomeie como "Filtros YouTube Extension"
4. Clique em "CREATE"

### 3. Ative a YouTube Data API v3
1. No menu lateral, vá em **APIs & Services** → **Library**
2. Procure por "YouTube Data API v3"
3. Clique na API
4. Clique em **"ENABLE"** (Ativar)

### 4. Crie uma API Key
1. No menu lateral, vá em **APIs & Services** → **Credentials**
2. Clique em **"+ CREATE CREDENTIALS"**
3. Selecione **"API key"**
4. Uma API key será gerada (começa com `AIza...`)
5. **COPIE** a API key

### 5. (Opcional mas recomendado) Restrinja a API Key
Para segurança adicional:
1. Clique em "RESTRICT KEY"
2. Em "API restrictions", selecione "Restrict key"
3. Marque apenas: **YouTube Data API v3**
4. Clique em "SAVE"

## Como Adicionar a API Key na Extensão

### Método 1: Via Popup da Extensão
1. Clique no ícone 🎬 da extensão no Chrome
2. Clique em **"⚙️ Configurar API Key"**
3. Cole sua API key no campo
4. Clique em **"💾 Salvar Configurações"**

### Método 2: Via Página de Opções
1. Clique com botão direito no ícone da extensão
2. Selecione **"Opções"**
3. Cole sua API key
4. Salve

## Verificando se está Funcionando

1. Abra o YouTube
2. Abra o painel da extensão
3. Abra o Console do navegador (F12)
4. Procure por mensagens como:
   - ✅ "Captured X videos"
   - ✅ "Updated subscriber counts for X channels"
   - ❌ Se ver erros da API, verifique se ativou corretamente

## Limitações da API Gratuita

A YouTube Data API v3 tem uma quota diária gratuita:
- **10.000 units por dia** (gratuito)
- Cada requisição de subscriber count consome: **1 unit**
- Isso significa **~10.000 canais diferentes por dia**

A extensão usa **cache** para não fazer requisições repetidas para o mesmo canal.

## Comparação: Com API vs Sem API

### ❌ Sem API Key (apenas scraping)
- ⚠️ Dados podem não aparecer
- ⚠️ Depende da estrutura do DOM do YouTube
- ⚠️ Pode parar de funcionar se YouTube mudar o layout
- ⚠️ Menos confiável

### ✅ Com API Key
- ✅ Dados **100% precisos**
- ✅ Número exato de assinantes (não arredondado)
- ✅ Muito mais confiável
- ✅ Funciona para todos os tipos de canais
- ✅ Cache automático para economizar quota

## Solução de Problemas

### API Key não funciona?
1. Verifique se copiou a key completa (começa com `AIza`)
2. Confirme que ativou a YouTube Data API v3
3. Aguarde alguns minutos após ativar a API
4. Verifique se não excedeu a quota diária

### Ainda mostra "Assinantes não disponíveis"?
- Pode ser que o canal tenha ocultado a contagem de assinantes (configuração do canal)
- Nesse caso, nem a API consegue obter os dados

### Quota excedida?
- Aguarde até o próximo dia (quota reseta à meia-noite, horário do Pacífico)
- Ou contrate mais quota no Google Cloud (pago)

## Segurança

✅ Sua API key é armazenada **localmente** no Chrome (chrome.storage.sync)
✅ **Nunca** é enviada para servidores externos
✅ Apenas é usada para fazer requisições à API oficial do Google
✅ Você pode remover a key a qualquer momento

---

**Dica**: Use sempre a API key para resultados melhores! A extensão funciona sem ela, mas com dados menos precisos.
