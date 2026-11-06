# Padrão de interface e tema (Atlas Digital — frontend)

Documento de referência único para repaginação, modo claro/escuro, layout, listagens, tokens e contexto React. Atualizar **sempre** que `App.js`, `createAtlasMuiTheme.js`, `adminShellStyles.js`, `standardDataListStyles.js`, `pageListLayoutStyles.js`, `MainContainer`, `themeContext.js` ou a estratégia de UI mudarem.

**Índice:** [1](#1-objetivo) · [2](#2-arquitetura-e-ficheiros) (inclui **2.4–2.7** layout, abas, tabelas, listagens) · [3](#3-tema-mui-v4--mapa-completo) · [4](#4-colormodecontext--api) · [5](#5-persistência-e-backend) · [6](#6-css-global) · [7](#7-exemplos-de-consumo) · [8](#8-mui-v4-vs-v5) · [9](#9-bibliotecas-e-componentes) · [10](#10-roadmap-sugerido) · [11](#11-exceções-e-dívida-técnica) · [12](#12-checklist-e-auditoria) · [13](#13-evolução-deste-documento)

---

## 1. Objetivo

- Um único **sistema de aparência** coerente em modo claro e escuro.
- Cores e superfícies derivadas de **tokens** definidos no tema, não de hexadecimais soltos.
- Com o tempo, **reduzir** mistura entre bibliotecas (Material v4, MUI v5, Bootstrap) em código novo e refactors.
- Este ficheiro permite **resgatar** decisões depois: o que existe, onde está, como usar, o que auditar.

---

## 2. Arquitetura e ficheiros

### 2.1 Árvore de providers (raiz da app)

Ordem relevante em `src/App.js` (exterior → interior):

1. `Favicon` (URL derivada do favicon configurado).
2. `ColorModeContext.Provider` com `value={{ colorMode }}`.
3. `ThemeProvider` de **`@material-ui/core/styles`** com `theme` criado por **`createAtlasMuiTheme`** (`src/theme/createAtlasMuiTheme.js`).
4. `QueryClientProvider` → `ActiveMenuProvider` → `Routes`.

**Regra:** qualquer ecrã dentro de `Routes` que use `useTheme()` de **Material-UI v4** deve estar sob este `ThemeProvider`. Componentes MUI v5 podem ter **outro** `ThemeProvider` mais perto da folha, se existir (evitar dois temas sem coordenação).

### 2.2 Ficheiros de referência obrigatória

| Ficheiro | Função |
|----------|--------|
| `src/theme/createAtlasMuiTheme.js` | Tema MUI v4 Atlas Digital Switch: `palette`, `typography`, `shape`, `overrides` (botões, modais, drawer, inputs, listas) |
| `src/App.js` | Estado `mode`, cores primárias, logos, `appName`, chamada a `createAtlasMuiTheme`, `localStorage` / `--primaryColor` + `--atlas-*`, fetch de settings públicos |
| `src/layout/themeContext.js` | Definição de `ColorModeContext` (valores default do contexto) |
| `src/layout/index.js` | Layout autenticado: `useTheme()`, `useContext(ColorModeContext)` |
| `src/hooks/useSettings/index.js` | `getPublicSetting(key)` para branding/tema público |
| `src/pages/Login/index.js` | Exceção: força tema claro na página de login |
| `src/components/DarkMode/index.js` | Toggle visual; contém **dívida técnica** (estado local de tema) — ver secção 11 |
| `src/assets/logo-light.jpg` / `logo-dark.jpg` | Logos default da marca (JPEG); `public/logo.jpg` para login quando não há branding remoto |
| `public/index.html` | Variáveis CSS do splash (`--brand`, etc.) alinhadas à marca |
| `src/theme/adminShellStyles.js` | Shell partilhado: abas + papers para `/settings`, `/global-config`; mixin para sub-abas |
| `src/theme/standardDataListStyles.js` | Estilos partilhados para tabelas de listagem administrativa |
| `src/components/MainContainer/index.js` | Área útil full-width (`maxWidth={false}`) com padding |
| `src/theme/pageListLayoutStyles.js` | `pageRoot` + `mainPaper` para páginas de listagem com tabela |

### 2.3 Identidade visual (Atlas Digital Switch)

- **Primária:** cyan elétrico (ações, brilho em modo escuro). **Secundária MUI:** âmbar (`palette.secondary`) para destaques. **Fundos escuros:** navy / preto profundo. **Modo claro:** cinzas-azulados e branco gelo.
- Detalhes hex e `overrides` de componentes: código-fonte em `createAtlasMuiTheme.js` (única fonte de verdade para sombras, raios e superfícies da marca).

### 2.4 MainContainer e largura da área útil

- **`components/MainContainer`**: usa `Container` do MUI com **`maxWidth={false}`** — a zona principal entre drawer e margens **usa toda a largura disponível** (apenas `padding: theme.spacing(2)`). Não usar `maxWidth: 900` ou similares ao nível da página inteira salvo exceção documentada em **11.2**.
- Ecrãs que **não** passam por `MainContainer` (ex.: login, fluxos especiais) ficam fora desta regra.

### 2.5 Shell de configuração com abas

Páginas tipo **definições com várias secções** (ex.: `/settings`, `/global-config`) devem seguir a **mesma casca**:

1. `MainContainer` + classe `shellRoot` (`useAdminShellStyles`).
2. `MainHeader` + `Title` (título da página).
3. `Paper` `elevation={1}` + `mainPaper` (coluna flex, scroll).
4. `Tabs`: `variant="scrollable"`, `scrollButtons="on"`, `indicatorColor` / `textColor` primary, classe **`tabBar`** (fundo `grey[200]` / `grey[800]` conforme tema — ver `adminShellTabBarMixin`).
5. `Paper` `elevation={0}` + `innerPaper` (conteúdo da aba).
6. Conteúdo por aba: **`TabPanel`** (`components/TabPanel`) com `className={contentFull}`.

**Ficheiros:** `src/theme/adminShellStyles.js` (`useAdminShellStyles`, `adminShellTabBarMixin`).  
**Sub-abas** dentro de um painel (ex.: `Options.js`) devem reutilizar **`adminShellTabBarMixin`** para a barra de tabs não divergir visualmente.

### 2.6 Listagens (tabelas administrativas)

- Tabelas de listagem (empresas, planos, ajudas, etc.) devem usar **`useStandardDataListStyles`** de `src/theme/standardDataListStyles.js`:
  - **`listPaper`**: envoltório com scroll horizontal + `borderRadius` do tema.
  - **`standardTable`**: `width 100%`, `minWidth` mínimo para não “esmagar” colunas.
  - **`headRow`**: cabeçalho com peso 600, fundo semântico claro/escuro, divisor.
  - **`bodyRow`**: zebra suave + hover alinhado à marca.
- **Referência implementada:** `CompaniesManagerGrid`, `PlansManagerGrid`, `HelpsManagerGrid`, e páginas dos **lotes 1 e 2** em **2.7**. Novas listagens MUI `Table` devem copiar este padrão; listas `DataGrid` ou Bootstrap exigem equivalência visual na revisão.

### 2.7 Páginas de listagem (título + tabela em full width)

- **`src/theme/pageListLayoutStyles.js`** — hook **`usePageListLayoutStyles`**:
  - **`pageRoot`**: classe no **`MainContainer`** (`width 100%`, coluna flex, `minHeight: 0`).
  - **`mainPaper`**: o **`Paper`** que envolve a tabela — `padding` uniforme (`spacing(2)`), **`overflow: auto`** + scroll horizontal quando necessário, **`borderRadius`** do tema.
- **Cabeçalho:** `MainHeader` → **`Title`** + **`MainHeaderButtonsWrapper`** (pesquisa, ações). Evitar grelhas com larguras mágicas (`99.6%`, etc.).
- **Tabela:** `Table` com `className={list.standardTable}`; primeira linha do corpo do cabeçalho `list.headRow`; cada linha de dados `list.bodyRow` (`useStandardDataListStyles`).
- **Migração em lotes (testar entre lotes):**  
  - **Lote 1 (feito):** `/announcements`, `/users`, `/queues`.  
  - **Lote 2 (feito):** `/prompts`, `/queue-integration`, `/connections`, `/files`, `/financeiro`, `/tags`, `/quick-messages`, `/reports`.

---

## 3. Tema MUI v4 — mapa completo

A construção do tema está centralizada em **`src/theme/createAtlasMuiTheme.js`** (função `createAtlasMuiTheme`). O objeto inclui **extensões** além do `palette` padrão do MUI. Tipos exatos podem não estar no TypeScript; em JS acede-se por `theme.palette.*` ou `theme.*`.

### 3.1 `palette` (MUI + custom)

| Chave | Tipo / uso | Comportamento (resumo) |
|-------|------------|-------------------------|
| `type` | `'light'` \| `'dark'` | Igual ao `mode` da app; controla variantes padrão do MUI v4 |
| `primary.main` | string (cor) | `primaryColorLight` se `mode === 'light'`, senão `primaryColorDark` |
| `secondary.main` | string | Âmbar (marca): modo claro `#e65100`, escuro `#ffb74d` |
| `textPrimary` | string | Mesma lógica que primária (legado; não confundir com `palette.text.primary`) |
| `borderPrimary` | string | Idem |
| `fontColor` | string | Idem |
| `dark.main` | string | Texto/ícones sobre barras: claro `#1a2a3d`, escuro `#e8f4f8` |
| `light.main` | string | Superfícies suaves: claro `#e8eef5`, escuro `#1e2d3f` |
| `tabHeaderBackground` | string | Claro: `#e8eef5`; escuro: `#1a2838` |
| `optionsBackground` | string | Claro: `#f0f4fa`; escuro: `#121d2c` |
| `fancyBackground` | string | Claro: `#eef2f8`; escuro: `#0d1520` |
| `total` | string | Fundo geral da app: claro `#f4f7fb`; escuro `#05080c` |
| `messageIcons` | string | Claro: `#546e7a`; escuro: `#9ee5f4` |
| `inputBackground` | string | Claro: `#FFFFFF`; escuro: `#141c28` |
| `barraSuperior` | string | Claro: `primaryColorLight`; escuro: navy marca `#0a1628` |
| `background.default` / `paper` | string | Definidos pela marca (gelo / navy); ver ficheiro |
| `text.primary` / `secondary` / `disabled` | string | Contraste legível nos dois modos |
| `divider` | string | Sublinhado cyan suave (escuro) ou azul-acinzentado (claro) |

**Paleta padrão MUI** (`error`, `action`, etc.) continua disponível conforme `type: light|dark`, com `background`/`text`/`divider` definidos em `createAtlasMuiTheme.js`.

### 3.2 Propriedades na raiz do objeto de tema (não só `palette`)

| Chave | Descrição |
|-------|-----------|
| `scrollbarStyles` | Objeto de estilos JSS para scrollbar WebKit; thumb usa cor primária do modo atual |
| `scrollbarStylesSoft` | Variante “suave”; thumb semitransparente cyan (escuro) ou cinza-azulado (claro) |
| `mode` | Cópia do estado `'light'` \| `'dark'` (duplicado com `palette.type` — útil para código que leia `theme.mode`) |
| `appLogoLight`, `appLogoDark`, `appLogoFavicon` | URLs/caminhos resolvidos para logos |
| `appName` | Nome exibido (vem de setting público com fallback) |
| `calculatedLogoDark` | Função `() => string` — lógica de fallback quando só um logo custom existe |
| `calculatedLogoLight` | Função `() => string` — idem |

**Novas necessidades:** adicionar chaves **semânticas** em `createAtlasMuiTheme.js` (e estado em `App.js` se preciso) para **ambos** os modos e documentar uma linha nesta tabela.

---

## 4. ColorModeContext — API

### 4.1 Provider real (`App.js`)

```jsx
<ColorModeContext.Provider value={{ colorMode }}>
```

O consumidor **sempre** desestrutura `colorMode`:

```javascript
const { colorMode } = useContext(ColorModeContext);
```

### 4.2 Objeto `colorMode` (valor em runtime)

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `toggleColorMode` | `() => void` | Alterna `light` ↔ `dark`; grava `localStorage.preferredTheme` dentro do setter |
| `setPrimaryColorLight` | React `setState` | Cor primária modo claro |
| `setPrimaryColorDark` | React `setState` | Cor primária modo escuro |
| `setAppLogoLight` | React `setState` | Logo modo claro |
| `setAppLogoDark` | React `setState` | Logo modo escuro |
| `setAppLogoFavicon` | React `setState` | Favicon |
| `setAppName` | React `setState` | Nome da app |
| `appLogoLight` | string | Valor atual |
| `appLogoDark` | string | Valor atual |
| `appLogoFavicon` | string | Valor atual |
| `appName` | string | Valor atual |
| `mode` | `'light'` \| `'dark'` | Modo atual |

**Consumidores conhecidos:** `src/layout/index.js`, `src/components/Settings/Whitelabel.js`.

### 4.3 Valores default em `themeContext.js`

O `createContext({ ... })` define um objeto **plano** (sem `colorMode` aninhado). Isso **não** coincide com o formato `{ colorMode }` do Provider. Fora do Provider, `useContext` não deve ser usado para tema; tratar como bug se ocorrer. Alinhar default ao formato `{ colorMode: { ... } }` é melhoria futura opcional.

---

## 5. Persistência e backend

### 5.1 `localStorage` relacionado a tema / branding

| Chave | Escrito por | Conteúdo |
|-------|-------------|----------|
| `preferredTheme` | `App.js` (`toggleColorMode`, `useEffect` ao mudar `mode`) | `'light'` ou `'dark'` |
| `primaryColorLight` | Fluxo de settings / whitelabel (e leitura inicial em `App`) | Cor hex |
| `primaryColorDark` | Idem | Cor hex |
| `appName` | Idem | Nome |
| `frontendVersion` | `App.js` após `GET /version` | Versão (não é tema, mas no mesmo fluxo de arranque) |

**Login** (`src/pages/Login/index.js`): escreve `localStorage.setItem("theme", "light")` para a sessão da página de login — chave **diferente** de `preferredTheme`. Documentar ao unificar estratégia de tema.

### 5.2 Settings públicos (`getPublicSetting`)

Implementação: `src/hooks/useSettings/index.js` → `GET` em `openApi` para `/public-settings/:key` com query `token=wtV`.

Chaves usadas no mount de `App.js`:

| Chave | Uso | Fallback no código se falhar / vazio |
|-------|-----|--------------------------------------|
| `primaryColorLight` | Cor primária claro | `#007a9c` se vazio na API; estado inicial vem de `localStorage` ou `#007a9c` |
| `primaryColorDark` | Cor primária escuro | `#00c8e8` se vazio na API |
| `appLogoLight` | Logo claro | Asset default `logo.png` |
| `appLogoDark` | Logo escuro | Asset default `logo-black.png` |
| `appLogoFavicon` | Favicon | `favicon.ico` |
| `appName` | Título/nome | `"Whaticket - V15.0.1"` |

**Nota:** Os fallbacks acima estão tal como em `App.js`; ao renomear o produto, atualizar código e este documento.

### 5.3 Inicialização do modo

1. Se existir `localStorage.preferredTheme`, usa-se esse valor.
2. Caso contrário, `useMediaQuery("(prefers-color-scheme: dark)")` define o estado inicial.

---

## 6. CSS global

| Mecanismo | Onde | Descrição |
|-----------|------|-----------|
| `--primaryColor` | `document.documentElement` | `App.js`: primária do modo atual. |
| `--atlas-accent` | `document.documentElement` | Igual à primária do modo (marca). |
| `--atlas-bg` | `document.documentElement` | Fundo base: `#f4f7fb` (claro) ou `#05080c` (escuro). |
| Variáveis splash (`--brand`, `--bg`, …) | `public/index.html` | Pré-bundle; alinhadas Atlas Digital Switch. |
| `react-toastify` | Import em `App.js` | Estilos globais de toast; verificar contraste nos dois modos se customizar. |

Qualquer novo ficheiro CSS global que dependa de tema deve preferir variáveis alimentadas por `App.js` ou classes aplicadas em função de `mode`, e ser referenciado aqui.

---

## 7. Exemplos de consumo

### 7.1 `useTheme` + `makeStyles` (Material-UI v4)

```javascript
import { useTheme } from "@material-ui/core/styles";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.total,
    color: theme.palette.text.primary,
    borderColor: theme.palette.borderPrimary,
  },
  input: {
    backgroundColor: theme.palette.inputBackground,
  },
  bar: {
    backgroundColor: theme.palette.barraSuperior,
  },
  scroll: {
    ...theme.scrollbarStyles,
  },
}));
```

### 7.2 Ler logos e modo a partir do contexto + tema

```javascript
import { useContext } from "react";
import { useTheme } from "@material-ui/core/styles";
import ColorModeContext from "../layout/themeContext";

function Example() {
  const theme = useTheme();
  const { colorMode } = useContext(ColorModeContext);
  const logo = colorMode.mode === "light"
    ? theme.calculatedLogoLight()
    : theme.calculatedLogoDark();
  return null;
}
```

### 7.3 Primária MUI padrão

```javascript
const theme = useTheme();
// Botões, etc.
// color="primary" usa theme.palette.primary.main
```

### 7.4 Texto semântico MUI

Preferir quando fizer sentido:

- `theme.palette.text.primary`
- `theme.palette.text.secondary`
- `theme.palette.text.disabled`

Usar `textPrimary` / `fontColor` custom apenas onde o design system legado exigir.

---

## 8. MUI v4 vs v5

| Aspeto | v4 (atual no `ThemeProvider` raiz) | v5 |
|--------|-------------------------------------|-----|
| Import tema | `@material-ui/core/styles` | `@mui/material/styles` |
| Modo escuro | `palette.type: 'light' \| 'dark'` | `palette.mode: 'light' \| 'dark'` |
| `createTheme` | v4 API | v5 API (estrutura de `palette` diferente) |

**Padrão:** código novo dentro da árvore atual deve funcionar com **v4** no root até existir migração explícita. Componentes **@mui/material** v5 podem precisar de **ThemeProvider** v5 separado ou de bridge; ao migrar, atualizar esta secção e o `App.js`.

---

## 9. Bibliotecas e componentes

**Inventário declarado (dependências):** Material-UI v4 (`@material-ui/*`), MUI v5 (`@mui/*`), Bootstrap 5, react-bootstrap, Formik + formik-material-ui, react-modal, ApexCharts, Chart.js, etc.

**Direção:**

1. Novas features: preferir **MUI v5** quando o ficheiro já usar v5 ou a migração for local.
2. Evitar **novos** ecrãs internos só em Bootstrap se existir equivalente MUI.
3. **Modais:** convergir para **um** padrão (ex. `Dialog` MUI); evitar novos `react-modal` sem registo na secção 11.
4. **Formulários:** manter Formik; inputs Material alinhados ao tema.

### 9.1 Checklist por tipo de componente

- **Botões:** variantes + foco visível + contraste nos dois modos.
- **Páginas com abas administrativas:** shell **2.5** (`useAdminShellStyles`); não usar coluna `maxWidth` fixa à raiz.
- **Páginas só com título + tabela:** **`usePageListLayoutStyles`** + **`useStandardDataListStyles`** (secção **2.7**).
- **Listas / tabelas MUI:** cabeçalho/linhas com **`useStandardDataListStyles`** (secção **2.6**).
- **Modais / drawers:** overlay consistente; ações primária/secundária iguais ao resto da app.
- **`ContactModal`:** em páginas que listam contactos, passar sempre **`onSave`** para injetar o registo criado/atualizado no estado local (evita depender só de F5 ou do socket).
- **Inputs:** fundo `inputBackground` ou token sucessor; erros acessíveis.
- **Ícones:** sem cor fixa ilegível no modo atual (`inherit` ou `theme.palette`).
- **Gráficos:** cores derivadas do tema ou paleta calculada no mount.

---

## 10. Roadmap sugerido

Fases incrementais (ajustar prioridades à equipa):

| Fase | Entregáveis |
|------|-------------|
| **A — Congelar tokens** | Lista oficial de chaves em `App.js` + proibir novos hex sem token; preencher tabela secção 3. |
| **B — Shell** | Layout, barra superior, navegação, fundo global usando só tokens; corrigir toggle para estado só global. |
| **C — Primitivos** | Botão, input, modal, lista/tabela base documentados como componentes ou variantes de tema. |
| **D — Ecrãs de alto tráfego** | Dashboard, conversas, settings — revisão claro/escuro. |
| **E — Cauda** | Greps (secção 12), exceções na tabela 11.2, gráficos e PDFs. |
| **F — Migração MUI** | Plano único: v5 `ThemeProvider` raiz ou bridge; descontinuar v4 gradualmente. |

---

## 11. Exceções e dívida técnica

### 11.1 Exceções funcionais (comportamento aceite)

| Contexto | Comportamento | Motivo |
|----------|----------------|--------|
| `src/pages/Login/index.js` | `localStorage theme = light`, `document.documentElement` sem `dark`, `data-theme="light"`, classe `login-page` no `body` | Fluxo público / branding fixo claro |

### 11.2 Registo de exceções (preencher)

| Área / ficheiro | Exceção | Responsável / data |
|-----------------|---------|---------------------|
| | | |

### 11.3 Dívida técnica conhecida

| Item | Detalhe |
|------|---------|
| `src/components/DarkMode/index.js` | Mantém `useState('light')` local para alternar ícone, em paralelo com `props.themeToggle()`. O modo real vem do `App`; o estado local pode dessincronizar. **Alvo:** ícone derivado só de `colorMode.mode` via contexto. |
| `themeContext.js` default | Formato do default ≠ `{ colorMode }` do Provider. |
| Chaves `theme` vs `preferredTheme` | Login usa chave diferente de persistência; unificar estratégia é futuro trabalho. |
| Nomes `palette.dark` / `palette.light` | Em modo escuro, `dark.main` é cor clara — legado; preferir novos nomes semânticos (`neutralStrong`, etc.) em refactors. |

---

## 12. Checklist e auditoria

### 12.1 Antes de merge (revisor / autor)

- [ ] Testado em **claro** e **escuro**.
- [ ] Sem cores novas “soltas” sem token ou justificativa na tabela 11.2.
- [ ] Foco visível em controlos interativos.
- [ ] Modais: teclado (Tab, Escape conforme padrão) e título acessível.

### 12.2 Comandos sugeridos (na pasta `frontend`, PowerShell)

Executar a partir de `c:\gitHub\atlas-digital\frontend` (ou ajustar caminho). Usar `rg` (ripgrep) se disponível; senão pesquisa equivalente no IDE.

```powershell
# Hex comuns em código fonte (excluir node_modules)
rg "#(fff|ffffff|000|333333|222222|fafafa)\b" --glob "*.js" --glob "*.jsx" --glob "*.css" src

# Bootstrap em páginas (avaliar se deve ser MUI)
rg "from [\"']react-bootstrap[\"']|from [\"']bootstrap" src

# react-modal vs Dialog
rg "react-modal" src
rg "@material-ui/core/Dialog|@mui/material/Dialog" src
```

Corrigir achados ou registar em **11.2**.

### 12.3 Alinhamento do toggle de tema

O utilizador deve ver um único modo global: `colorMode.mode` + `toggleColorMode` do contexto. Não introduzir segundo estado de tema só para UI.

---

## 13. Evolução deste documento

1. Ao alterar `createTheme`, `palette`, chaves na raiz do tema, `ColorModeContext`, `getPublicSetting` keys ou providers em `App.js` → atualizar secções **3**, **4**, **5** e **2**.
2. Ao migrar MUI v5 como tema raiz → atualizar **2**, **3**, **7**, **8** e registar data abaixo.
3. Ao adicionar exceção permanente → **11.1** ou **11.2**.

**Histórico de alinhamento ao código**

| Data | Notas |
|------|--------|
| 2026-03 | Padrão de shell (`adminShellStyles`) para `/settings` e `/global-config`; `MainContainer` full-width; `standardDataListStyles` em Empresas / Planos / Ajuda |
| 2026-03 | `pageListLayoutStyles` + tabelas padronizadas: **lote 1** — `/announcements`, `/users`, `/queues` |
| 2026-03-25 | **Lote 2** — `/prompts`, `/queue-integration`, `/connections`, `/files`, `/financeiro`, `/tags`, `/quick-messages`, `/reports` |

---

*Documento normativo de UI/tema do frontend Atlas Digital. Mantê-lo sincronizado com o repositório.*
