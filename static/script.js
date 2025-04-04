// Variáveis globais
let currentFile = null;
let pdfData = null;

// Elementos DOM
document.addEventListener('DOMContentLoaded', () => {
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('fileElem');
    const fileInfo = document.getElementById('file-info');
    const fileName = document.getElementById('file-name');
    const analyzeBtn = document.getElementById('analyze-btn');
    const loading = document.getElementById('loading');
    const resultsSection = document.getElementById('results-section');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const downloadBtn = document.getElementById('download-btn');
    const newAnalysisBtn = document.getElementById('new-analysis-btn');

    // Eventos para drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropArea.classList.add('highlight');
    }

    function unhighlight() {
        dropArea.classList.remove('highlight');
    }

    // Manipulação de arquivos arrastados
    dropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    // Botão de análise
    analyzeBtn.addEventListener('click', () => {
        if (currentFile) {
            // Mostrar loading
            fileInfo.classList.add('hidden');
            loading.classList.remove('hidden');
            
            // Simular processamento do arquivo
            setTimeout(() => {
                // Processar o arquivo (em uma aplicação real, isso seria feito no backend)
                processPDF(currentFile);
            }, 2000);
        }
    });

    // Troca de abas
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remover classe active de todos os botões e conteúdos
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Adicionar classe active ao botão clicado e ao conteúdo correspondente
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Botão de nova análise
    newAnalysisBtn.addEventListener('click', () => {
        // Resetar o estado
        currentFile = null;
        pdfData = null;
        fileInput.value = '';
        
        // Esconder resultados e mostrar upload
        resultsSection.classList.add('hidden');
        dropArea.classList.remove('hidden');
        fileInfo.classList.add('hidden');
    });

    // Botão de download
    downloadBtn.addEventListener('click', () => {
        // Em uma aplicação real, isso geraria um PDF ou documento para download
        alert('Funcionalidade de download será implementada no backend.');
    });
});

// Função para manipular arquivos selecionados
function handleFiles(files) {
    if (files.length > 0) {
        const file = files[0];
        
        // Verificar se é um PDF
        if (file.type === 'application/pdf') {
            currentFile = file;
            
            // Mostrar informações do arquivo
            const fileInfo = document.getElementById('file-info');
            const fileName = document.getElementById('file-name');
            
            fileName.textContent = `Arquivo: ${file.name}`;
            fileInfo.classList.remove('hidden');
        } else {
            alert('Por favor, selecione um arquivo PDF.');
        }
    }
}

// Função para processar o PDF (simulação)
function processPDF(file) {
    // Em uma aplicação real, o arquivo seria enviado para o backend para processamento
    // Aqui estamos apenas simulando o resultado
    
    // Dados simulados baseados no exemplo fornecido
    pdfData = {
        nome: 'André Plana',
        cargo: 'Senior Director Commercial - Sales e RGM na Mondelēz International',
        experiencia: [
            {
                empresa: 'Mondelēz International',
                cargo: 'Senior Director Commercial - Sales e RGM',
                periodo: 'Abril 2024 - Presente'
            },
            {
                empresa: 'Mondelēz International',
                cargo: 'Sales Director, Modern Trade',
                periodo: 'Fevereiro 2023 - Abril 2024'
            },
            {
                empresa: 'Mondelēz International',
                cargo: 'Revenue Growth Management Director',
                periodo: 'Fevereiro 2021 - Fevereiro 2023'
            },
            {
                empresa: 'Colgate-Palmolive',
                cargo: 'Revenue Management Director',
                periodo: 'Junho 2019 - Fevereiro 2021'
            },
            {
                empresa: 'PepsiCo',
                cargo: 'Associate Director, Revenue Management LatAm',
                periodo: 'Fevereiro 2018 - Junho 2019'
            }
        ],
        habilidades: [
            'Planejamento Estratégico',
            'Business Intelligence',
            'Planejamento de Negócios',
            'Revenue Growth Management',
            'Análise Estratégica e Financeira',
            'Negociação e Influência',
            'Gestão de Projetos Six Sigma',
            'Pricing',
            'Gestão de Produtos'
        ],
        formacao: [
            {
                instituicao: 'Fundação Getúlio Vargas',
                curso: 'MBA em Marketing, Finanças e Estratégias',
                periodo: '2007 - 2010'
            },
            {
                instituicao: 'Faculdade de Engenharia de Sorocaba',
                curso: 'Bacharel em Engenharia Civil',
                periodo: '2002 - 2006'
            }
        ],
        idiomas: [
            'Português (Nativo ou Bilíngue)',
            'Inglês (Nativo ou Bilíngue)',
            'Espanhol (Profissional Completo)'
        ]
    };
    
    // Preencher as seções de resultados
    preencherBriefing(pdfData);
    preencherInsights(pdfData);
    preencherPerfil(pdfData);
    
    // Esconder loading e mostrar resultados
    const loading = document.getElementById('loading');
    const dropArea = document.getElementById('drop-area');
    const resultsSection = document.getElementById('results-section');
    
    loading.classList.add('hidden');
    dropArea.classList.add('hidden');
    resultsSection.classList.remove('hidden');
}

