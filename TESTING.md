# 🧪 Guia de Testes - Começa AI - Meu Prompt

## ✅ Checklist de Instalação

### 1. Pré-requisitos
- [ ] Google Chrome versão 88 ou superior
- [ ] Modo desenvolvedor ativado em `chrome://extensions/`
- [ ] Arquivos da extensão baixados e extraídos

### 2. Instalação
- [ ] Extensão carregada sem erros
- [ ] Ícone aparece na barra do Chrome
- [ ] Popup abre ao clicar no ícone
- [ ] Interface carrega corretamente (800x600px)

## 🔧 Testes Funcionais

### Interface Principal
- [ ] **Header**: Logo e botões de marketplace/configurações visíveis
- [ ] **Sidebar**: Barra de pesquisa, lista de pastas, botão "Novo Prompt"
- [ ] **Área principal**: Título da seção e controles de visualização
- [ ] **Estado vazio**: Mensagem e botão "Criar primeiro prompt" aparecem

### Gerenciamento de Prompts

#### Criar Novo Prompt
1. [ ] Clicar em "Novo Prompt" abre o modal
2. [ ] Preencher formulário com dados de teste:
   - Título: "Teste de Prompt"
   - Categoria: "Geral"
   - Pasta: "Todos os prompts"
   - Conteúdo: "Este é um prompt de teste para verificar funcionamento"
   - Tags: "teste, verificação"
3. [ ] Salvar exibe notificação de sucesso
4. [ ] Prompt aparece na lista principal
5. [ ] Contador da pasta "Todos os prompts" aumenta

#### Editar Prompt
1. [ ] Clicar no ícone de edição (✏️) abre modal preenchido
2. [ ] Modificar título para "Prompt Editado"
3. [ ] Salvar exibe notificação de atualização
4. [ ] Mudanças refletem na lista

#### Copiar Prompt
1. [ ] Clicar no ícone de cópia (📋)
2. [ ] Notificação "Prompt copiado..." aparece
3. [ ] Colar em editor de texto externo funciona

#### Favoritar Prompt
1. [ ] Clicar no ícone de estrela (⭐)
2. [ ] Estrela fica amarela/destacada
3. [ ] Prompt aparece na pasta "Favoritos"
4. [ ] Contador de "Favoritos" aumenta

#### Excluir Prompt
1. [ ] Clicar no ícone de lixeira (🗑️)
2. [ ] Confirmação de exclusão aparece
3. [ ] Prompt é removido da lista
4. [ ] Contadores são atualizados

### Sistema de Pastas

#### Criar Nova Pasta
1. [ ] Clicar no "+" ao lado de "Pastas"
2. [ ] Modal de criação abre
3. [ ] Inserir nome "Pasta de Teste"
4. [ ] Nova pasta aparece na lista
5. [ ] Pasta fica disponível no formulário de prompts

#### Organizar por Pastas
1. [ ] Criar prompt e atribuir à "Pasta de Teste"
2. [ ] Clicar na pasta filtra prompts corretamente
3. [ ] Título da área principal muda para nome da pasta
4. [ ] Contador da pasta mostra número correto

### Busca e Filtros

#### Pesquisa em Tempo Real
1. [ ] Digitar no campo de pesquisa
2. [ ] Resultados filtram instantaneamente
3. [ ] Busca funciona por:
   - [ ] Título do prompt
   - [ ] Conteúdo do prompt
   - [ ] Tags
4. [ ] Limpar pesquisa restaura todos os prompts

#### Modos de Visualização
1. [ ] Alternar entre visualização em grade e lista
2. [ ] Layout muda corretamente
3. [ ] Botão ativo fica destacado

### Marketplace

#### Acessar Marketplace
1. [ ] Clicar no ícone de loja (🛒) no header
2. [ ] Modal do marketplace abre
3. [ ] Prompts pré-carregados aparecem
4. [ ] Categorias funcionam como filtros

#### Importar Prompts
1. [ ] Clicar no ícone de download (⬇️) em um prompt
2. [ ] Notificação de importação aparece
3. [ ] Prompt importado aparece na lista principal
4. [ ] Modal fecha automaticamente

## ⚡ Testes de Automação

