# Manual do operador — Atlas Digital

Guia para **quem usa o painel** no dia a dia: atendentes, supervisores e formadores. Não é necessário conhecer código nem servidores; quando precisares de detalhe técnico, segue as ligações para [Manual técnico](./MANUAL-TECNICO.md) ou para [Integrações e configuração global](./INTEGRACOES-QUEUE-FLOW.md).

---

## 1. O que é este sistema (em uma frase)

É uma **central de atendimento omnicanal** centrada em **conversas**: cada conversa vive num **ticket**, pode estar numa **fila**, ser tratada por um **utilizador** e, em muitos casos, ser precedida por **automação** (menu, bot ou IA), conforme a empresa configurou.

---

## 2. Perfis e o que costumam ver

| Perfil | O que costuma fazer |
|--------|---------------------|
| **Utilizador** (`user`) | Responder tickets das suas filas, usar etiquetas e notas conforme permissões. |
| **Admin** | Gerir filas, conexões, utilizadores, integrações (se o plano permitir), campanhas, etc. |
| **Super admin** | Além do admin, acede a **configurações globais** da plataforma (`/global-config`): e-mail institucional, Mercado Pago, imagens do login, dias de trial. |

Se um menu **não aparece**, pode ser **perfil** ou **plano da empresa** (funcionalidades contratadas). Quem gere contratos/planos deve alinhar com o administrador.

---

## 3. Fluxo típico de um contacto (do ponto de vista humano)

1. O cliente escreve no **WhatsApp** (ou outro canal configurado).  
2. O sistema pode **cumprimentar**, mostrar **menu de filas**, ou passar por um **bot** (Typebot, texto, IA), **antes** de cair num atendente.  
3. Quando o ticket está **na tua fila** e **atribuído** (ou em fila comum a apanhar), **respondes** no ecrã de tickets.  
4. **Encerras** ou **transfieres** conforme o processo interno da empresa.  

O *como exato* (mensagens automáticas, ordem bot vs fila) depende da **configuração** — vê secção 7.

---

## 4. Ecrã de tickets — ideias essenciais

- **Lista / abas:** costuma haver separação entre tickets abertos, pendentes, fechados, etc. (nomes dependem da versão e tema).  
- **Painel da conversa:** histórico de mensagens, campo para responder, anexos conforme suporte.  
- **Dados do contacto:** nome, número, etiquetas — úteis para contexto.  
- **Notificações:** ícones na barra superior podem avisar de **mensagens novas** ou **comunicados**; comunicados importantes também podem aparecer no menu de anúncios (conforme perfil).

Se algo “não notifica”, pode ser configuração de som/browser — o técnico pode ajudar com permissões e socket.

---

## 5. Boas práticas de atendimento

- **Lê o histórico** antes de responder; evita duplicar perguntas já feitas por um bot.  
- Usa **notas internas** (se existirem no teu ecrã) para deixar contexto a colegas.  
- **Etiquetas (tags)** ajudam relatórios e pesquisa — alinha com o supervisor quais usar.  
- Em transferência, **explica ao cliente** o que vai acontecer (reduz reaberturas e insatisfação).

---

## 6. Onde configurar o que o cliente “sente” (visão operador)

Estas áreas são normalmente tratadas por **admin** (não pelo atendente):

| Objetivo | Onde pedir para configurarem |
|----------|------------------------------|
| Mensagem de boas-vindas / filas | Conexão WhatsApp + **Filas**. |
| Bot de texto / menus complexos | **Flowbuilder** e/ou **Integrações** (`/queue-integration`). |
| IA que fala antes da fila | **Prompts** + escolha do prompt na **conexão** (`/prompts`). |
| E-mail de recuperação de senha / logo do login | **Configurações globais** (`/global-config`) — só super. |

Para **detalhe técnico** de cada opção (Typebot vs Dialogflow, limites, etc.), o administrador deve usar o [manual de integrações](./INTEGRACOES-QUEUE-FLOW.md).

---

## 7. Automatização vs atendente humano (linguagem simples)

- **Prompt (IA na conexão):** um “assistente” que pode responder no início, com regras definidas pela empresa; pode transferir para humano quando o texto da conversa cumpre certas condições.  
- **Integração na fila / conexão:** pode ser outro bot (ex. Typebot), Dialogflow, ou envio de dados para sistemas externos (N8N/webhook) — o efeito no cliente depende do tipo.  
- **Flowbuilder:** desenha passos visuais (perguntas, menus, envio de mensagens).  

Se o cliente diz que “o robô não deixa falar com pessoa”, o supervisor deve rever **textos do bot** e **opções de transferência** no fluxo ou no prompt.

---

## 8. Problemas comuns (primeiro nível)

| Sintoma | O que verificar |
|---------|-----------------|
| Não recebo tickets | Fila atribuída ao utilizador? Conexão WhatsApp **ligada**? |
| Menu não aparece | Quantas filas existem? Só uma fila com integração dispara comportamentos diferentes. |
| Mensagem agendada não saiu | Redis/servidor e hora do agendamento — escalar para TI (ver manual técnico). |
| Esqueci a senha não envia e-mail | SMTP / configuração global — TI. |

---

## 9. Onde aprofundar

- [Índice da documentação](./README.md)  
- [Recuperação de senha](./RECUPERACAO-SENHA.md) (para explicar utilizadores o que depende do e-mail)  
- [Manual técnico](./MANUAL-TECNICO.md) (ambiente, diagnóstico)

Este manual deve ser actualizado quando o produto ganhar novos ecrãs ou renomear menus; indica à equipa técnica qualquer divergência que encontres no painel.
