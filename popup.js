// Estado da aplicação
let currentFolder = 'todos';
let prompts = [];
let folders = [];
let editingPrompt = null;

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    initializeEventListeners();
    renderUI();
});

// Carregamento de dados do storage
async function loadData() {
    try {
        const result = await chrome.storage.local.get(['prompts', 'folders']);
        prompts = result.prompts || [];
        folders = result.folders || [
            { id: 'todos', name: 'Todos os prompts', icon: 'fas fa-folder-open', builtin: true },
            { id: 'favoritos', name: 'Favoritos', icon: 'fas fa-star', builtin: true }
        ];
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        prompts = [];
        folders = [
            { id: 'todos', name: 'Todos os prompts', icon: 'fas fa-folder-open', builtin: true },
            { id: 'favoritos', name: 'Favoritos', icon: 'fas fa-star', builtin: true }
        ];
    }
}

// Salvamento de dados no storage
async function saveData() {
    try {
        await chrome.storage.local.set({ prompts, folders });
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
    }
}

// Inicialização dos event listeners
function initializeEventListeners() {
    // Botões principais
    document.getElementById('new-prompt-btn').addEventListener('click', showCreatePrompt);
    document.getElementById('add-folder-btn').addEventListener('click', showCreateFolder);
    document.getElementById('marketplace-btn').addEventListener('click', showMarketplace);
    
    // Modais
    document.getElementById('close-modal').addEventListener('click', closeModal);
    document.getElementById('prompt-modal').addEventListener('click', (e) => {
        if (e.target.id === 'prompt-modal') closeModal();
    });
    
    // Formulários
    document.getElementById('prompt-form').addEventListener('submit', handlePromptSubmit);
    document.getElementById('folder-form').addEventListener('submit', handleFolderSubmit);
    
    // Pesquisa
    document.getElementById('search-input').addEventListener('input', handleSearch);
    
    // Visualização
    document.getElementById('grid-view').addEventListener('click', () => setViewMode('grid'));
    document.getElementById('list-view').addEventListener('click', () => setViewMode('list'));
    
    // Pastas
    document.addEventListener('click', (e) => {
        if (e.target.closest('.folder-item')) {
            const folder = e.target.closest('.folder-item');
            selectFolder(folder.dataset.folder);
        }
    });
}

// Renderização da UI
function renderUI() {
    renderFolders();
    renderPrompts();
    updateFolderCounts();
}

// Renderização das pastas
function renderFolders() {
    const foldersList = document.getElementById('folders-list');
    const promptFolder = document.getElementById('prompt-folder');
    
    foldersList.innerHTML = '';
    promptFolder.innerHTML = '';
    
    folders.forEach(folder => {
        // Lista lateral
        const li = document.createElement('li');
        li.className = `folder-item ${folder.id === currentFolder ? 'active' : ''}`;
        li.dataset.folder = folder.id;
        
        li.innerHTML = `
            <i class="${folder.icon}"></i>
            <span>${folder.name}</span>
            <span class="count">0</span>
            ${!folder.builtin ? '<button class="btn-icon delete-folder" onclick="deleteFolder(\'' + folder.id + '\')"><i class="fas fa-trash"></i></button>' : ''}
        `;
        
        foldersList.appendChild(li);
        
        // Select do formulário
        const option = document.createElement('option');
        option.value = folder.id;
        option.textContent = folder.name;
        promptFolder.appendChild(option);
    });
}

// Renderização dos prompts
function renderPrompts() {
    const promptsGrid = document.getElementById('prompts-grid');
    const emptyState = document.getElementById('empty-state');
    const contentTitle = document.getElementById('content-title');
    
    const filteredPrompts = getFilteredPrompts();
    
    contentTitle.textContent = folders.find(f => f.id === currentFolder)?.name || 'Prompts';
    
    if (filteredPrompts.length === 0) {
        emptyState.style.display = 'block';
        promptsGrid.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        promptsGrid.style.display = 'grid';
        
        promptsGrid.innerHTML = filteredPrompts.map(prompt => createPromptCard(prompt)).join('');
    }
}

