// Service Worker para a extensão Começa AI - Meu Prompt

// Instalação da extensão
chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === 'install') {
        console.log('Começa AI - Meu Prompt instalado!');
        
        // Dados iniciais da extensão
        const initialData = {
            prompts: [
                {
                    id: 'welcome_1',
                    title: 'Bem-vindo ao Começa AI!',
                    category: 'geral',
                    folder: 'todos',
                    content: 'Olá! Este é um prompt de exemplo. Você pode editá-lo, copiá-lo ou excluí-lo. Use esta extensão para organizar seus prompts de IA favoritos!',
                    tags: 'exemplo, boas-vindas',
                    favorite: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ],
            folders: [
                { id: 'todos', name: 'Todos os prompts', icon: 'fas fa-folder-open', builtin: true },
                { id: 'favoritos', name: 'Favoritos', icon: 'fas fa-star', builtin: true }
            ]
        };
        
        try {
            await chrome.storage.local.set(initialData);
            console.log('Dados iniciais configurados');
        } catch (error) {
            console.error('Erro ao configurar dados iniciais:', error);
        }
    }
});

// Listener para comandos de teclado (atalhos)
chrome.commands.onCommand.addListener(async (command) => {
    switch (command) {
        case 'open-extension':
            // Abre a extensão quando o atalho for pressionado
            chrome.action.openPopup();
            break;
        
        case 'quick-copy-last':
            // Copia o último prompt usado
            try {
                const result = await chrome.storage.local.get(['prompts', 'lastUsedPrompt']);
                const prompts = result.prompts || [];
                const lastUsedId = result.lastUsedPrompt;
                
                if (lastUsedId) {
                    const prompt = prompts.find(p => p.id === lastUsedId);
                    if (prompt) {
                        // Injeta script para copiar o texto
                        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                        await chrome.scripting.executeScript({
                            target: { tabId: tab.id },
                            func: copyToClipboard,
                            args: [prompt.content]
                        });
                        
                        // Mostra notificação
                        chrome.notifications.create({
                            type: 'basic',
                            iconUrl: 'icons/icon48.png',
                            title: 'Começa AI',
                            message: `Prompt "${prompt.title}" copiado!`
                        });
                    }
                }
            } catch (error) {
                console.error('Erro ao copiar último prompt:', error);
            }
            break;
    }
});

// Função para copiar texto (será injetada na página)
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        console.log('Texto copiado para clipboard');
    }).catch(err => {
        // Fallback para browsers mais antigos
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    });
}

// Listener para mensagens do content script ou popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'copyPrompt':
            handleCopyPrompt(request.promptId);
            sendResponse({ success: true });
            break;
            
        case 'updateLastUsed':
            chrome.storage.local.set({ lastUsedPrompt: request.promptId });
            sendResponse({ success: true });
            break;
            
        case 'getActiveTab':
            chrome.tabs.query({ active: true, currentWindow: true })
                .then(tabs => sendResponse({ tab: tabs[0] }))
                .catch(error => sendResponse({ error: error.message }));
            return true; // Para resposta assíncrona
            
        default:
            sendResponse({ error: 'Ação não reconhecida' });
    }
});

// Função para lidar com cópia de prompt via background
async function handleCopyPrompt(promptId) {
    try {
        const result = await chrome.storage.local.get(['prompts']);
        const prompts = result.prompts || [];
        const prompt = prompts.find(p => p.id === promptId);
        
        if (prompt) {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Injeta script para copiar
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: copyToClipboard,
                args: [prompt.content]
            });
            
            // Atualiza último prompt usado
            await chrome.storage.local.set({ lastUsedPrompt: promptId });
            
            // Mostra notificação
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: 'Começa AI',
                message: `Prompt "${prompt.title}" copiado!`
            });
        }
    } catch (error) {
        console.error('Erro ao copiar prompt:', error);
    }
}

// Listener para cliques no ícone da extensão
chrome.action.onClicked.addListener(async (tab) => {
    // Este evento só dispara se não houver popup definido
    // Como temos popup, este código não será executado normalmente
    console.log('Extensão clicada na aba:', tab.url);
});

// Função para detectar sites de IA populares
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        const aiSites = [
            'chat.openai.com',
            'gemini.google.com', 
            'claude.ai',
            'bard.google.com',
            'bing.com/chat',
            'character.ai',
            'replika.ai'
        ];
        
        const isAISite = aiSites.some(site => tab.url.includes(site));
        
        if (isAISite) {
            // Injeta CSS para destacar a extensão quando em sites de IA
            try {
                await chrome.scripting.insertCSS({
                    target: { tabId: tabId },
                    css: `
                        /* Estilo injetado para destacar que a extensão está disponível */
                        body::before {
                            content: "💡 Começa AI disponível - clique na extensão para acessar seus prompts!";
                            position: fixed;
                            top: 10px;
                            right: 10px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 8px 12px;
                            border-radius: 6px;
                            font-size: 12px;
                            z-index: 10000;
                            animation: slideIn 0.5s ease-out;
                            max-width: 250px;
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                        }
                        
                        @keyframes slideIn {
                            from { opacity: 0; transform: translateX(100%); }
                            to { opacity: 1; transform: translateX(0); }
                        }
                    `
                });
                
                // Remove o CSS após 5 segundos
                setTimeout(async () => {
                    try {
                        await chrome.scripting.removeCSS({
                            target: { tabId: tabId },
                            css: `
                                body::before {
                                    content: "💡 Começa AI disponível - clique na extensão para acessar seus prompts!";
                                    position: fixed;
                                    top: 10px;
                                    right: 10px;
                                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                    color: white;
                                    padding: 8px 12px;
                                    border-radius: 6px;
                                    font-size: 12px;
                                    z-index: 10000;
                                    animation: slideIn 0.5s ease-out;
                                    max-width: 250px;
                                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                                }
                                
                                @keyframes slideIn {
                                    from { opacity: 0; transform: translateX(100%); }
                                    to { opacity: 1; transform: translateX(0); }
                                }
                            `
                        });
                    } catch (error) {
                        // Ignora erros de remoção de CSS
                    }
                }, 5000);
                
            } catch (error) {
                console.log('Não foi possível injetar CSS na página:', error);
            }
        }
    }
});

// Backup automático dos dados (diário)
function scheduleBackup() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(2, 0, 0, 0); // 2 AM
    
    const msUntilBackup = tomorrow.getTime() - now.getTime();
    
    setTimeout(async () => {
        try {
            const data = await chrome.storage.local.get(['prompts', 'folders']);
            console.log('Backup automático dos dados realizado:', data);
            
            // Reagenda para o próximo dia
            scheduleBackup();
        } catch (error) {
            console.error('Erro no backup automático:', error);
        }
    }, msUntilBackup);
}

// Inicia o agendamento de backup
scheduleBackup();

console.log('Service Worker da extensão Começa AI iniciado!');