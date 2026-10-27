<div align="center">

# SDD Weather App

### Treinamento hands-on de **Spec-Driven Development** com **GitHub Copilot**

**Brief → Spec → Plan → Tasks → Code → Test → Review → Ship**

</div>

---

Este repositório é um **laboratório de treinamento de 8 horas** que ensina a
construir software guiado por especificação (**Spec-Driven Development**) usando
o **GitHub Copilot** em todas as etapas. O projeto final é um **Weather App** em
React + TypeScript que consome a API Open-Meteo.

> ## Princípio central
> **NÃO COMECE PELO CÓDIGO.** Sempre: **Spec → Plan → Tasks → Code.**

---

## O workshop

Comece pelo **[Guia do Workshop](workshop/GUIDE.md)** e siga os módulos em ordem.

| # | Módulo | Fase | Duração |
| --- | --- | --- | --- |
| 01 | [Setup](workshop/module-01-setup/README.md) | Preparação | 30 min |
| 02 | [Understanding the Problem](workshop/module-02-discovery/README.md) | Discovery | 45 min |
| 03 | [Writing the Specification](workshop/module-03-spec/README.md) | Spec | 50 min |
| 04 | [Creating the Technical Plan](workshop/module-04-plan/README.md) | Plan | 45 min |
| 05 | [Breaking Down Tasks](workshop/module-05-tasks/README.md) | Tasks | 40 min |
| 06 | [Building the UI](workshop/module-06-ui/README.md) | Code | 60 min |
| 07 | [Integrating APIs](workshop/module-07-api/README.md) | Code | 60 min |
| 08 | [Testing](workshop/module-08-testing/README.md) | Test | 55 min |
| 09 | [Hardening](workshop/module-09-hardening/README.md) | Test | 50 min |
| 10 | [Pull Request Review](workshop/module-10-review/README.md) | Review | 45 min |
| 11 | [Delivery (GitHub Pages)](workshop/module-11-delivery/README.md) | Ship | 30 min |

Cada módulo tem **README.md**, **challenge.md**, **prompts.md** e
**solution.md**.

---

## Começando

### Pré-requisitos

- **Node.js**
- **pnpm** (único gerenciador de pacotes suportado — habilite com `corepack enable`)
- **GitHub Copilot** habilitado no VS Code
- Git e uma conta no GitHub (para PR e deploy)

> O repositório inclui um **DevContainer** com tudo pré-configurado. Abra em um
> Codespace ou em "Reopen in Container" e pule a instalação manual.

### Instalação

```bash
pnpm install
pnpm exec playwright install   # navegadores para os testes E2E
```

### Scripts

```bash
pnpm dev             # servidor de desenvolvimento (Vite)
pnpm build           # build de produção
pnpm preview         # serve o build localmente
pnpm lint            # Biome (lint)
pnpm format          # Biome (formatação)
pnpm check           # Biome (lint + formatação)
pnpm test            # testes unitários (Vitest)
pnpm test:coverage   # cobertura
pnpm test:e2e        # testes E2E (Playwright)
```

---

## Arquitetura do app

```text
src/
├── components/      # apresentação (um componente por arquivo)
│   └── states/      # loading, erro, vazio
├── hooks/           # orquestração (useWeather)
├── services/        # acesso a dados (Open-Meteo) isolado
├── lib/             # funções puras (conversão, formatação, códigos WMO)
├── types/           # contratos compartilhados
├── styles/          # Tailwind + estilos globais
├── App.tsx          # composição da tela
└── main.tsx         # bootstrap React
```

Decisões-chave:

- **Temperaturas em Celsius** internamente; conversão só na apresentação (o
  toggle °C/°F **não** faz nova requisição).
- **Rede isolada** em `services/` — componentes e hooks não conhecem URLs.
- Sempre tratar **loading**, **erro** e **vazio**.

### Dados fictícios para desenvolver a UI

O objeto `mockWeatherData` em [src/mocks/weather.ts](src/mocks/weather.ts)
implementa o contrato `WeatherData` de
[src/types/weather.ts](src/types/weather.ts), sem chamadas à API:

```ts
import { mockWeatherData } from './mocks/weather';

const { city, current, forecast } = mockWeatherData;
```

O exemplo contém Salvador, clima atual e cinco datas locais consecutivas
fixas (27 a 31 de outubro de 2026), no fuso `America/Bahia`. São dados
fictícios, não uma previsão real nem datas atualizadas automaticamente.
Temperaturas ficam em Celsius, códigos meteorológicos seguem WMO e métricas
ausentes podem ser representadas por `null` nos tipos.
`TemperatureUnit` e `WeatherSnapshot` são aliases de `Unit` e `WeatherData`,
respectivamente, para compatibilidade com os nomes do plano.

### Componente de busca

[SearchBar](src/components/SearchBar.tsx) recebe `onSearch(city: string)` e
`disabled` (opcional, `false` por padrão). O formulário tem `role="search"` e
campo com label visível. Botão e Enter enviam o termo com espaços externos
removidos; entrada vazia mostra erro acessível sem chamar `onSearch`.
Quando `disabled` está ativo, campo, botão e envio ficam bloqueados.
O componente não faz chamadas à API.

### Controle de unidade