### Atalhos de Teclado
- [ ] `Ctrl+Shift+P` (ou `Cmd+Shift+P` no Mac) abre a extensão
- [ ] `Ctrl+Shift+V` (ou `Cmd+Shift+V` no Mac) copia último prompt

### Detecção de Sites de IA
1. [ ] Abrir ChatGPT (chat.openai.com)
2. [ ] Notificação/aviso da extensão aparece
3. [ ] Botão flutuante (🧠) aparece temporariamente
4. [ ] Testar com outros sites: Gemini, Claude, etc.

## 🎨 Testes de Interface

### Responsividade
- [ ] Redimensionar janela do Chrome
- [ ] Interface se adapta corretamente
- [ ] Sidebar e conteúdo permanecem utilizáveis
- [ ] Botões e textos não se sobrepõem

### Animações e Feedback
- [ ] Hover effects em botões funcionam
- [ ] Transições são suaves
- [ ] Loading states aparecem quando necessário
- [ ] Notificações aparecem e desaparecem automaticamente

### Acessibilidade
- [ ] Navegar usando apenas teclado (Tab)
- [ ] Elementos focáveis têm outline visível
- [ ] Labels e títulos são descritivos

## 🔧 Testes de Performance

### Carregamento
- [ ] Extensão carrega em menos de 2 segundos
- [ ] Interface responde rapidamente
- [ ] Busca em tempo real não trava

### Memória
- [ ] Verificar uso de memória em `chrome://extensions/`
- [ ] Não deve exceder 10MB
- [ ] Não deve ter vazamentos de memória

## 🐛 Testes de Erro

### Cenários de Erro
1. [ ] Tentar salvar prompt sem título
2. [ ] Tentar salvar prompt sem conteúdo
3. [ ] Criar pasta com nome vazio
4. [ ] Excluir pasta com prompts

### Recuperação
- [ ] Mensagens de erro são claras
- [ ] Interface não quebra após erros
- [ ] Dados não são perdidos

## 📱 Testes em Diferentes Dispositivos

### Desktop
- [ ] Windows 10/11 + Chrome
- [ ] macOS + Chrome
- [ ] Linux + Chrome/Chromium

### Resoluções
- [ ] 1920x1080 (Full HD)
- [ ] 1366x768 (HD)
- [ ] 2560x1440 (2K)

## 🔍 Console e Debug

### Verificações no Console
1. [ ] Abrir DevTools (`F12`)
2. [ ] Verificar aba Console
3. [ ] Não deve haver erros críticos
4. [ ] Warnings aceitáveis: Font Awesome CDN, permissões

### Logs Esperados
- [ ] "Começa AI Content Script carregado"
- [ ] "Service Worker da extensão Começa AI iniciado!"
- [ ] Messages de sucesso das operações

## 📋 Relatório de Testes

### Template de Relatório
```
Data: ___________
Testador: ___________
Versão Chrome: ___________
Sistema Operacional: ___________

Testes Passaram: ___/___
Testes Falharam: ___/___
Bugs Encontrados: ___________
Sugestões: ___________
```

### Bugs Comuns e Soluções
- **Extensão não carrega**: Verificar se todos os arquivos estão presentes
- **Popup não abre**: Recarregar extensão em chrome://extensions/
- **Atalhos não funcionam**: Verificar conflitos em chrome://extensions/shortcuts
- **Sites de IA não detectados**: Recarregar página do site

## ✅ Critérios de Aceitação

Para considerar a extensão pronta para uso, **todos** os itens críticos devem passar:

### Críticos (Obrigatórios)
- [ ] Extensão instala sem erros
- [ ] Interface carrega corretamente
- [ ] CRUD de prompts funciona
- [ ] Sistema de cópia funciona
- [ ] Pastas funcionam
- [ ] Busca funciona
- [ ] Marketplace funciona

### Importantes (Recomendados)
- [ ] Atalhos de teclado funcionam
- [ ] Sites de IA são detectados
- [ ] Performance é adequada
- [ ] Interface é responsiva

### Opcionais (Melhorias)
- [ ] Todas as animações funcionam
- [ ] Acessibilidade completa
- [ ] Testes em múltiplos dispositivos

---

**Status dos Testes**: 🟡 **PENDENTE**  
**Última Atualização**: ___________  
**Próxima Revisão**: ___________