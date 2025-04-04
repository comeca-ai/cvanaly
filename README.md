# CV Analyzer - Analisador de Currículos para Reuniões Comerciais

![CV Analyzer Logo](static/cv-analyzer-logo.png)

## Sobre o Projeto

CV Analyzer é uma aplicação web que permite analisar currículos em PDF extraídos do LinkedIn para gerar briefings profissionais e insights comerciais. Ideal para preparação de reuniões comerciais, entrevistas e networking.

## Demonstração

A aplicação está disponível online em: [https://atcuavul.manus.space](https://atcuavul.manus.space)

## Funcionalidades

- **Upload de Currículos**: Interface intuitiva para upload de arquivos PDF extraídos do LinkedIn
- **Análise Automática**: Extração e processamento de informações relevantes usando técnicas de NLP
- **Briefing Profissional**: Resumo da carreira, experiências-chave e competências principais
- **Insights Comerciais**: Pontos de conexão, abordagens recomendadas e tópicos potenciais para discussão
- **Exportação em PDF**: Geração de relatórios em PDF para download e compartilhamento

## Tecnologias Utilizadas

- **Frontend**: HTML, CSS e JavaScript
- **Backend**: Python com Flask
- **Processamento de Linguagem Natural**: spaCy
- **Processamento de PDF**: pdftotext (poppler-utils) e pdfkit
- **Geração de PDF**: wkhtmltopdf

## Requisitos

- Python 3.10 ou superior
- Flask
- spaCy com modelo pt_core_news_sm
- pdfkit
- wkhtmltopdf
- poppler-utils

## Instalação

1. Clone este repositório:
```bash
git clone https://github.com/seu-usuario/cv-analyzer.git
cd cv-analyzer
```

2. Instale as dependências:
```bash
pip install flask werkzeug pdfkit spacy
python -m spacy download pt_core_news_sm
sudo apt-get install -y wkhtmltopdf poppler-utils
```

3. Crie as pastas necessárias:
```bash
mkdir -p uploads reports
```

## Como Executar

1. Navegue até o diretório da aplicação
2. Execute o servidor Flask:
```bash
python -m flask run --host=0.0.0.0 --port=5000
```

3. Acesse a aplicação em seu navegador através do endereço: `http://localhost:5000`

## Estrutura do Projeto

```
cv-analyzer/
├── app.py                 # Aplicação Flask principal
├── cv_analyzer.py         # Sistema de análise de currículos com NLP
├── index.html             # Interface web para upload e visualização
├── static/                # Arquivos estáticos
│   ├── style.css          # Estilos CSS
│   ├── script.js          # JavaScript para interatividade
│   └── cv-analyzer-logo.png # Logo da aplicação
├── uploads/               # Diretório temporário para arquivos enviados
├── reports/               # Diretório para relatórios gerados em PDF
├── .github/               # Arquivos relacionados ao GitHub
└── .gitignore             # Configuração de arquivos ignorados pelo Git
```

## Como Utilizar

1. **Upload do Currículo**:
   - Clique no botão "Selecionar arquivo" ou arraste e solte um arquivo PDF na área indicada
   - Verifique se o arquivo foi carregado corretamente
   - Clique em "Analisar Currículo"

2. **Visualização dos Resultados**:
   - **Briefing**: Resumo profissional, experiências-chave e competências principais
   - **Insights Comerciais**: Pontos de conexão, abordagens recomendadas e tópicos para discussão
   - **Perfil Completo**: Informações detalhadas sobre experiência, formação e habilidades

3. **Exportação**:
   - Clique em "Baixar Relatório" para obter o PDF com todas as informações
   - Use o botão "Nova Análise" para processar outro currículo

## Limitações e Considerações

- A qualidade da análise depende da estrutura e formatação do PDF do LinkedIn
- O sistema funciona melhor com currículos em português e inglês
- Alguns campos específicos podem requerer ajustes no algoritmo de extração

## Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.

## Contato

Seu Nome - [seu-email@exemplo.com](mailto:seu-email@exemplo.com)

Link do Projeto: [https://github.com/seu-usuario/cv-analyzer](https://github.com/seu-usuario/cv-analyzer)

## Agradecimentos

- [LinkedIn](https://www.linkedin.com) por fornecer a funcionalidade de exportação de perfis em PDF
- [spaCy](https://spacy.io/) por fornecer ferramentas de processamento de linguagem natural
- [Flask](https://flask.palletsprojects.com/) por fornecer um framework web simples e eficiente