[UnitToggle](src/components/UnitToggle.tsx) recebe `unit: Unit` e
`onChange(unit: Unit)`. O componente é controlado: o pai atualiza `unit`
ao receber o callback com `celsius` ou `fahrenheit`.
Os botões °C/°F ficam em um grupo com nome acessível e indicam a seleção
por `aria-pressed`. Use Tab/Shift+Tab para navegar e Enter/Espaço para ativar.
O controle não consulta a API nem converte temperaturas.

### Hero de clima atual

[CurrentWeather](src/components/CurrentWeather.tsx) recebe `city`, `current` e
`unit`. Exibe temperatura e sensação na unidade selecionada, condição em pt-BR
e ícone decorativo de [weatherCodes](src/lib/weatherCodes.ts).
[temperature](src/lib/temperature.ts) centraliza conversão e formatação com
uma casa decimal. Umidade (%), vento (km/h), precipitação no intervalo atual
(mm, não probabilidade) e pressão à superfície (hPa) mantêm suas unidades.
Métricas `null` e códigos desconhecidos aparecem como “Indisponível”; zero
continua sendo um valor válido. O componente pode receber diretamente
`mockWeatherData.city` e `mockWeatherData.current`, sem acesso à API.

### Estados de apresentação

- [LoadingState](src/components/states/LoadingState.tsx): `role="status"` e
  mensagem textual; `operation="search"` indica busca de cidades e
  `operation="weather"` (padrão) indica consulta meteorológica. A animação
  decorativa respeita a preferência por movimento reduzido.
- [ErrorState](src/components/states/ErrorState.tsx): alerta com `message`
  opcional (somente texto de apresentação, nunca corpo bruto da API).
  Sem `message`, `kind` seleciona mensagens para `timeout`, `network` (padrão)
  ou `invalid-response`; `operation` distingue busca de consulta (padrão).
  Com `onRetry`, mostra o botão “Tentar novamente”; sem callback, não há botão.
  O pai fornece um callback que repete a operação correspondente.
- [EmptyState](src/components/states/EmptyState.tsx): região com título
  “Nenhuma cidade encontrada” e dica para ajustar a busca, sem props.

Todos são componentes de apresentação: não iniciam buscas nem acessam a API.

### Aplicação integrada

Execute `pnpm dev` para abrir [App](src/App.tsx), com marca, busca, controle
de unidade, hero e previsão de cinco dias. A tela usa
[useWeather](src/hooks/useWeather.ts) e inicia sem dados ou chamadas de rede.
Enviar uma cidade consulta a Open-Meteo e carrega o clima do primeiro resultado.
Carregamento, lista vazia e erro substituem os dados anteriores; “Tentar
novamente” repete a última operação real. A lista para escolher outra cidade
será integrada em etapa posterior. O mock é usado somente como fixture de testes.

A unidade começa em Celsius e é mantida entre buscas e estados. Todas as
temperaturas, inclusive mínima/máxima dos cinco dias, são convertidas apenas
na renderização, sem nova chamada à API ao alternar a unidade.
O bootstrap em [main](src/main.tsx) carrega o CSS global Tailwind.

### Acessibilidade e responsividade

- Busca inválida leva o foco ao campo associado à mensagem de erro.
- Após “Tentar novamente”, o foco vai ao conteúdo principal, em vez de se
  perder quando o botão é desmontado. O skip link também alcança esse conteúdo.
- Botões selecionados usam `aria-pressed` e sublinhado, além da cor.
- Mudanças para sucesso, vazio e inicial, e a unidade no sucesso, têm resumo
  em região `aria-live="polite"`; carregamento e erro mantêm status/alerta próprios.
- Textos longos quebram linha sem ocultar conteúdo; “Indisponível” no hero usa
  tamanho menor. O input tem borda contrastante e os controles têm foco visível.

Execute `pnpm exec playwright test tests/e2e/accessibility.spec.ts --project=chromium --workers=1`
para verificar teclado, foco, movimento reduzido, contraste calculado e ausência
de overflow em 320, 768, 1024 e 1440 px, incluindo texto longo e fonte a 200%.
Os cálculos usam as cores CSS e composição conservadora das transparências,
não substituindo avaliação visual, testes com leitor de tela ou certificação WCAG.
Validação manual com NVDA/VoiceOver, zoom nativo e outros navegadores continua recomendada.

---

## Stack

- **TypeScript** (strict) · **React** · **Vite**
- **Tailwind CSS** (tema dark glassmorphism)
- **Vitest** + **Testing Library** (unit) · **Playwright** (E2E)
- **Biome** (lint + formatação)
- **pnpm** (gerenciador de pacotes)
- **Open-Meteo** (geocoding + forecast, sem API key)

---

## Copilot no fluxo SDD

A pasta `.github/` traz a inteligência do laboratório:

- **`agents/`** — personas especializadas: Spec, Plan, Task, Code, Test, Review.
- **`prompts/`** — prompts de produção para cada etapa.
- **`instructions/`** — convenções (React, Tailwind, Testing) aplicadas
  automaticamente.
- **`workflows/`** — CI (lint/build/test/e2e), deploy no Pages e validações que
  **impõem a ordem Spec → Plan → Tasks**.

Veja [AGENTS.md](AGENTS.md) para a descrição de cada agente.

---

## Idioma

- Narrativa, comentários e documentação: **pt-BR**.
- Identificadores de código, nomes de arquivos e termos técnicos: **en-US**.

---

<div align="center">

Construído com ❤️ para capacitar times em **Spec-Driven Development** usando o poder do GitHub Copilot.

</div>
