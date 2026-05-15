# TaskBot AI — Backend

API REST construída com Node.js e Express, integrada com o Google Gemini para gestão de tarefas por linguagem natural.

## Tecnologias
- Node.js + Express
- MySQL
- Google Gemini API (@google/genai)

## Instalação

```bash
npm install
```

## Configuração

Cria um ficheiro `.env` na raiz:
```PORT=3000
GEMINI_API_KEY=a_tua_api_key
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=a_tua_password
DB_NAME=chatbot
```

## Executar

```bash
node app.js
```

## Endpoints principais

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /chat | Enviar mensagem ao TaskBot |
| GET | /tasks | Listar tarefas |
| POST | /tasks | Criar tarefa |
| PATCH | /tasks/:id | Atualizar tarefa |
| DELETE | /tasks/:id | Apagar tarefa |
| GET | /tags | Listar tags |
| GET | /users | Listar utilizadores |