// Criação do card de prompt
function createPromptCard(prompt) {
    const tags = prompt.tags ? prompt.tags.split(',').map(tag => tag.trim()) : [];
    
    return `
        <div class="prompt-card" data-id="${prompt.id}">
            <div class="prompt-header">
                <div>
                    <div class="prompt-title">${escapeHtml(prompt.title)}</div>
                    <span class="prompt-category">${escapeHtml(prompt.category || 'Geral')}</span>
                </div>
                <div class="prompt-actions">
                    <button class="btn-icon" onclick="copyPrompt('${prompt.id}')" title="Copiar">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="btn-icon" onclick="toggleFavorite('${prompt.id}')" title="Favoritar">
                        <i class="fas fa-star ${prompt.favorite ? 'text-yellow-400' : ''}"></i>
                    </button>
                    <button class="btn-icon" onclick="editPrompt('${prompt.id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="deletePrompt('${prompt.id}')" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="prompt-content">${escapeHtml(prompt.content)}</div>
            <div class="prompt-footer">
                <div class="prompt-tags">
                    ${tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                </div>
            </div>
        </div>
    `;
}

// Filtragem de prompts
function getFilteredPrompts() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    
    let filtered = prompts.filter(prompt => {
        const matchesSearch = !searchTerm || 
            prompt.title.toLowerCase().includes(searchTerm) ||
            prompt.content.toLowerCase().includes(searchTerm) ||
            (prompt.tags && prompt.tags.toLowerCase().includes(searchTerm));
            
        const matchesFolder = currentFolder === 'todos' || 
            (currentFolder === 'favoritos' && prompt.favorite) ||
            prompt.folder === currentFolder;
            
        return matchesSearch && matchesFolder;
    });
    
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// Atualização dos contadores das pastas
function updateFolderCounts() {
    folders.forEach(folder => {
        const count = folder.id === 'todos' ? prompts.length :
                     folder.id === 'favoritos' ? prompts.filter(p => p.favorite).length :
                     prompts.filter(p => p.folder === folder.id).length;
                     
        const folderElement = document.querySelector(`[data-folder="${folder.id}"] .count`);
        if (folderElement) {
            folderElement.textContent = count;
        }
    });
}

// Seleção de pasta
function selectFolder(folderId) {
    currentFolder = folderId;
    
    document.querySelectorAll('.folder-item').forEach(item => {
        item.classList.remove('active');
    });
    
    document.querySelector(`[data-folder="${folderId}"]`).classList.add('active');
    
    renderPrompts();
}

// Exibição do modal de criação de prompt
function showCreatePrompt() {
    editingPrompt = null;
    document.getElementById('modal-title').textContent = 'Novo Prompt';
    document.getElementById('prompt-form').reset();
    document.getElementById('prompt-folder').value = currentFolder === 'favoritos' ? 'todos' : currentFolder;
    document.getElementById('prompt-modal').classList.add('active');
    document.getElementById('prompt-title').focus();
}

// Edição de prompt
function editPrompt(promptId) {
    const prompt = prompts.find(p => p.id === promptId);
    if (!prompt) return;
    
    editingPrompt = prompt;
    document.getElementById('modal-title').textContent = 'Editar Prompt';
    document.getElementById('prompt-title').value = prompt.title;
    document.getElementById('prompt-category').value = prompt.category || 'geral';
    document.getElementById('prompt-folder').value = prompt.folder || 'todos';
    document.getElementById('prompt-content').value = prompt.content;
    document.getElementById('prompt-tags').value = prompt.tags || '';
    
    document.getElementById('prompt-modal').classList.add('active');
    document.getElementById('prompt-title').focus();
}

// Fechamento do modal
function closeModal() {
    document.getElementById('prompt-modal').classList.remove('active');
    editingPrompt = null;
}

