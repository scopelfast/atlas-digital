# Documentação Atlas Digital

Centro único de documentação do projeto. O conteúdo está organizado para **dois perfis** que podem (e devem) cruzar informação: quem **opera** o dia a dia no painel e quem **instala, integra e mantém** o sistema.

---

## Como usar esta pasta

| Se és… | Começa por… |
|--------|-------------|
| **Atendente / supervisor** (respostas, filas, tickets) | [Manual do operador](./MANUAL-OPERADOR.md) |
| **Dev / DevOps / integrador** (API, ambiente, automações) | [Manual técnico](./MANUAL-TECNICO.md) |
| **Administrador avançado** (bots, fluxos, SMTP, MP) | [Manual de integrações e configuração global](./INTEGRACOES-QUEUE-FLOW.md) (técnico + mapa de ecrãs) |

**Dica:** no operador encontrás *o quê* e *para quê*; no técnico e no manual de integrações encontrás *como* isto é implementado e limitações reais do código.

---

## Mapa de documentos

| Documento | Público | Conteúdo |
|-----------|---------|----------|
| [MANUAL-OPERADOR.md](./MANUAL-OPERADOR.md) | Operador, formador, gestor | Conceitos, fluxo de atendimento, ecrãs principais, boas práticas. |
| [MANUAL-TECNICO.md](./MANUAL-TECNICO.md) | TI, integrador | Stack, ambiente, serviços, scripts, pistas de diagnóstico, ligações ao código. |
| [INTEGRACOES-QUEUE-FLOW.md](./INTEGRACOES-QUEUE-FLOW.md) | TI + admin avançado | Prompts, `/queue-integration`, Flowbuilder, Typebot, Dialogflow, N8N, webhooks, **`/global-config`**. |
| [RECUPERACAO-SENHA.md](./RECUPERACAO-SENHA.md) | TI + admin | Fluxo “esqueci a senha”, SMTP, `FRONTEND_URL`, checklist. |
| [DEPLOY-PRODUCAO-LINUX.md](./DEPLOY-PRODUCAO-LINUX.md) | TI, DevOps, infra | Publicação em Linux com Nginx + PM2, HTTPS, checklist e rotina de atualização. |
| [MEMORIAL-APRESENTACAO-ATLAS-DIGITAL.md](./MEMORIAL-APRESENTACAO-ATLAS-DIGITAL.md) | Comercial, decisor, marketing | Memorial para slides + narrativa do produto (pitch, pilares, fluxo-mãe, prompts de imagem). |

---

## Glossário rápido (partilhado)

| Termo | Significado no Atlas Digital |
|-------|------------------------------|
| **Ticket** | Conversa de atendimento associada a um contacto (e fila / utilizador conforme estado). |
| **Fila (queue)** | Departamento ou linha de atendimento; pode ter integração (Typebot, etc.). |
| **Conexão WhatsApp** | Linha WhatsApp (Baileys); pode ter **prompt** de IA e/ou **integração** global. |
| **Prompt** | Configuração de IA (OpenAI/Gemini) ligada à conexão — responde antes da fila, em condições definidas no backend. |
| **Integração de fila** | Registo em `/queue-integration` (Dialogflow, N8N, webhook, Typebot, Flowbuilder). |
| **Flowbuilder** | Fluxos visuais com nós (mensagem, menu, Typebot, OpenAI…). |
| **Configuração global** | `/global-config`: SMTP, Mercado Pago, trial, logo/capa do login (super admin). |

---

## Rotas úteis (painel)

Substitui `localhost:3000` pelo domínio real em produção.

| Rota | Uso típico |
|------|------------|
| `/tickets` | Atendimento principal. |
| `/connections` | Gestão de conexões WhatsApp. |
| `/queues` | Filas e regras de encaminhamento. |
| `/prompts` | Biblioteca de prompts de IA (plano com OpenAI). |
| `/queue-integration` | Integrações por tipo (plano com integrações). |
| `/flowbuilders`, `/flowbuilder/:id` | Editor de fluxos. |
| `/global-config` | Plataforma: e-mail, MP, trial, branding (super). |
| `/settings` | Configurações da empresa / utilizador. |

---

## Evolução desta documentação

Novos capítulos sugeridos (para ir fechando o “manual completo”): campanhas, agendamentos, relatórios, financeiro, API de mensagens. Contribuições devem manter a separação **operador** (sem jargão desnecessário) vs **técnico** (precisão e referências a ficheiros).

Última organização deste índice: documentação didática em camadas (hub → operador / técnico → especializados).
