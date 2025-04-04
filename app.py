from flask import Flask, request, jsonify, render_template, send_from_directory, send_file
import os
import tempfile
import uuid
import json
from werkzeug.utils import secure_filename
import subprocess
import re
from cv_analyzer import CVAnalyzer
import pdfkit
from datetime import datetime

app = Flask(__name__, static_folder='static')

# Configuração para upload de arquivos
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Limite de 16MB

# Pasta para relatórios gerados
REPORTS_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'reports')
if not os.path.exists(REPORTS_FOLDER):
    os.makedirs(REPORTS_FOLDER)

# Extensões permitidas
ALLOWED_EXTENSIONS = {'pdf'}

# Verificar se a extensão é permitida
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Extrair texto do PDF usando pdftotext
def extract_text_from_pdf(pdf_path):
    temp_txt = tempfile.NamedTemporaryFile(delete=False, suffix='.txt')
    temp_txt.close()
    
    try:
        # Usar pdftotext para extrair o texto
        subprocess.run(['pdftotext', '-layout', pdf_path, temp_txt.name], check=True)
        
        # Ler o conteúdo do arquivo de texto
        with open(temp_txt.name, 'r', encoding='utf-8', errors='ignore') as f:
            text = f.read()
        
        # Remover o arquivo temporário
        os.unlink(temp_txt.name)
        
        return text
    except Exception as e:
        if os.path.exists(temp_txt.name):
            os.unlink(temp_txt.name)
        return f"Erro ao extrair texto: {str(e)}"

# Gerar relatório em PDF
def generate_pdf_report(analysis_result, output_path):
    # Criar HTML para o relatório
    html_content = f"""
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Briefing Profissional - {analysis_result['profile']['nome']}</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }}
            h1, h2, h3, h4 {{
                color: #2563eb;
                margin-top: 20px;
            }}
            .header {{
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 1px solid #e2e8f0;
                padding-bottom: 20px;
            }}
            .section {{
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 1px solid #e2e8f0;
            }}
            .subsection {{
                margin-bottom: 20px;
            }}
            .skill-tag {{
                display: inline-block;
                background-color: #e2e8f0;
                padding: 5px 10px;
                border-radius: 4px;
                margin-right: 10px;
                margin-bottom: 10px;
            }}
            .experience-item {{
                margin-bottom: 15px;
            }}
            .company {{
                font-weight: bold;
            }}
            .period {{
                color: #64748b;
                font-style: italic;
            }}
            .footer {{
                text-align: center;
                margin-top: 30px;
                font-size: 0.8em;
                color: #64748b;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Briefing Profissional</h1>
            <h2>{analysis_result['profile']['nome']}</h2>
            <p>{analysis_result['profile']['cargo']}</p>
        </div>
        
        <div class="section">
            <h3>Resumo Profissional</h3>
            <p>{analysis_result['briefing']['resumo']}</p>
        </div>
        
        <div class="section">
            <h3>Experiência-Chave</h3>
    """
    
    # Adicionar experiências-chave
    for exp in analysis_result['briefing']['experiencia_chave']:
        html_content += f"""
            <div class="experience-item">
                <p class="company">{exp['empresa']}</p>
                <p><strong>{exp['cargo']}</strong></p>
                <p class="period">{exp['periodo']}</p>
            </div>
        """
    
    html_content += """
        </div>
        
        <div class="section">
            <h3>Principais Competências</h3>
            <div>
    """
    
    # Adicionar competências
    for skill in analysis_result['briefing']['competencias_principais']:
        html_content += f'<span class="skill-tag">{skill}</span>'
    
    html_content += """
            </div>
        </div>
        
        <div class="section">
            <h3>Insights para Reunião Comercial</h3>
    """
    
    # Adicionar pontos de conexão
    html_content += """
            <div class="subsection">
                <h4>Pontos de Conexão</h4>
    """
    
    for ponto in analysis_result['insights']['pontos_conexao']:
        html_content += f"""
                <div>
                    <p><strong>{ponto['titulo']}</strong></p>
                    <p>{ponto['descricao']}</p>
                </div>
        """
    
    # Adicionar abordagens recomendadas
    html_content += """
            </div>
            
            <div class="subsection">
                <h4>Abordagens Recomendadas</h4>
    """
    
    for abordagem in analysis_result['insights']['abordagens_recomendadas']:
        html_content += f"""
                <div>
                    <p><strong>{abordagem['titulo']}</strong></p>
                    <p>{abordagem['descricao']}</p>
                </div>
        """
    
    # Adicionar tópicos para discussão
    html_content += """
            </div>
            
            <div class="subsection">
                <h4>Tópicos Potenciais para Discussão</h4>
                <ul>
    """
    
    for topico in analysis_result['insights']['topicos_discussao']:
        html_content += f"<li>{topico}</li>"
    
    html_content += """
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <p>Gerado por CV Analyzer em {}</p>
        </div>
    </body>
    </html>
    """.format(datetime.now().strftime("%d/%m/%Y %H:%M"))
    
    # Gerar PDF a partir do HTML
    try:
        # Verificar se wkhtmltopdf está instalado
        subprocess.run(['which', 'wkhtmltopdf'], check=True)
    except:
        # Instalar wkhtmltopdf se não estiver disponível
        subprocess.run(['apt-get', 'update'], check=True)
        subprocess.run(['apt-get', 'install', '-y', 'wkhtmltopdf'], check=True)
    
    # Salvar HTML temporário
    temp_html = tempfile.NamedTemporaryFile(delete=False, suffix='.html')
    temp_html.close()
    
    with open(temp_html.name, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    # Converter HTML para PDF
    try:
        pdfkit.from_file(temp_html.name, output_path)
        os.unlink(temp_html.name)
        return True
    except Exception as e:
        if os.path.exists(temp_html.name):
            os.unlink(temp_html.name)
        print(f"Erro ao gerar PDF: {str(e)}")
        return False

# Rota principal
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

# Rota para upload de arquivo
@app.route('/upload', methods=['POST'])
def upload_file():
    # Verificar se há arquivo na requisição
    if 'file' not in request.files:
        return jsonify({'error': 'Nenhum arquivo enviado'}), 400
    
    file = request.files['file']
    
    # Verificar se o arquivo tem nome
    if file.filename == '':
        return jsonify({'error': 'Nenhum arquivo selecionado'}), 400
    
    # Verificar se o arquivo é permitido
    if file and allowed_file(file.filename):
        # Gerar nome de arquivo seguro com UUID para evitar conflitos
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        
        # Salvar o arquivo
        file.save(file_path)
        
        # Extrair texto do PDF
        text = extract_text_from_pdf(file_path)
        
        # Analisar o currículo
        analyzer = CVAnalyzer()
        analysis_result = analyzer.process_cv(text)
        
        # Gerar relatório em PDF
        report_filename = f"briefing_{uuid.uuid4()}.pdf"
        report_path = os.path.join(REPORTS_FOLDER, report_filename)
        
        generate_pdf_report(analysis_result, report_path)
        
        # Adicionar caminho do relatório ao resultado
        analysis_result['report_path'] = report_path
        analysis_result['report_filename'] = report_filename
        
        # Remover o arquivo após processamento
        os.remove(file_path)
        
        return jsonify(analysis_result)
    
    return jsonify({'error': 'Tipo de arquivo não permitido. Apenas PDFs são aceitos.'}), 400

# Rota para download do relatório
@app.route('/download/<filename>')
def download_report(filename):
    return send_from_directory(REPORTS_FOLDER, filename, as_attachment=True)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