// Submissão do formulário de prompt
async function handlePromptSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('prompt-title').value.trim();
    const category = document.getElementById('prompt-category').value;
    const folder = document.getElementById('prompt-folder').value;
    const content = document.getElementById('prompt-content').value.trim();
    const tags = document.getElementById('prompt-tags').value.trim();
    
    if (!title || !content) {
        alert('Título e conteúdo são obrigatórios!');
        return;
    }
    
    const promptData = {
        id: editingPrompt ? editingPrompt.id : generateId(),
        title,
        category,
        folder,
        content,
        tags,
        favorite: editingPrompt ? editingPrompt.favorite : false,
        createdAt: editingPrompt ? editingPrompt.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    if (editingPrompt) {
        const index = prompts.findIndex(p => p.id === editingPrompt.id);
        prompts[index] = promptData;
    } else {
        prompts.push(promptData);
    }
    
    await saveData();
    closeModal();
    renderUI();
    
    showNotification(editingPrompt ? 'Prompt atualizado!' : 'Prompt criado!');
}

// Cópia de prompt para clipboard
async function copyPrompt(promptId) {
    const prompt = prompts.find(p => p.id === promptId);
    if (!prompt) return;
    
    try {
        await navigator.clipboard.writeText(prompt.content);
        showNotification('Prompt copiado para a área de transferência!');
    } catch (error) {
        // Fallback para browsers mais antigos
        const textArea = document.createElement('textarea');
        textArea.value = prompt.content;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Prompt copiado para a área de transferência!');
    }
}

// Toggle de favorito
async function toggleFavorite(promptId) {
    const prompt = prompts.find(p => p.id === promptId);
    if (!prompt) return;
    
    prompt.favorite = !prompt.favorite;
    prompt.updatedAt = new Date().toISOString();
    
    await saveData();
    renderUI();
    
    showNotification(prompt.favorite ? 'Adicionado aos favoritos!' : 'Removido dos favoritos!');
}

// Exclusão de prompt
async function deletePrompt(promptId) {
    if (!confirm('Tem certeza que deseja excluir este prompt?')) return;
    
    prompts = prompts.filter(p => p.id !== promptId);
    await saveData();
    renderUI();
    
    showNotification('Prompt excluído!');
}

// Pesquisa
function handleSearch() {
    renderPrompts();
}

// Exibição do modal de criação de pasta
function showCreateFolder() {
    document.getElementById('folder-modal').classList.add('active');
    document.getElementById('folder-name').focus();
}

// Fechamento do modal de pasta
function closeFolderModal() {
    document.getElementById('folder-modal').classList.remove('active');
    document.getElementById('folder-form').reset();
}

// Submissão do formulário de pasta
async function handleFolderSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('folder-name').value.trim();
    if (!name) return;
    
    const folder = {
        id: generateId(),
        name,
        icon: 'fas fa-folder',
        builtin: false
    };
    
    folders.push(folder);
    await saveData();
    closeFolderModal();
    renderUI();
    
    showNotification('Pasta criada!');
}

// Exclusão de pasta
async function deleteFolder(folderId) {
    if (!confirm('Tem certeza que deseja excluir esta pasta? Os prompts serão movidos para "Todos os prompts".')) return;
    
    // Move prompts para "todos"
    prompts.forEach(prompt => {
        if (prompt.folder === folderId) {
            prompt.folder = 'todos';
        }
    });
    
    folders = folders.filter(f => f.id !== folderId);
    
    if (currentFolder === folderId) {
        currentFolder = 'todos';
    }
    
    await saveData();
    renderUI();
    
    showNotification('Pasta excluída!');
}