// Função para preencher o briefing
function preencherBriefing(data) {
    const briefingContent = document.getElementById('briefing-content');
    
    let html = `
        <div class="profile-header">
            <h3>${data.nome}</h3>
            <p class="current-position">${data.cargo}</p>
        </div>
        
        <div class="summary">
            <h4>Resumo Profissional</h4>
            <p>Profissional com ampla experiência em Revenue Growth Management e vendas, 
            atualmente ocupando posição de liderança na Mondelēz International. 
            Possui trajetória em empresas de grande porte no setor de bens de consumo, 
            como PepsiCo e Colgate-Palmolive, além de passagem pela Microsoft.</p>
        </div>
        
        <div class="key-experience">
            <h4>Experiência-Chave</h4>
            <ul>
                ${data.experiencia.slice(0, 3).map(exp => `
                    <li>
                        <strong>${exp.cargo}</strong> na ${exp.empresa}
                        <span class="period">(${exp.periodo})</span>
                    </li>
                `).join('')}
            </ul>
        </div>
        
        <div class="key-skills">
            <h4>Principais Competências</h4>
            <div class="skills-container">
                ${data.habilidades.slice(0, 5).map(skill => `
                    <span class="skill-tag">${skill}</span>
                `).join('')}
            </div>
        </div>
    `;
    
    briefingContent.innerHTML = html;
}

// Função para preencher os insights
function preencherInsights(data) {
    const insightsContent = document.getElementById('insights-content');
    
    let html = `
        <div class="insights-section">
            <h4>Pontos de Conexão para Reunião Comercial</h4>
            <ul>
                <li>
                    <strong>Experiência em Revenue Growth Management:</strong> 
                    Possui vasta experiência em estratégias de crescimento de receita, o que pode ser 
                    valioso para discussões sobre otimização de preços e estratégias comerciais.
                </li>
                <li>
                    <strong>Background em múltiplas indústrias:</strong> 
                    Sua experiência em empresas como Mondelēz, PepsiCo, Colgate-Palmolive e Microsoft 
                    proporciona uma visão ampla de diferentes modelos de negócio e práticas comerciais.
                </li>
                <li>
                    <strong>Conhecimento em Pricing:</strong> 
                    Sua especialidade em pricing pode ser um ponto de entrada para discussões sobre 
                    estratégias de precificação e valor percebido.
                </li>
            </ul>
        </div>
        
        <div class="insights-section">
            <h4>Abordagens Recomendadas</h4>
            <ul>
                <li>
                    <strong>Foco em dados e análises:</strong> 
                    Considerando sua formação e experiência, uma abordagem baseada em dados e análises 
                    quantitativas tende a ser bem recebida.
                </li>
                <li>
                    <strong>Demonstração de valor estratégico:</strong> 
                    Enfatizar como sua proposta pode contribuir para o crescimento de receita e 
                    otimização de resultados comerciais.
                </li>
                <li>
                    <strong>Multilinguismo como vantagem:</strong> 
                    Sua fluência em português, inglês e espanhol indica capacidade de lidar com 
                    negociações internacionais e equipes multiculturais.
                </li>
            </ul>
        </div>
        
        <div class="insights-section">
            <h4>Tópicos Potenciais para Discussão</h4>
            <ul>
                <li>Estratégias de crescimento de receita no setor de bens de consumo</li>
                <li>Otimização de portfólio de produtos e precificação</li>
                <li>Tendências de mercado em vendas para o varejo moderno</li>
                <li>Integração de tecnologia e dados em estratégias comerciais</li>
                <li>Desafios e oportunidades no mercado brasileiro de bens de consumo</li>
            </ul>
        </div>
    `;
    
    insightsContent.innerHTML = html;
}

// Função para preencher o perfil completo
function preencherPerfil(data) {
    const perfilContent = document.getElementById('perfil-content');
    
    let html = `
        <div class="profile-section">
            <h4>Informações Pessoais</h4>
            <p><strong>Nome:</strong> ${data.nome}</p>
            <p><strong>Cargo Atual:</strong> ${data.cargo}</p>
            <p><strong>Idiomas:</strong> ${data.idiomas.join(', ')}</p>
        </div>
        
        <div class="profile-section">
            <h4>Experiência Profissional</h4>
            <ul class="timeline">
                ${data.experiencia.map(exp => `
                    <li class="timeline-item">
                        <div class="timeline-content">
                            <h5>${exp.cargo}</h5>
                            <p class="company">${exp.empresa}</p>
                            <p class="period">${exp.periodo}</p>
                        </div>
                    </li>
                `).join('')}
            </ul>
        </div>
        
        <div class="profile-section">
            <h4>Formação Acadêmica</h4>
            <ul>
                ${data.formacao.map(form => `
                    <li>
                        <strong>${form.curso}</strong>
                        <p>${form.instituicao} (${form.periodo})</p>
                    </li>
                `).join('')}
            </ul>
        </div>
        
        <div class="profile-section">
            <h4>Habilidades</h4>
            <div class="skills-container">
                ${data.habilidades.map(skill => `
                    <span class="skill-tag">${skill}</span>
                `).join('')}
            </div>
        </div>
    `;
    
    perfilContent.innerHTML = html;
}
