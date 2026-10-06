# LP App eProtege

Landing page de captação de leads do App de Gestão eProtege.
Site: https://immfernanda.github.io/appeprotege/

- `index.html`: página completa (HTML, CSS e JS em um arquivo)
- `assets/`: logo e imagens
- O script da planilha (Apps Script) fica fora do repositório porque contém o token secreto do CRM

## Configuração
- No `index.html`, em `CONFIG.planilha`, coloque a URL do App da Web do Apps Script (termina em `/exec`).
- No `Codigo.gs`, em `CRM_WEBHOOK`, coloque a URL do webhook do CRM.
- Campanha e Criativo vêm dos parâmetros `utm_campaign` e `utm_content` do link do anúncio.