// Modo de visualização
function setViewMode(mode) {
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${mode}-view`).classList.add('active');
    
    const promptsGrid = document.getElementById('prompts-grid');
    if (mode === 'list') {
        promptsGrid.style.gridTemplateColumns = '1fr';
    } else {
        promptsGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
    }
}

// Marketplace
function showMarketplace() {
    document.getElementById('marketplace-modal').classList.add('active');
    loadMarketplacePrompts();
}

function closeMarketplaceModal() {
    document.getElementById('marketplace-modal').classList.remove('active');
}

// Carregamento de prompts do marketplace
function loadMarketplacePrompts() {
    const marketplacePrompts = [
        {
            id: 'mp1',
            title: 'Corretor de Texto Profissional',
            category: 'escrita',
            content: 'Você é um corretor de texto profissional. Corrija os erros de gramática, ortografia e melhore a clareza do seguinte texto, mantendo o tom original: [TEXTO]',
            tags: 'correção, gramática, escrita',
            author: 'Começa AI',
            downloads: 1250
        },
        {
            id: 'mp2',
            title: 'Gerador de Código Python',
            category: 'codigo',
            content: 'Crie um código Python limpo e bem documentado para: [DESCRIÇÃO]. Inclua comentários explicativos e siga as melhores práticas de programação.',
            tags: 'python, programação, código',
            author: 'Dev Community',
            downloads: 980
        },
        {
            id: 'mp3',
            title: 'Estratégia de Marketing Digital',
            category: 'marketing',
            content: 'Desenvolva uma estratégia completa de marketing digital para [PRODUTO/SERVIÇO], incluindo público-alvo, canais, cronograma e KPIs.',
            tags: 'marketing, estratégia, digital',
            author: 'Marketing Pro',
            downloads: 750
        },
        {
            id: 'mp4',
            title: 'Plano de Aula Personalizado',
            category: 'educacao',
            content: 'Crie um plano de aula detalhado para ensinar [TÓPICO] para [FAIXA ETÁRIA], incluindo objetivos, atividades, recursos e avaliação.',
            tags: 'educação, aula, ensino',
            author: 'EduTech',
            downloads: 650
        }
    ];
    
    const container = document.getElementById('marketplace-prompts');
    container.innerHTML = marketplacePrompts.map(prompt => `
        <div class="prompt-card">
            <div class="prompt-header">
                <div>
                    <div class="prompt-title">${prompt.title}</div>
                    <span class="prompt-category">${prompt.category}</span>
                </div>
                <button class="btn-icon" onclick="importPrompt('${prompt.id}')" title="Importar">
                    <i class="fas fa-download"></i>
                </button>
            </div>
            <div class="prompt-content">${prompt.content}</div>
            <div class="prompt-footer">
                <div class="prompt-tags">
                    ${prompt.tags.split(',').map(tag => `<span class="tag">${tag.trim()}</span>`).join('')}
                </div>
                <small>por ${prompt.author} • ${prompt.downloads} downloads</small>
            </div>
        </div>
    `).join('');
}

// Importação de prompt do marketplace
async function importPrompt(promptId) {
    const marketplacePrompts = {
        'mp1': {
            title: 'Corretor de Texto Profissional',
            category: 'escrita',
            content: 'Você é um corretor de texto profissional. Corrija os erros de gramática, ortografia e melhore a clareza do seguinte texto, mantendo o tom original: [TEXTO]',
            tags: 'correção, gramática, escrita'
        },
        'mp2': {
            title: 'Gerador de Código Python',
            category: 'codigo',
            content: 'Crie um código Python limpo e bem documentado para: [DESCRIÇÃO]. Inclua comentários explicativos e siga as melhores práticas de programação.',
            tags: 'python, programação, código'
        },
        'mp3': {
            title: 'Estratégia de Marketing Digital',
            category: 'marketing',
            content: 'Desenvolva uma estratégia completa de marketing digital para [PRODUTO/SERVIÇO], incluindo público-alvo, canais, cronograma e KPIs.',
            tags: 'marketing, estratégia, digital'
        },
        'mp4': {
            title: 'Plano de Aula Personalizado',
            category: 'educacao',
            content: 'Crie um plano de aula detalhado para ensinar [TÓPICO] para [FAIXA ETÁRIA], incluindo objetivos, atividades, recursos e avaliação.',
            tags: 'educação, aula, ensino'
        }
    };
    
    const promptData = marketplacePrompts[promptId];
    if (!promptData) return;
    
    const newPrompt = {
        id: generateId(),
        title: promptData.title,
        category: promptData.category,
        folder: 'todos',
        content: promptData.content,
        tags: promptData.tags,
        favorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    prompts.push(newPrompt);
    await saveData();
    closeMarketplaceModal();
    renderUI();
    
    showNotification('Prompt importado com sucesso!');
}

// Funções utilitárias
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message) {
    // Cria notificação temporária
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #667eea;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Listeners para categorias do marketplace
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('category-btn')) {
        document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        // Implementar filtragem por categoria se necessário
    }
});