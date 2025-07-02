// Content Script para a extensão Começa AI - Meu Prompt
// Este script roda em todas as páginas web para facilitar o uso dos prompts

(function() {
    'use strict';
    
    // Verifica se já foi inicializado para evitar duplicação
    if (window.comecaAIInitialized) {
        return;
    }
    window.comecaAIInitialized = true;
    
    console.log('Começa AI Content Script carregado');
    
    // Detecta sites de IA populares
    const aiSites = {
        'chat.openai.com': {
            name: 'ChatGPT',
            textareaSelector: 'textarea[placeholder*="message" i], textarea[data-id="root"], #prompt-textarea',
            submitSelector: 'button[data-testid="send-button"], button[aria-label*="send" i]'
        },
        'gemini.google.com': {
            name: 'Gemini',
            textareaSelector: 'div[contenteditable="true"], textarea',
            submitSelector: 'button[aria-label*="send" i], button[type="submit"]'
        },
        'claude.ai': {
            name: 'Claude',
            textareaSelector: 'div[contenteditable="true"], textarea[placeholder*="talk" i]',
            submitSelector: 'button[aria-label*="send" i]'
        },
        'bard.google.com': {
            name: 'Bard',
            textareaSelector: 'div[contenteditable="true"], textarea',
            submitSelector: 'button[aria-label*="send" i]'
        },
        'bing.com': {
            name: 'Bing Chat',
            textareaSelector: 'textarea[placeholder*="message" i], div[contenteditable="true"]',
            submitSelector: 'button[aria-label*="send" i]'
        }
    };
    
    // Verifica se estamos em um site de IA
    const currentSite = Object.keys(aiSites).find(site => window.location.hostname.includes(site));
    const isAISite = !!currentSite;
    
    // Função para encontrar o campo de input principal
    function findInputField() {
        if (!isAISite) return null;
        
        const siteConfig = aiSites[currentSite];
        const selectors = siteConfig.textareaSelector.split(', ');
        
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element && isVisible(element)) {
                return element;
            }
        }
        
        // Fallback: procura por qualquer textarea ou contenteditable visível
        const fallbackElements = document.querySelectorAll('textarea, div[contenteditable="true"]');
        for (const element of fallbackElements) {
            if (isVisible(element) && !element.closest('[role="toolbar"]')) {
                return element;
            }
        }
        
        return null;
    }
    
    // Verifica se elemento está visível
    function isVisible(element) {
        if (!element) return false;
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0' &&
               element.offsetWidth > 0 && 
               element.offsetHeight > 0;
    }
    
    // Função para inserir texto no campo
    function insertTextInField(text, field = null) {
        const targetField = field || findInputField();
        if (!targetField) {
            console.log('Campo de input não encontrado');
            return false;
        }
        
        if (targetField.tagName === 'TEXTAREA' || targetField.tagName === 'INPUT') {
            // Para elementos de input tradicionais
            const startPos = targetField.selectionStart;
            const endPos = targetField.selectionEnd;
            const currentText = targetField.value;
            
            const newText = currentText.substring(0, startPos) + text + currentText.substring(endPos);
            targetField.value = newText;
            
            // Posiciona cursor no final do texto inserido
            const newCursorPos = startPos + text.length;
            targetField.setSelectionRange(newCursorPos, newCursorPos);
            
            // Dispara eventos para notificar mudança
            targetField.dispatchEvent(new Event('input', { bubbles: true }));
            targetField.dispatchEvent(new Event('change', { bubbles: true }));
            
        } else if (targetField.contentEditable === 'true') {
            // Para elementos contenteditable (como Gemini, Claude)
            targetField.focus();
            
            // Usa execCommand se disponível
            if (document.execCommand) {
                document.execCommand('insertText', false, text);
            } else {
                // Fallback para browsers mais novos
                const range = document.getSelection().getRangeAt(0);
                range.deleteContents();
                range.insertNode(document.createTextNode(text));
                range.collapse(false);
            }
            
            // Dispara eventos
            targetField.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        return true;
    }
    
    // Cria botão de acesso rápido (apenas em sites de IA)
    function createQuickAccessButton() {
        if (!isAISite) return;
        
        const button = document.createElement('button');
        button.id = 'comeca-ai-quick-button';
        button.innerHTML = '🧠';
        button.title = 'Começa AI - Acessar Prompts';
        button.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            z-index: 10000;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.1)';
            button.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
            button.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
        });
        
        button.addEventListener('click', () => {
            // Abre a extensão (se possível)
            chrome.runtime.sendMessage({ action: 'openExtension' });
        });
        
        document.body.appendChild(button);
        
        // Remove o botão após 10 segundos para não incomodar
        setTimeout(() => {
            if (button.parentNode) {
                button.remove();
            }
        }, 10000);
    }
    
    // Listener para mensagens do background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        switch (request.action) {
            case 'insertPrompt':
                const success = insertTextInField(request.text);
                sendResponse({ success });
                break;
                
            case 'getInputField':
                const field = findInputField();
                sendResponse({ 
                    found: !!field,
                    tagName: field?.tagName,
                    type: field?.type,
                    placeholder: field?.placeholder || field?.getAttribute('aria-label')
                });
                break;
                
            case 'focusInputField':
                const inputField = findInputField();
                if (inputField) {
                    inputField.focus();
                    sendResponse({ success: true });
                } else {
                    sendResponse({ success: false, error: 'Campo não encontrado' });
                }
                break;
                
            default:
                sendResponse({ error: 'Ação não reconhecida' });
        }
    });
    
    // Observa mudanças no DOM para detectar novos campos de input
    const observer = new MutationObserver((mutations) => {
        // Verifica se novos campos de input foram adicionados
        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const textareas = node.querySelectorAll ? node.querySelectorAll('textarea, div[contenteditable="true"]') : [];
                        if (textareas.length > 0 || (node.tagName === 'TEXTAREA' || node.contentEditable === 'true')) {
                            console.log('Novo campo de input detectado');
                            // Aqui poderia adicionar funcionalidades específicas para novos campos
                        }
                    }
                }
            }
        }
    });
    
    // Inicia observação do DOM
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Adiciona atalhos de teclado
    document.addEventListener('keydown', (e) => {
        // Ctrl+Shift+P para abrir rapidamente a extensão
        if (e.ctrlKey && e.shiftKey && e.key === 'P') {
            e.preventDefault();
            chrome.runtime.sendMessage({ action: 'openExtension' });
        }
        
        // Ctrl+Shift+V para colar último prompt usado
        if (e.ctrlKey && e.shiftKey && e.key === 'V') {
            e.preventDefault();
            chrome.runtime.sendMessage({ action: 'pasteLastPrompt' });
        }
    });
    
    // Cria botão de acesso rápido após um delay
    setTimeout(createQuickAccessButton, 2000);
    
    // Notifica que o script foi carregado
    console.log(`Começa AI carregado em ${window.location.hostname}${isAISite ? ' (Site de IA detectado)' : ''}`);
    
})();