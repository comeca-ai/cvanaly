import re
import spacy
import json
from datetime import datetime

# Carregar modelo spaCy para processamento de linguagem natural
try:
    nlp = spacy.load("pt_core_news_sm")
except:
    # Se o modelo não estiver instalado, instalar e carregar
    import subprocess
    subprocess.run(["python", "-m", "spacy", "download", "pt_core_news_sm"])
    nlp = spacy.load("pt_core_news_sm")

class CVAnalyzer:
    def __init__(self):
        self.sections = {
            'personal_info': ['contato', 'contact', 'informações pessoais', 'personal information'],
            'summary': ['summary', 'resumo', 'sobre', 'about'],
            'experience': ['experience', 'experiência', 'professional experience', 'experiência profissional'],
            'education': ['education', 'educação', 'formação', 'academic background', 'formação acadêmica'],
            'skills': ['skills', 'habilidades', 'competências', 'top skills', 'principais habilidades'],
            'languages': ['languages', 'idiomas', 'language proficiency', 'proficiência em idiomas'],
            'certifications': ['certifications', 'certificações', 'certificates', 'certificados']
        }
        
        self.months = {
            'january': 'janeiro', 'february': 'fevereiro', 'march': 'março', 'april': 'abril',
            'may': 'maio', 'june': 'junho', 'july': 'julho', 'august': 'agosto',
            'september': 'setembro', 'october': 'outubro', 'november': 'novembro', 'december': 'dezembro',
            'jan': 'jan', 'feb': 'fev', 'mar': 'mar', 'apr': 'abr', 'jun': 'jun',
            'jul': 'jul', 'aug': 'ago', 'sep': 'set', 'oct': 'out', 'nov': 'nov', 'dec': 'dez'
        }
        
        self.job_titles = [
            'director', 'manager', 'lead', 'specialist', 'coordinator', 'analyst', 'engineer',
            'diretor', 'gerente', 'líder', 'especialista', 'coordenador', 'analista', 'engenheiro',
            'ceo', 'cfo', 'cto', 'coo', 'vp', 'vice president', 'vice-presidente', 'head', 'chief'
        ]
        
        self.industries = [
            'technology', 'finance', 'healthcare', 'education', 'retail', 'manufacturing',
            'tecnologia', 'finanças', 'saúde', 'educação', 'varejo', 'manufatura',
            'consumer goods', 'bens de consumo', 'food', 'alimentos', 'beverage', 'bebidas',
            'consulting', 'consultoria', 'marketing', 'sales', 'vendas'
        ]

    def extract_sections(self, text):
        """Divide o texto do currículo em seções"""
        sections = {}
        current_section = 'header'
        sections[current_section] = []
        
        lines = text.split('\n')
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Verificar se a linha é um cabeçalho de seção
            is_section_header = False
            for section_name, keywords in self.sections.items():
                if any(keyword.lower() in line.lower() for keyword in keywords):
                    current_section = section_name
                    sections[current_section] = []
                    is_section_header = True
                    break
            
            if not is_section_header:
                sections[current_section].append(line)
        
        return sections

    def extract_personal_info(self, sections):
        """Extrai informações pessoais do currículo"""
        personal_info = {
            'nome': '',
            'cargo_atual': '',
            'localizacao': '',
            'email': '',
            'telefone': '',
            'linkedin': ''
        }
        
        # Procurar nome no cabeçalho
        header = '\n'.join(sections.get('header', []))
        nome_match = re.search(r'([A-Z][a-z]+ [A-Z][a-z]+)', header)
        if nome_match:
            personal_info['nome'] = nome_match.group(1)
        
        # Procurar cargo atual
        cargo_match = None
        for line in sections.get('header', []):
            for title in self.job_titles:
                if title.lower() in line.lower():
                    cargo_match = line
                    break
            if cargo_match:
                break
        
        if cargo_match:
            personal_info['cargo_atual'] = cargo_match
        
        # Procurar email
        email_pattern = r'([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)'
        for section in sections.values():
            section_text = '\n'.join(section)
            email_match = re.search(email_pattern, section_text)
            if email_match:
                personal_info['email'] = email_match.group(1)
                break
        
        # Procurar telefone
        phone_patterns = [
            r'(\+\d{1,3} \d{3} \d{3} \d{4})',
            r'(\(\d{2,3}\) \d{4,5}-\d{4})',
            r'(\d{2,3} \d{4,5} \d{4})'
        ]
        
        for pattern in phone_patterns:
            for section in sections.values():
                section_text = '\n'.join(section)
                phone_match = re.search(pattern, section_text)
                if phone_match:
                    personal_info['telefone'] = phone_match.group(1)
                    break
            if personal_info['telefone']:
                break
        
        # Procurar LinkedIn
        linkedin_pattern = r'(linkedin\.com/in/[a-zA-Z0-9_-]+)'
        for section in sections.values():
            section_text = '\n'.join(section)
            linkedin_match = re.search(linkedin_pattern, section_text)
            if linkedin_match:
                personal_info['linkedin'] = linkedin_match.group(1)
                break
        
        # Procurar localização
        location_patterns = [
            r'([A-Z][a-z]+ ?[A-Z]?[a-z]*, [A-Z][a-z]+ ?[A-Z]?[a-z]*)',
            r'([A-Z][a-z]+, [A-Z][a-z]+)'
        ]
        
        for pattern in location_patterns:
            for section in sections.values():
                section_text = '\n'.join(section)
                location_match = re.search(pattern, section_text)
                if location_match:
                    personal_info['localizacao'] = location_match.group(1)
                    break
            if personal_info['localizacao']:
                break
        
        return personal_info

    def extract_experience(self, sections):
        """Extrai experiência profissional do currículo"""
        experiences = []
        
        if 'experience' not in sections:
            return experiences
        
        experience_text = '\n'.join(sections['experience'])
        
        # Padrões para encontrar empresas e cargos
        company_patterns = [
            r'([A-Z][a-zA-Z0-9 ]+)\n',
            r'at ([A-Z][a-zA-Z0-9 ]+)'
        ]
        
        # Padrão para datas
        date_pattern = r'([A-Za-z]+ \d{4}) - ([A-Za-z]+ \d{4}|Present|Presente)'
        
        # Processar o texto com spaCy para identificar organizações
        doc = nlp(experience_text)
        
        # Extrair empresas usando NER
        companies = []
        for ent in doc.ents:
            if ent.label_ == 'ORG':
                companies.append(ent.text)
        
        # Se não encontrou empresas com NER, usar regex
        if not companies:
            for pattern in company_patterns:
                companies.extend(re.findall(pattern, experience_text))
        
        # Extrair experiências
        current_company = None
        current_role = None
        current_dates = None
        current_description = []
        
        lines = experience_text.split('\n')
        for i, line in enumerate(lines):
            line = line.strip()
            if not line:
                continue
            
            # Verificar se é uma empresa
            if any(company in line for company in companies):
                # Se já temos uma empresa, salvar a experiência anterior
                if current_company and current_role:
                    experiences.append({
                        'empresa': current_company,
                        'cargo': current_role,
                        'periodo': current_dates or '',
                        'descricao': '\n'.join(current_description) if current_description else ''
                    })
                
                current_company = line
                current_role = None
                current_dates = None
                current_description = []
                continue
            
            # Verificar se é um cargo
            if current_company and not current_role:
                for title in self.job_titles:
                    if title.lower() in line.lower():
                        current_role = line
                        break
                if not current_role and i + 1 < len(lines) and any(title.lower() in lines[i+1].lower() for title in self.job_titles):
                    current_role = lines[i+1]
                continue
            
            # Verificar se são datas
            date_match = re.search(date_pattern, line)
            if date_match:
                start_date = date_match.group(1)
                end_date = date_match.group(2)
                
                # Traduzir meses para português se necessário
                for eng, pt in self.months.items():
                    start_date = start_date.replace(eng, pt)
                    end_date = end_date.replace(eng, pt)
                
                current_dates = f"{start_date} - {end_date}"
                continue
            
            # Se não for nenhum dos anteriores, é parte da descrição
            if current_company and current_role:
                current_description.append(line)
        
        # Adicionar a última experiência
        if current_company and current_role:
            experiences.append({
                'empresa': current_company,
                'cargo': current_role,
                'periodo': current_dates or '',
                'descricao': '\n'.join(current_description) if current_description else ''
            })
        
        return experiences

    def extract_education(self, sections):
        """Extrai formação acadêmica do currículo"""
        education = []
        
        if 'education' not in sections:
            return education
        
        education_text = '\n'.join(sections['education'])
        
        # Padrões para instituições e cursos
        institution_pattern = r'([A-Z][a-zA-Z0-9 ]+)'
        degree_pattern = r'([A-Za-z]+),? ([A-Za-z, ]+)'
        date_pattern = r'\((\d{4}) - (\d{4})\)'
        
        # Processar o texto com spaCy para identificar organizações
        doc = nlp(education_text)
        
        # Extrair instituições usando NER
        institutions = []
        for ent in doc.ents:
            if ent.label_ == 'ORG':
                institutions.append(ent.text)
        
        # Se não encontrou instituições com NER, usar regex
        if not institutions:
            institutions = re.findall(institution_pattern, education_text)
        
        # Extrair formação
        lines = education_text.split('\n')
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            if not line:
                i += 1
                continue
            
            # Verificar se é uma instituição
            institution = None
            for inst in institutions:
                if inst in line:
                    institution = inst
                    break
            
            if institution:
                # Procurar curso e datas nas próximas linhas
                degree = None
                start_date = None
                end_date = None
                
                # Verificar na mesma linha
                degree_match = re.search(degree_pattern, line)
                if degree_match:
                    degree = f"{degree_match.group(1)} em {degree_match.group(2)}"
                
                date_match = re.search(date_pattern, line)
                if date_match:
                    start_date = date_match.group(1)
                    end_date = date_match.group(2)
                
                # Verificar nas próximas linhas
                j = i + 1
                while j < len(lines) and j < i + 3:
                    next_line = lines[j].strip()
                    
                    if not degree:
                        degree_match = re.search(degree_pattern, next_line)
                        if degree_match:
                            degree = f"{degree_match.group(1)} em {degree_match.group(2)}"
                    
                    if not start_date or not end_date:
                        date_match = re.search(date_pattern, next_line)
                        if date_match:
                            start_date = date_match.group(1)
                            end_date = date_match.group(2)
                    
                    j += 1
                
                education.append({
                    'instituicao': institution,
                    'curso': degree or '',
                    'periodo': f"{start_date} - {end_date}" if start_date and end_date else ''
                })
            
            i += 1
        
        return education

    def extract_skills(self, sections):
        """Extrai habilidades do currículo"""
        skills = []
        
        # Verificar seção de habilidades
        if 'skills' in sections:
            skills_text = '\n'.join(sections['skills'])
            
            # Extrair habilidades listadas
            skill_patterns = [
                r'• ([^\n•]+)',
                r'- ([^\n-]+)',
                r'([A-Za-z][A-Za-z ]+)'
            ]
            
            for pattern in skill_patterns:
                found_skills = re.findall(pattern, skills_text)
                if found_skills:
                    skills.extend([skill.strip() for skill in found_skills if skill.strip()])
        
        # Verificar seção de resumo para habilidades adicionais
        if 'summary' in sections:
            summary_text = '\n'.join(sections['summary'])
            
            # Processar o texto com spaCy
            doc = nlp(summary_text)
            
            # Extrair substantivos e adjetivos que podem ser habilidades
            for token in doc:
                if token.pos_ in ['NOUN', 'ADJ'] and len(token.text) > 3:
                    skills.append(token.text)
        
        # Remover duplicatas e ordenar
        skills = list(set(skills))
        skills.sort()
        
        return skills

    def extract_languages(self, sections):
        """Extrai idiomas do currículo"""
        languages = []
        
        if 'languages' in sections:
            languages_text = '\n'.join(sections['languages'])
            
            # Padrões para idiomas
            language_patterns = [
                r'([A-Za-z]+) \(([A-Za-z ]+)\)',
                r'([A-Za-z]+) - ([A-Za-z ]+)'
            ]
            
            for pattern in language_patterns:
                matches = re.findall(pattern, languages_text)
                for match in matches:
                    languages.append(f"{match[0]} ({match[1]})")
            
            # Se não encontrou com os padrões, pegar linhas
            if not languages:
                for line in sections['languages']:
                    if line.strip():
                        languages.append(line.strip())
        
        return languages

    def extract_certifications(self, sections):
        """Extrai certificações do currículo"""
        certifications = []
        
        if 'certifications' in sections:
            for line in sections['certifications']:
                if line.strip():
                    certifications.append(line.strip())
        
        return certifications

    def analyze(self, text):
        """Analisa o texto do currículo e extrai todas as informações relevantes"""
        # Dividir o texto em seções
        sections = self.extract_sections(text)
        
        # Extrair informações de cada seção
        personal_info = self.extract_personal_info(sections)
        experience = self.extract_experience(sections)
        education = self.extract_education(sections)
        skills = self.extract_skills(sections)
        languages = self.extract_languages(sections)
        certifications = self.extract_certifications(sections)
        
        # Compilar resultados
        result = {
            'nome': personal_info['nome'],
            'cargo': personal_info['cargo_atual'],
            'contato': {
                'email': personal_info['email'],
                'telefone': personal_info['telefone'],
                'linkedin': personal_info['linkedin'],
                'localizacao': personal_info['localizacao']
            },
            'experiencia': experience,
            'habilidades': skills,
            'formacao': education,
            'idiomas': languages,
            'certificacoes': certifications
        }
        
        return result

    def generate_briefing(self, profile):
        """Gera um briefing profissional baseado no perfil extraído"""
        briefing = {
            'resumo': '',
            'experiencia_chave': [],
            'competencias_principais': []
        }
        
        # Criar resumo
        if profile['nome'] and profile['cargo']:
            briefing['resumo'] = f"Profissional com experiência em {', '.join(profile['habilidades'][:3] if len(profile['habilidades']) >= 3 else profile['habilidades'])}. "
            briefing['resumo'] += f"Atualmente ocupando o cargo de {profile['cargo']}. "
            
            if profile['experiencia']:
                empresas = [exp['empresa'] for exp in profile['experiencia'][:3]]
                briefing['resumo'] += f"Possui trajetória em empresas como {', '.join(empresas)}."
        
        # Selecionar experiências-chave
        briefing['experiencia_chave'] = profile['experiencia'][:3]
        
        # Selecionar competências principais
        briefing['competencias_principais'] = profile['habilidades'][:5]
        
        return briefing

    def generate_insights(self, profile):
        """Gera insights comerciais baseados no perfil extraído"""
        insights = {
            'pontos_conexao': [],
            'abordagens_recomendadas': [],
            'topicos_discussao': []
        }
        
        # Pontos de conexão
        if any('Revenue' in skill for skill in profile['habilidades']):
            insights['pontos_conexao'].append({
                'titulo': 'Experiência em Revenue Growth Management',
                'descricao': 'Possui vasta experiência em estratégias de crescimento de receita, o que pode ser valioso para discussões sobre otimização de preços e estratégias comerciais.'
            })
        
        if len(profile['experiencia']) > 3:
            empresas = set([exp['empresa'] for exp in profile['experiencia'][:4]])
            if len(empresas) >= 3:
                insights['pontos_conexao'].append({
                    'titulo': 'Background em múltiplas indústrias',
                    'descricao': f"Sua experiência em empresas como {', '.join(list(empresas)[:3])} proporciona uma visão ampla de diferentes modelos de negócio e práticas comerciais."
                })
        
        if any('Pricing' in skill for skill in profile['habilidades']):
            insights['pontos_conexao'].append({
                'titulo': 'Conhecimento em Pricing',
                'descricao': 'Sua especialidade em pricing pode ser um ponto de entrada para discussões sobre estratégias de precificação e valor percebido.'
            })
        
        # Abordagens recomendadas
        if any('MBA' in formacao.get('curso', '') for formacao in profile['formacao']):
            insights['abordagens_recomendadas'].append({
                'titulo': 'Foco em dados e análises',
                'descricao': 'Considerando sua formação e experiência, uma abordagem baseada em dados e análises quantitativas tende a ser bem recebida.'
            })
        
        if any('Revenue' in exp.get('cargo', '') for exp in profile['experiencia']):
            insights['abordagens_recomendadas'].append({
                'titulo': 'Demonstração de valor estratégico',
                'descricao': 'Enfatizar como sua proposta pode contribuir para o crescimento de receita e otimização de resultados comerciais.'
            })
        
        if len(profile['idiomas']) > 2:
            insights['abordagens_recomendadas'].append({
                'titulo': 'Multilinguismo como vantagem',
                'descricao': 'Sua fluência em múltiplos idiomas indica capacidade de lidar com negociações internacionais e equipes multiculturais.'
            })
        
        # Identificar indústrias de atuação
        industries_found = set()
        for exp in profile['experiencia']:
            for industry in self.industries:
                if industry.lower() in exp.get('empresa', '').lower() or industry.lower() in exp.get('cargo', '').lower():
                    industries_found.add(industry)
        
        # Tópicos para discussão baseados nas indústrias identificadas
        if 'consumer goods' in industries_found or 'bens de consumo' in industries_found:
            insights['topicos_discussao'].append('Estratégias de crescimento de receita no setor de bens de consumo')
            insights['topicos_discussao'].append('Otimização de portfólio de produtos e precificação')
        
        if 'technology' in industries_found or 'tecnologia' in industries_found:
            insights['topicos_discussao'].append('Integração de tecnologia e dados em estratégias comerciais')
            insights['topicos_discussao'].append('Transformação digital em processos de vendas')
        
        if 'retail' in industries_found or 'varejo' in industries_found:
            insights['topicos_discussao'].append('Tendências de mercado em vendas para o varejo moderno')
            insights['topicos_discussao'].append('Estratégias omnichannel e experiência do cliente')
        
        # Adicionar tópicos gerais se não houver suficientes
        if len(insights['topicos_discussao']) < 3:
            insights['topicos_discussao'].extend([
                'Desafios e oportunidades no mercado brasileiro',
                'Estratégias de crescimento em mercados competitivos',
                'Tendências globais e impactos locais no setor'
            ])
        
        return insights

    def process_cv(self, text):
        """Processa o currículo completo e retorna análise, briefing e insights"""
        # Analisar o currículo
        profile = self.analyze(text)
        
        # Gerar briefing e insights
        briefing = self.generate_briefing(profile)
        insights = self.generate_insights(profile)
        
        return {
            'profile': profile,
            'briefing': briefing,
            'insights': insights,
            'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }

# Exemplo de uso
if __name__ == "__main__":
    analyzer = CVAnalyzer()
    with open("curriculo_texto.txt", "r", encoding="utf-8", errors="ignore") as f:
        cv_text = f.read()
    
    result = analyzer.process_cv(cv_text)
    print(json.dumps(result, indent=2, ensure_ascii=False))
