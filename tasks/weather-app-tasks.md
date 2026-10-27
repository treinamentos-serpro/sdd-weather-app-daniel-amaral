# Tarefas — Weather App

Backlog derivado de [plans/weather-app-plan.md](../plans/weather-app-plan.md) e organizado para implementação incremental. Os critérios também cobrem os requisitos e critérios de aceite correspondentes da spec. O backlog segue a sequência tipos → funções puras → services → hook → componentes → integração → testes → hardening. As dependências indicam pré-requisitos diretos; tarefas de teste ficam após as respectivas implementações.

## Matriz de rastreabilidade funcional

| Requisito da spec | Tarefas de implementação | Tarefas de verificação | Cobertura |
|---|---|---|---|
| **RF1 — Busca de cidades** | T-05 (geocoding e normalização), T-08 (busca e seleção), T-11 (campo e envio), T-12 (resultados e seleção explícita), T-13 (estado vazio), T-20 (composição da tela), T-48 (transmissão do termo e privacidade) | T-29 (service de geocoding com `fetch` mockado), T-32 (estados/concorrência do hook), T-33 (campo), T-34 (resultados), T-35 (estado vazio), T-42 (composição), T-43 (fluxo E2E), T-44 (sem resultados e concorrência) | Coberto |
| **RF2 — Clima atual** | T-03 (rótulos meteorológicos), T-06 (forecast e normalização), T-09 (estado meteorológico), T-14 (apresentação atual), T-20 (composição da tela) | T-27 (códigos), T-30 (service forecast), T-36 (componente atual), T-42 (composição), T-43 (fluxo E2E) | Coberto |
| **RF3 — Previsão de cinco dias** | T-04 (datas locais), T-06 (forecast e normalização), T-15 (cartão diário), T-16 (lista de cinco dias), T-20 (composição da tela), T-23 (responsividade dos cartões) | T-28 (datas), T-30 (service forecast), T-37 (cartão), T-38 (lista), T-42 (composição), T-43 (fluxo E2E) | Coberto |
| **RF4 — Unidade de temperatura** | T-02 (conversão e formatação), T-09 (estado da unidade), T-19 (controle de unidade), T-20 (integração da unidade na tela) | T-26 (testes unitários da conversão), T-41 (controle), T-42 (conversão das temperaturas visíveis), T-43 (alternância E2E) | Coberto |
| **RF5 — Estados de busca e consulta** | T-07 (timeout e falhas no service), T-08/T-09 (estados do hook), T-10 (concorrência e retry), T-17 (loading), T-18 (erro e retry), T-20 (integração dos estados) | T-31 (timeout e falhas), T-32 (hook), T-39 (loading), T-40 (erro e retry), T-42 (composição), T-44 (falhas e concorrência E2E) | Coberto |
| **RF6 — Dados incompletos** | T-01 (tipos com métricas anuláveis), T-02 (indisponibilidade de temperatura), T-06 (normalização parcial), T-14 (clima atual), T-15/T-16 (previsão e dias indisponíveis), T-18 (descartar resposta inválida/antiga), T-20 (apresentação integrada) | T-26 (temperatura ausente), T-30 (respostas parciais/inválidas), T-31 (falhas e resposta inválida), T-36 (clima atual), T-37/T-38 (previsão), T-42 (composição), T-44 (respostas tardias E2E) | Coberto |

**Lacunas:** nenhum requisito funcional RF1–RF6 está sem tarefa correspondente. As tarefas de verificação listadas exercitam os critérios; tarefas de implementação são a cobertura funcional principal.

## Prioridade, tamanho e sequência sugerida

### Legenda

- **P0:** necessário para entregar o fluxo principal utilizável; bloqueia a primeira versão funcional.
- **P1:** necessário para completar resiliência, qualidade, acessibilidade ou cobertura dos requisitos; deve entrar nas entregas seguintes.
- **P2:** hardening operacional ou validação de lançamento que não bloqueia a primeira demonstração funcional, mas deve ser resolvido antes do lançamento correspondente.
- **P:** tarefa pequena e focada, com baixa incerteza e uma única preocupação principal.
- **M:** tarefa de esforço intermediário, com validação de vários casos ou integração de uma superfície.
- **G:** tarefa de maior esforço/incerteza, normalmente com integração ampla, lógica de data/concorrência complexa ou validação transversal. O tamanho é relativo, não uma estimativa de duração.

### Fatias verticais recomendadas

Execute os testes de cada fatia junto com a implementação daquela fatia, embora as tarefas de teste permaneçam agrupadas na Entrega 7 para manter o backlog organizado.

| Ordem | Fatia e resultado demonstrável | Tarefas principais | Prioridade |
|---|---|---|---|
| 1 | **Busca visível:** a pessoa envia uma cidade e vê resultados selecionáveis, estado vazio e loading, sem ainda depender da previsão. | T-01, T-05, T-07, T-08, T-11, T-12, T-13, T-17, T-21, T-24, T-29, T-32 (busca), T-33, T-35, T-39 | P0 |
| 2 | **Clima atual:** selecionar uma cidade mostra condições atuais, valores indisponíveis e erros recuperáveis. | T-03, T-06, T-09, T-10, T-14, T-18, T-20 (composição parcial), T-30, T-31, T-36, T-40, T-42 (cenários correspondentes) | P0 |
| 3 | **Previsão e unidades:** a página completa exibe cinco dias locais e converte todas as temperaturas entre °C e °F. | T-02, T-04, T-15, T-16, T-19, T-20 (composição final), T-22, T-23, T-26, T-28, T-37, T-38, T-41, T-42, T-43 | P0/P1 |
| 4 | **Hardening de experiência:** respostas superadas não substituem dados atuais; fluxos de erro, responsividade e acessibilidade são validados. | T-10, T-22, T-23, T-32 (concorrência), T-44, T-45, T-46 | P1 |
| 5 | **Prontidão para lançamento:** contratos externos, privacidade e métricas operacionais têm validação ou bloqueios documentados. | T-47, T-48, T-49 | P1/P2 |

**Ajuste recomendado para obter valor visível mais cedo:** T-07 atualmente depende da implementação do forecast (T-06), embora o hook de busca (T-08) também dependa de T-07; separe o timeout/classificação comum ou permita concluir primeiro o caminho de geocoding. Além disso, T-20 exige hoje a composição de todos os componentes de clima e previsão. Divida sua entrega em composição inicial da busca e incrementos para clima atual e previsão, mantendo o mesmo `App.tsx`; assim, a Fatia 1 pode ser demonstrada antes de terminar toda a UI meteorológica. Atualize as dependências para cada incremento exigir somente os componentes que utiliza.

## Entrega 1 — Tipos de domínio

### T-01 — Definir os tipos de domínio e estados da página

- **ID:** T-01
- **Título:** Definir os tipos de domínio e estados da página
- **Prioridade:** P0
- **Tamanho:** P
- **Descrição:** Criar contratos TypeScript independentes dos formatos brutos das APIs para cidade, clima, previsão, unidade e estado da página.
- **Critérios de aceite:**
  - Os tipos exportados `City`, `CurrentWeather`, `ForecastDay`, `WeatherSnapshot`, `TemperatureUnit`, `Operation`, `AsyncState` e `WeatherPageState` compilam com TypeScript strict.
  - Campos meteorológicos aceitam `null` e preservam `0` como número válido; cidade, fuso e período do snapshot não são opcionais.
  - `WeatherSnapshot.forecast` representa cinco dias; cada dia tem data e métricas anuláveis.
  - `AsyncState` distingue `idle`, `loading`, `success`, `empty` e `error`; loading/erro identificam a operação e erro identifica sua categoria.
- **Rastreabilidade:** RF2, RF3, RF4 e RF6; AC2.1, AC3.1–AC3.3, AC4.1–AC4.4, AC6.1–AC6.3.
- **Dependências:** Nenhuma
- **Arquivos prováveis:** `src/types/weather.ts`
- **Tipo:** Data

## Entrega 2 — Funções puras

### T-02 — Implementar conversões e formatação de temperatura

- **ID:** T-02
- **Título:** Implementar conversões e formatação de temperatura
- **Prioridade:** P0
- **Tamanho:** P
- **Descrição:** Criar funções puras para converter temperaturas entre Celsius e Fahrenheit.
- **Critérios de aceite:**
  - Para entradas numéricas finitas, as conversões implementam `F = C × 9/5 + 32` e `C = (F − 32) × 5/9`.
  - A formatação de temperaturas disponíveis produz uma casa decimal e o sufixo `°C` ou `°F`, conforme a unidade solicitada.
  - A função de apresentação recebe os valores canônicos sem mutá-los.
  - Entrada `null` produz indisponibilidade, não um valor numérico.
- **Rastreabilidade:** RF4 e RF6; AC4.2, AC4.3 e AC6.1.
- **Dependências:** T-01
- **Arquivos prováveis:** `src/lib/temperature.ts`
- **Tipo:** Data

### T-03 — Mapear códigos meteorológicos para rótulos em pt-BR

- **ID:** T-03
- **Título:** Mapear códigos meteorológicos para rótulos em pt-BR
- **Prioridade:** P1
- **Tamanho:** P
- **Descrição:** Implementar o mapeamento dos códigos WMO utilizados pelo forecast para descrições em português.
- **Critérios de aceite:**
  - Cada código presente na tabela de códigos implementada retorna um rótulo em pt-BR não vazio.
  - Código desconhecido ou `null` retorna o marcador definido para condição indisponível, não o rótulo de céu limpo.
  - A função de mapeamento não depende de estado React ou de componentes de UI.
  - O utilitário também fornece um ícone decorativo por condição e um marcador neutro para códigos ausentes ou desconhecidos.
- **Rastreabilidade:** RF2 e RF3; AC2.1 e AC3.2.
- **Dependências:** T-01
- **Arquivos prováveis:** `src/lib/weatherCodes.ts`
- **Tipo:** Data

### T-04 — Gerar datas locais consecutivas no fuso da cidade

- **ID:** T-04
- **Título:** Gerar datas locais consecutivas no fuso da cidade
- **Prioridade:** P0
- **Tamanho:** M
- **Descrição:** Implementar a geração e validação das cinco datas locais da previsão usando o fuso do forecast.
- **Critérios de aceite:**
  - Para uma data local de referência válida, a função retorna exatamente cinco datas ISO (`YYYY-MM-DD`) em ordem consecutiva.
  - A data de referência é calculada com o fuso IANA recebido, independentemente do fuso configurado no processo/navegador.
  - Uma entrada com data local diferente da UTC gera o primeiro dia a partir da data local; datas consecutivas avançam calendário local em uma unidade por dia.
- **Rastreabilidade:** RF3; AC3.1.
- **Dependências:** T-01
- **Arquivos prováveis:** `src/lib/dates.ts`
- **Tipo:** Data

## Entrega 3 — Services

### T-05 — Implementar busca e normalização de cidades

- **ID:** T-05
- **Título:** Implementar busca e normalização de cidades
- **Prioridade:** P0
- **Tamanho:** M
- **Descrição:** Consultar o geocoding e normalizar os resultados válidos para o tipo `City`.
- **Critérios de aceite:**
  - A URL final usa HTTPS e contém `count=10`, `language=pt`, `format=json` e `name` igual ao termo após trim externo.
  - Em uma requisição capturada, termos contendo Unicode, acentos, hífen e apóstrofo decodificam para o texto original sem espaços externos.
  - Só são normalizados resultados com nome não vazio e latitude/longitude finitas dentro de [-90, 90] e [-180, 180]; campos ausentes não recebem coordenadas inventadas.
  - `id` numérico é convertido para string; quando ausente, a identidade derivada difere para resultados com localizações diferentes e não é persistida.
  - JSON válido sem `results` ou com `results: []` retorna lista vazia; `results` com formato inválido rejeita a operação com erro de resposta inválida.
- **Rastreabilidade:** RF1; AC1.1, AC1.2, AC1.3, AC1.5 e AC1.6; RNF8.
- **Dependências:** T-01
- **Arquivos prováveis:** `src/services/weatherService.ts`
- **Tipo:** Data

### T-06 — Implementar consulta e normalização do forecast

- **ID:** T-06
- **Título:** Implementar consulta e normalização do forecast
- **Prioridade:** P0
- **Tamanho:** G
- **Descrição:** Consultar o forecast para uma cidade selecionada e normalizar condições atuais e cinco datas de previsão.
- **Critérios de aceite:**
  - A URL contém latitude/longitude da cidade selecionada, os nomes `current` e `daily` especificados no plano, `timezone=auto`, `forecast_days=5`, `temperature_unit=celsius` e `timeformat=iso8601`.
  - Snapshot contém a cidade passada à solicitação, um fuso IANA válido e período local identificável; ausência desses dados ou de estrutura utilizável rejeita a resposta.
  - Cada métrica diária normalizada mantém associação ao mesmo índice de `daily.time`; ausência em um índice não desloca valores dos seguintes.
  - A saída contém exatamente cinco datas locais consecutivas; campos ausentes, `null` ou inválidos são `null` no modelo normalizado.
  - Percentuais fora de [0, 100] tornam-se `null`; zero permanece `0`; todas as temperaturas normalizadas são Celsius.
  - Objeto `current` válido com métricas ausentes produz campos atuais `null`, sem rejeitar o snapshot quando identidade, fuso e período estão presentes.
- **Rastreabilidade:** RF2, RF3 e RF6; AC2.1, AC2.2, AC3.1–AC3.3, AC6.1–AC6.3.
- **Dependências:** T-01, T-03, T-04
- **Arquivos prováveis:** `src/services/weatherService.ts`
- **Tipo:** Data

### T-07 — Tratar timeout e falhas das solicitações

- **ID:** T-07
- **Título:** Tratar timeout e falhas das solicitações
- **Prioridade:** P1
- **Tamanho:** M
- **Descrição:** Aplicar limite de tempo e classificação consistente de falhas às operações externas.
- **Critérios de aceite:**
  - Com relógio/fetch controlados, cada tipo de solicitação aborta e rejeita após 10 segundos sem resposta.
  - Erro de rede, timeout, status HTTP não-2xx e JSON de erro do provedor nunca retornam dados de sucesso ou parcial.
  - Esses casos produzem respectivamente as categorias `network`, `timeout` e `invalid-response` definidas pelo contrato de domínio.
  - A camada de serviço não inclui o corpo bruto do provedor na mensagem pública de erro e propaga a falha ao chamador.
- **Rastreabilidade:** RF5 e RF6; AC5.2–AC5.4, AC6.3; RNF1 e RNF6.
- **Dependências:** T-05, T-06
- **Arquivos prováveis:** `src/services/weatherService.ts`
- **Tipo:** Data

## Entrega 4 — Hook e concorrência

### T-08 — Implementar o hook de busca e seleção de cidade

- **ID:** T-08
- **Título:** Implementar o hook de busca e seleção de cidade
- **Prioridade:** P0
- **Tamanho:** M
- **Descrição:** Coordenar termo de busca, resultados, validação local, seleção automática da primeira cidade e seleção explícita de outra em `useWeather`.
- **Critérios de aceite:**
  - Ao submeter termo não vazio, o estado de busca passa a loading antes de a Promise do serviço resolver e o serviço de geocoding é chamado uma vez.
  - Ao submeter string vazia ou só espaços, o serviço não é chamado e o estado expõe erro de validação associado ao campo.
  - Ao resolver busca com lista vazia, forecast não é chamado e os dados meteorológicos não são atribuídos ao termo recém-buscado.
  - Resolver busca com resultados consulta automaticamente o forecast da primeira cidade; chamar ação explícita de seleção inicia exatamente uma consulta para a cidade escolhida.
  - O contrato inicial expõe `status` agregado (`idle`, `loading`, `success`, `error`, `empty`), `data`, `cities`, `error`, `query`, `search(name)`, `selectCity(city)` e `retry()`. Estados separados e unidade de T-09 não fazem parte deste incremento.
- **Rastreabilidade:** RF1 e RF5; AC1.4, AC1.6, AC5.1 e AC5.2.
- **Dependências:** T-05, T-07
- **Arquivos prováveis:** `src/hooks/useWeather.ts`
- **Tipo:** Data

### T-09 — Implementar estado meteorológico e controle de unidade

- **ID:** T-09
- **Título:** Implementar estado meteorológico e controle de unidade
- **Prioridade:** P0
- **Tamanho:** M
- **Descrição:** Completar `useWeather` com estado do forecast, seleção atual e unidade de apresentação.
- **Critérios de aceite:**
  - O estado expõe separadamente status de busca e de consulta meteorológica, distinguindo `loading`, sucesso e erro.
  - Após inicialização do hook, unidade é `celsius`; desmontar e montar um novo hook também inicia em `celsius`, sem ler/escrever armazenamento persistente.
  - Selecionar cidade B enquanto A tem dados remove ou invalida dados A como dados atuais antes da resolução de B; snapshot bem-sucedido identifica B.
  - Alterar unidade de Celsius para Fahrenheit atualiza a unidade sem incrementar o número de chamadas do serviço de forecast.
- **Rastreabilidade:** RF2, RF4 e RF5; AC2.2, AC4.1, AC4.4 e AC5.1.
- **Dependências:** T-07, T-08, T-06
- **Arquivos prováveis:** `src/hooks/useWeather.ts`
- **Tipo:** Data

### T-10 — Implementar concorrência e retry no hook

- **ID:** T-10
- **Título:** Implementar concorrência e retry no hook
- **Prioridade:** P1
- **Tamanho:** M
- **Descrição:** Proteger o estado contra respostas tardias e permitir repetir a operação que falhou.
- **Critérios de aceite:**
  - Em teste de deferred Promises, busca B resolve antes de A e os resultados finais continuam sendo os de B.
  - Em teste de deferred Promises, forecast de cidade B resolve antes de A e o snapshot final continua associado a B.
  - Timeout, rejeição de rede e nova busca levam cada operação a estado final diferente de `loading`.
  - Retry repete a última operação iniciada, inclusive após sucesso ou lista vazia: geocoding com o mesmo termo ou forecast com a mesma cidade. Sem operação anterior, não chama serviços. Resposta cancelada ou obsoleta é ignorada pela identidade/geração da solicitação, inclusive após desmontagem.
- **Rastreabilidade:** RF5; AC1.7, AC2.2, AC5.3–AC5.5; RNF6.
- **Dependências:** T-09
- **Arquivos prováveis:** `src/hooks/useWeather.ts`
- **Tipo:** Data

## Entrega 5 — Componentes

### T-11 — Criar o componente de busca

- **ID:** T-11
- **Título:** Criar o componente de busca
- **Prioridade:** P0
- **Tamanho:** P
- **Descrição:** Implementar o campo de cidade, envio explícito e validação local acessível.
- **Critérios de aceite:**
  - O campo tem nome acessível e o formulário tem ação de envio identificável por role/nome.
  - Enviar por teclado transmite o termo com apenas espaços externos removidos, sem alterar caracteres internos.
  - Submeter vazio ou só espaços mostra erro associado ao campo e não chama callback de busca.
  - Ao navegar por teclado até o campo, o indicador de foco é visível.
- **Rastreabilidade:** RF1; AC1.1, AC1.4, AC1.5; RNF3 e RNF5.
- **Dependências:** T-08
- **Arquivos prováveis:** `src/components/SearchBar.tsx`
- **Tipo:** UI

### T-12 — Exibir resultados de cidades para seleção explícita

- **ID:** T-12
- **Título:** Exibir resultados de cidades para seleção explícita
- **Prioridade:** P0
- **Tamanho:** M
- **Descrição:** Renderizar resultados distinguíveis e permitir selecionar deliberadamente uma cidade.
- **Critérios de aceite:**
  - Cada resultado renderiza o nome e os campos administrativos/país não nulos.
  - Para dois resultados com mesmo nome, divisão e país, são mostradas coordenadas que distinguem cada resultado.
  - Renderizar resultados não chama callback de seleção; ativar um resultado por Enter e por clique chama o callback apenas com a cidade ativada.
- **Rastreabilidade:** RF1; AC1.1–AC1.3; RNF3 e RNF5.
- **Dependências:** T-08
- **Arquivos prováveis:** `src/components/CityResults.tsx`
- **Tipo:** UI

### T-13 — Criar o estado vazio

- **ID:** T-13
- **Título:** Criar o estado vazio
- **Prioridade:** P0
- **Tamanho:** P
- **Descrição:** Implementar a mensagem para uma busca sem correspondências.
- **Critérios de aceite:**
  - A mensagem renderizada informa explicitamente que nenhuma cidade foi encontrada.
  - A mensagem está em uma região identificável por tecnologia assistiva.
  - Montar o componente vazio não chama seleção nem serviço de forecast.
- **Rastreabilidade:** RF1; AC1.6.
- **Dependências:** T-12
- **Arquivos prováveis:** `src/components/states/EmptyState.tsx`
- **Tipo:** UI

### T-14 — Exibir condições meteorológicas atuais

- **ID:** T-14
- **Título:** Exibir condições meteorológicas atuais
- **Prioridade:** P0
- **Tamanho:** M
- **Descrição:** Criar o componente de apresentação das condições atuais da cidade selecionada.
- **Critérios de aceite:**
  - Quando os valores estão presentes, a UI renderiza nome da cidade, temperatura, sensação térmica, umidade relativa e condição.
  - Para cada campo `null`, a UI renderiza marcador textual de indisponibilidade; não renderiza valor de snapshot anterior.
  - Temperaturas exibem valor e símbolo da unidade de apresentação; condição usa rótulo fornecido pelo mapeamento pt-BR.
  - O hero usa temperatura grande e ícone decorativo do utilitário de códigos; exibe também vento em km/h, precipitação atual em mm e pressão à superfície em hPa, com métricas anuláveis no contrato e no mock.
- **Rastreabilidade:** RF2, RF4 e RF6; AC2.1, AC2.2, AC4.1–AC4.3 e AC6.1.
- **Dependências:** T-02, T-03, T-09
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`
- **Tipo:** UI

### T-15 — Criar o cartão de previsão diária

- **ID:** T-15
- **Título:** Criar o cartão de previsão diária
- **Prioridade:** P0
- **Tamanho:** M
- **Descrição:** Implementar a apresentação de métricas e indisponibilidades de um único dia.
- **Critérios de aceite:**
  - Um cartão recebe uma data e renderiza a data mais cada métrica não nula: mínima, máxima, condição e precipitação máxima.
  - Cada métrica `null` tem marcador textual de indisponibilidade; `0` é renderizado como valor.
  - Código desconhecido ou nulo renderiza o marcador de condição indisponível, nunca “céu limpo”.
- **Rastreabilidade:** RF3 e RF6; AC3.2, AC3.3, AC6.1 e AC6.2.
- **Dependências:** T-02, T-03
- **Arquivos prováveis:** `src/components/ForecastDayCard.tsx`
- **Tipo:** UI

### T-16 — Listar os cinco dias da previsão

- **ID:** T-16
- **Título:** Listar os cinco dias da previsão
- **Prioridade:** P0
- **Tamanho:** M
- **Descrição:** Criar o componente que apresenta as cinco datas locais por meio dos cartões diários.
- **Critérios de aceite:**
  - Para uma entrada de cinco dias, a lista renderiza exatamente cinco cartões na mesma ordem cronológica.
  - Um dia com todas as métricas `null` ainda produz cartão e data visível.
  - Cada item é renderizado por `ForecastDayCard` com os dados do mesmo índice.
- **Rastreabilidade:** RF3 e RF6; AC3.1–AC3.3 e AC6.2.
- **Dependências:** T-04, T-15
- **Arquivos prováveis:** `src/components/ForecastList.tsx`
- **Tipo:** UI

### T-17 — Criar o estado de carregamento

- **ID:** T-17
- **Título:** Criar o estado de carregamento
- **Prioridade:** P0
- **Tamanho:** P
- **Descrição:** Apresentar e anunciar a operação em andamento, distinguindo busca de consulta meteorológica.
- **Critérios de aceite:**
  - Operação `search` renderiza mensagem textual de busca; operação `weather` renderiza mensagem textual de consulta meteorológica.
  - A região de loading tem role/status acessível e texto presente no DOM.
  - Desabilitar CSS/animação não remove a indicação textual do estado.
- **Rastreabilidade:** RF5; AC5.1 e AC5.6; RNF3.
- **Dependências:** T-01
- **Arquivos prováveis:** `src/components/states/LoadingState.tsx`
- **Tipo:** UI

### T-18 — Criar o estado de erro com nova tentativa

- **ID:** T-18
- **Título:** Criar o estado de erro com nova tentativa
- **Prioridade:** P0
- **Tamanho:** M
- **Descrição:** Exibir falhas de busca ou consulta meteorológica e permitir repetir a operação aplicável.
- **Critérios de aceite:**
  - Erros `timeout`, `network` e `invalid-response` renderizam mensagens pt-BR distintas, sem texto do corpo bruto da resposta.
  - Quando callback de retry é fornecido, o botão é renderizado e o aciona para a operação indicada; sem callback, botão não é renderizado.
  - A mensagem de erro tem role/semântica de alerta; botão tem nome acessível, recebe foco e ativa por teclado.
- **Rastreabilidade:** RF5 e RF6; AC5.2–AC5.6 e AC6.3; RNF3 e RNF6.
- **Dependências:** T-10
- **Arquivos prováveis:** `src/components/states/ErrorState.tsx`
- **Tipo:** UI

### T-19 — Criar o controle de unidade

- **ID:** T-19
- **Título:** Criar o controle de unidade
- **Prioridade:** P0
- **Tamanho:** P
- **Descrição:** Implementar controle acessível para selecionar Celsius ou Fahrenheit.
- **Critérios de aceite:**
  - O controle expõe as opções Celsius e Fahrenheit e indica programaticamente a opção selecionada.
  - Selecionar cada opção por teclado invoca callback com `celsius` ou `fahrenheit`, respectivamente.
  - O componente não importa nem chama o serviço meteorológico.
- **Rastreabilidade:** RF4; AC4.1–AC4.4; RNF3 e RNF5.
- **Dependências:** T-01
- **Arquivos prováveis:** `src/components/UnitToggle.tsx`
- **Tipo:** UI

## Entrega 6 — Integração da aplicação e estilos

### T-20 — Compor a tela principal do Weather App

- **ID:** T-20
- **Título:** Compor a tela principal do Weather App
- **Prioridade:** P0
- **Tamanho:** G
- **Descrição:** Integrar busca, resultados, estados, clima atual, previsão e unidade em `App`.
- **Incremento de integração real:** Substituir mock e seletor demonstrativo por `useWeather`, iniciando em `idle`; SearchBar chama `search` e ErrorState chama `retry`. Renderizar os cinco estados sem dados antigos. Manter unidade no App e passá-la a clima atual e previsão, sem rede ao alternar. A lista CityResults permanece para etapa posterior.
- **Critérios de aceite:**
  - A tela renderiza SearchBar, CityResults, clima atual, lista de previsão, controle de unidade e estados de loading/vazio/erro conforme o estado correspondente de `useWeather`.
  - Enviar busca, selecionar resultado, acionar retry e alterar unidade chamam a ação correspondente do hook uma vez.
  - Com snapshot da cidade A e seleção vigente B, a tela não identifica nem renderiza A como clima atual de B.
- **Rastreabilidade:** RF1–RF6; AC1.1–AC1.7, AC2.1–AC2.2, AC3.1–AC3.3, AC4.1–AC4.4, AC5.1–AC5.6 e AC6.1–AC6.3.
- **Dependências:** T-10, T-11, T-12, T-13, T-14, T-16, T-17, T-18, T-19
- **Arquivos prováveis:** `src/App.tsx`
- **Tipo:** UI

### T-21 — Conectar a aplicação ao ponto de entrada React

- **ID:** T-21
- **Título:** Conectar a aplicação ao ponto de entrada React
- **Prioridade:** P0
- **Tamanho:** P
- **Descrição:** Garantir que o ponto de entrada monte a tela principal e carregue os estilos globais.
- **Critérios de aceite:**
  - A execução do build conclui sem erro e o ponto de entrada chama `createRoot` no elemento raiz definido pelo HTML, renderizando `App`.
  - A folha de estilos global é importada uma vez pelo ponto de entrada.
  - Não há chamada de API nem transição de estado de negócio em `main.tsx`.
- **Rastreabilidade:** RNF4 (carregamento da aplicação); estrutura técnica do plano.
- **Dependências:** T-20
- **Arquivos prováveis:** `src/main.tsx`
- **Tipo:** UI

### T-22 — Aplicar tema global e layout responsivo da página

- **ID:** T-22
- **Título:** Aplicar tema global e layout responsivo da página
- **Prioridade:** P1
- **Tamanho:** M
- **Descrição:** Aplicar tema dark glassmorphism, estrutura global, foco visível e contraste no layout da página.
- **Critérios de aceite:**
  - Em 320, 768, 1024 e 1440 CSS px, `document.documentElement.scrollWidth <= window.innerWidth`.
  - Texto comum atinge contraste mínimo 4,5:1; texto grande e componentes gráficos essenciais atingem 3:1.
  - Cada controle interativo apresenta foco visível e os estados têm indicação textual além da cor.
- **Rastreabilidade:** RNF2 e RNF3.
- **Dependências:** T-20, T-21
- **Arquivos prováveis:** `src/styles/index.css`, `src/App.tsx`
- **Tipo:** UI

### T-23 — Ajustar responsividade dos cartões de previsão

- **ID:** T-23
- **Título:** Ajustar responsividade dos cartões de previsão
- **Prioridade:** P1
- **Tamanho:** M
- **Descrição:** Adaptar a lista e os cartões para exibir as cinco datas de forma legível em telas estreitas e largas.
- **Critérios de aceite:**
  - Nos viewports 320, 768, 1024 e 1440 CSS px, lista e cartões permanecem visíveis e operáveis.
  - Em cada viewport, `document.documentElement.scrollWidth <= window.innerWidth`.
  - Ao aplicar layout responsivo, a ordem das cinco datas e o texto de indisponibilidade permanecem iguais aos dados de entrada.
- **Rastreabilidade:** RF3 e RF6; AC3.1, AC3.3 e AC6.2; RNF2.
- **Dependências:** T-16, T-22
- **Arquivos prováveis:** `src/components/ForecastList.tsx`, `src/components/ForecastDayCard.tsx`
- **Tipo:** UI

## Entrega 7 — Testes e infraestrutura de teste

### T-24 — Configurar testes unitários e de componentes

- **ID:** T-24
- **Título:** Configurar testes unitários e de componentes
- **Prioridade:** P0
- **Tamanho:** M
- **Descrição:** Preparar Vitest e Testing Library para executar testes determinísticos, sem chamadas a APIs externas.
- **Critérios de aceite:**
  - `pnpm test` executa os testes unitários e de componentes e retorna código zero quando todos passam.
  - Vitest descobre ao menos um teste TypeScript e um teste React de exemplo sem chamar APIs externas.
  - A configuração TypeScript mantém `strict: true`.
- **Rastreabilidade:** Estratégia de testes da spec; RF1–RF6 (verificação dos respectivos critérios de aceite).
- **Dependências:** Nenhuma
- **Arquivos prováveis:** `package.json`, `vitest.config.ts`
- **Tipo:** Infra

### T-25 — Configurar execução E2E com Playwright

- **ID:** T-25
- **Título:** Configurar execução E2E com Playwright
- **Prioridade:** P1
- **Tamanho:** M
- **Descrição:** Preparar o runner E2E para executar cenários com APIs interceptadas e mockadas.
- **Critérios de aceite:**
  - `pnpm test:e2e` inicia a suíte Playwright e retorna código zero quando todos os testes passam.
  - Um teste E2E de exemplo intercepta geocoding e forecast e termina sem requisição a esses hosts externos.
  - `pnpm test` continua executando a suíte unitária sem iniciar Playwright.
- **Rastreabilidade:** Estratégia E2E da spec; RF1–RF6; RNF7.
- **Dependências:** T-24
- **Arquivos prováveis:** `package.json`, `playwright.config.ts`
- **Tipo:** Infra

### T-26 — Testar conversão e formatação de temperatura

- **ID:** T-26
- **Título:** Testar conversão e formatação de temperatura
- **Prioridade:** P0
- **Tamanho:** P
- **Descrição:** Criar testes unitários dedicados para conversão Celsius/Fahrenheit, formatação e valores ausentes.
- **Critérios de aceite:**
  - `0 °C` resulta em `32,0 °F` e `32 °F` resulta em `0,0 °C`.
  - Temperaturas têm uma casa decimal e unidade explícita.
  - Valores ausentes são apresentados como indisponíveis, nunca como zero.
  - O arquivo contém testes unitários do utilitário de temperatura, sem renderização de componentes ou chamadas de API.
- **Rastreabilidade:** RF4 e RF6; AC4.2, AC4.3 e AC6.1.
- **Dependências:** T-24, T-02
- **Arquivos prováveis:** `tests/unit/temperature.test.ts`
- **Tipo:** Test

### T-27 — Testar rótulos de códigos meteorológicos

- **ID:** T-27
- **Título:** Testar rótulos de códigos meteorológicos
- **Prioridade:** P1
- **Tamanho:** P
- **Descrição:** Verificar os rótulos meteorológicos suportados e o tratamento de códigos desconhecidos.
- **Critérios de aceite:**
  - Há ao menos um teste para cada código listado no mapeamento, e cada teste verifica o rótulo pt-BR esperado.
  - Testes para código desconhecido e `null` verificam o marcador de indisponibilidade e rejeitam o rótulo de céu limpo.
- **Rastreabilidade:** RF2 e RF3; AC2.1 e AC3.2.
- **Dependências:** T-24, T-03
- **Arquivos prováveis:** `tests/unit/weatherCodes.test.ts`
- **Tipo:** Test

### T-28 — Testar geração de datas locais

- **ID:** T-28
- **Título:** Testar geração de datas locais
- **Prioridade:** P1
- **Tamanho:** P
- **Descrição:** Validar o período local de cinco dias e os casos de mudança de data e fuso.
- **Critérios de aceite:**
  - Testes verificam que a saída contém exatamente cinco datas ISO consecutivas e ordenadas.
  - Um caso de teste usa fuso cuja data local difere da UTC e verifica que o primeiro dia corresponde à data local.
  - Um caso de teste cobre a passagem de fim de mês/ano; datas sem métricas continuam no período com métricas `null`.
- **Rastreabilidade:** RF3 e RF6; AC3.1, AC3.3 e AC6.2.
- **Dependências:** T-24, T-04
- **Arquivos prováveis:** `tests/unit/dates.test.ts`
- **Tipo:** Test

### T-29 — Testar busca e normalização de cidades

- **ID:** T-29
- **Título:** Testar busca e normalização de cidades
- **Prioridade:** P0
- **Tamanho:** M
- **Descrição:** Testar o service de geocoding com `fetch` mockado e respostas determinísticas.
- **Critérios de aceite:**
  - Testes inspecionam URL/propriedades de fetch e verificam HTTPS, parâmetros, trim externo e round-trip de Unicode, acento, hífen e apóstrofo.
  - Há casos separados para resultado válido, resposta sem resultados e identidade composta para dois locais diferentes sem ID.
  - Latitude/longitude fora da faixa, não finitas ou ausentes e `results` malformado rejeitam com erro; não retornam lista vazia.
  - O mock de fetch falha o teste se qualquer chamada não interceptada tentar acessar hosts externos.
  - Os testes mockam `fetch` diretamente e verificam a requisição e a resposta normalizada sem rede real.
- **Rastreabilidade:** RF1; AC1.1, AC1.5 e AC1.6; RNF8.
- **Dependências:** T-24, T-05
- **Arquivos prováveis:** `tests/unit/weatherService.test.ts`
- **Tipo:** Test

### T-30 — Testar normalização de forecast

- **ID:** T-30
- **Título:** Testar normalização de forecast
- **Prioridade:** P0
- **Tamanho:** M
- **Descrição:** Testar o service de forecast com `fetch` mockado e fixtures completos, parciais e inválidos.
- **Critérios de aceite:**
  - Testes verificam métricas completas e ausentes, preservação de zero e normalização para `null` de percentuais fora de [0, 100].
  - Um fixture com arrays diários em que uma métrica falta em um índice verifica que valores de índices posteriores permanecem associados à data correta; todos os fixtures válidos retornam cinco datas.
  - Fixtures sem fuso, período ou estrutura utilizável rejeitam com erro de resposta inválida.
  - O mock falha se houver tentativa de chamada não interceptada à API externa.
  - Os testes mockam `fetch` diretamente e não fazem requisições reais à Open-Meteo.
- **Rastreabilidade:** RF2, RF3 e RF6; AC2.1, AC2.2, AC3.1–AC3.3 e AC6.1–AC6.3.
- **Dependências:** T-24, T-06
- **Arquivos prováveis:** `tests/unit/weatherService.test.ts`
- **Tipo:** Test

### T-31 — Testar timeout e falhas das solicitações

- **ID:** T-31
- **Título:** Testar timeout e falhas das solicitações
- **Prioridade:** P1
- **Tamanho:** M
- **Descrição:** Verificar timeout, erros HTTP, falhas de rede e classificação de respostas inválidas.
- **Critérios de aceite:**
  - Um teste com relógio falso verifica rejeição ao avançar exatamente 10 segundos sem resposta.
  - Testes separados para HTTP não-2xx, payload com erro do provedor e rejeição de rede verificam a categoria esperada e ausência de resultado de sucesso.
  - O mock de rede rejeita chamadas não interceptadas a serviços externos.
- **Rastreabilidade:** RF5 e RF6; AC5.2–AC5.4 e AC6.3; RNF1 e RNF6.
- **Dependências:** T-24, T-07
- **Arquivos prováveis:** `tests/unit/weatherService.test.ts`
- **Tipo:** Test

### T-32 — Testar transições e concorrência do hook

- **ID:** T-32
- **Título:** Testar transições e concorrência do hook
- **Prioridade:** P0
- **Tamanho:** M
- **Descrição:** Testar os estados de busca e forecast, alternância de unidade, respostas tardias e retry.
- **Critérios de aceite:**
  - Há testes independentes para validação vazia, `loading`, lista vazia, sucesso, erro e seleção explícita.
  - Testes com Promises controladas resolvem busca e forecast antigos por último e confirmam que o estado final preserva a solicitação recente.
  - Após falha, retry chama o serviço da operação falha; mudar unidade não aumenta a contagem de chamadas de forecast.
  - Serviços são mockados e nenhuma chamada externa é feita.
- **Rastreabilidade:** RF1, RF4, RF5; AC1.4, AC1.6, AC1.7, AC2.2, AC4.4, AC5.1–AC5.5.
- **Dependências:** T-24, T-08, T-09, T-10
- **Arquivos prováveis:** `tests/unit/useWeather.test.ts`
- **Tipo:** Test

### T-33 — Testar o componente de busca

- **ID:** T-33
- **Título:** Testar o componente de busca
- **Prioridade:** P0
- **Tamanho:** P
- **Descrição:** Verificar envio, validação e acessibilidade básica do campo de busca.
- **Critérios de aceite:**
  - Testes submetem o formulário por Enter e verificam callback com termo externo aparado e texto Unicode preservado.
  - Submissões de `""` e `"   "` não chamam callback e exibem erro ligado ao campo.
  - Campo e ação são localizados por role/nome acessível, sem seletor CSS.
- **Rastreabilidade:** RF1; AC1.1, AC1.4, AC1.5; RNF3 e RNF5.
- **Dependências:** T-24, T-11
- **Arquivos prováveis:** `tests/unit/SearchBar.test.tsx`
- **Tipo:** Test

### T-34 — Testar resultados e seleção de cidades

- **ID:** T-34
- **Título:** Testar resultados e seleção de cidades
- **Prioridade:** P1
- **Tamanho:** P
- **Descrição:** Verificar rótulos, distinção de homônimos e seleção explícita dos resultados.
- **Critérios de aceite:**
  - Casos de teste verificam apresentação com divisão/país presentes e omitidos.
  - Para resultados com rótulos iguais, testes encontram coordenadas distintas nos rótulos apresentados.
  - Renderização sem interação não chama `onSelect`; Enter e clique chamam `onSelect` uma vez com o ID correspondente.
- **Rastreabilidade:** RF1; AC1.1–AC1.3; RNF3 e RNF5.
- **Dependências:** T-24, T-12
- **Arquivos prováveis:** `tests/unit/CityResults.test.tsx`
- **Tipo:** Test

### T-35 — Testar o estado vazio

- **ID:** T-35
- **Título:** Testar o estado vazio
- **Prioridade:** P1
- **Tamanho:** P
- **Descrição:** Criar teste de componente isolado para a mensagem e semântica acessível de busca sem resultados.
- **Critérios de aceite:**
  - Teste localiza a mensagem “nenhuma cidade encontrada” por texto acessível.
  - A região possui semântica esperada e o mock de seleção/forecast permanece sem chamadas.
  - O teste renderiza `EmptyState` com Testing Library, sem montar a página `App`.
- **Rastreabilidade:** RF1; AC1.6.
- **Dependências:** T-24, T-13
- **Arquivos prováveis:** `tests/unit/EmptyState.test.tsx`
- **Tipo:** Test

### T-36 — Testar apresentação das condições atuais

- **ID:** T-36
- **Título:** Testar apresentação das condições atuais
- **Prioridade:** P0
- **Tamanho:** P
- **Descrição:** Validar informações disponíveis, valores zero e campos ausentes no clima atual.
- **Critérios de aceite:**
  - Teste com fixture completa encontra cidade, temperatura, sensação, umidade e condição.
  - Teste com `0` renderiza zero; teste com `null` renderiza marcador de indisponibilidade e não valor de clima anterior.
  - O código meteorológico fixture é exibido pelo rótulo pt-BR esperado.
  - Vento, precipitação e pressão são verificados com valores presentes, zero e `null`; mudar a unidade converte temperatura e sensação sem alterar as demais métricas.
- **Rastreabilidade:** RF2 e RF6; AC2.1, AC2.2 e AC6.1.
- **Dependências:** T-24, T-14
- **Arquivos prováveis:** `tests/unit/CurrentWeather.test.tsx`
- **Tipo:** Test

### T-37 — Testar o cartão de previsão diária

- **ID:** T-37
- **Título:** Testar o cartão de previsão diária
- **Prioridade:** P1
- **Tamanho:** P
- **Descrição:** Verificar métricas completas, parciais e ausentes em um cartão de previsão.
- **Critérios de aceite:**
  - Fixture com métricas completas verifica data, temperaturas mínima/máxima, condição e precipitação máxima.
  - Fixture com uma ou mais métricas `null` verifica marcador indisponível, mantendo o cartão visível.
  - Fixture com zero verifica que o texto renderizado contém zero e não indisponibilidade.
- **Rastreabilidade:** RF3 e RF6; AC3.2, AC3.3, AC6.1 e AC6.2.
- **Dependências:** T-24, T-15
- **Arquivos prováveis:** `tests/unit/ForecastDayCard.test.tsx`
- **Tipo:** Test

### T-38 — Testar a lista de previsão

- **ID:** T-38
- **Título:** Testar a lista de previsão
- **Prioridade:** P1
- **Tamanho:** P
- **Descrição:** Verificar a quantidade, a ordem e a preservação de datas sem métricas.
- **Critérios de aceite:**
  - Teste de lista com cinco datas confirma exatamente cinco cartões e sequência esperada.
  - Fixture com um dia sem métricas confirma que sua data e seu cartão permanecem visíveis.
- **Rastreabilidade:** RF3 e RF6; AC3.1–AC3.3 e AC6.2.
- **Dependências:** T-24, T-16
- **Arquivos prováveis:** `tests/unit/ForecastList.test.tsx`
- **Tipo:** Test

### T-39 — Testar o estado de carregamento

- **ID:** T-39
- **Título:** Testar o estado de carregamento
- **Prioridade:** P1
- **Tamanho:** P
- **Descrição:** Criar testes de componente isolado para loading de busca e de consulta meteorológica.
- **Critérios de aceite:**
  - Testes com `search` e `weather` verificam as mensagens textuais correspondentes.
  - A região pode ser encontrada por role `status` ou semântica equivalente definida no componente.
  - O teste renderiza `LoadingState` com Testing Library, sem montar a página `App`.
- **Rastreabilidade:** RF5; AC5.1 e AC5.6; RNF3.
- **Dependências:** T-24, T-17
- **Arquivos prováveis:** `tests/unit/LoadingState.test.tsx`
- **Tipo:** Test

### T-40 — Testar estado de erro e nova tentativa

- **ID:** T-40
- **Título:** Testar estado de erro e nova tentativa
- **Prioridade:** P1
- **Tamanho:** P
- **Descrição:** Criar testes de componente isolado para mensagens de erro, acessibilidade e retry.
- **Critérios de aceite:**
  - Testes para `timeout`, `network` e `invalid-response` verificam mensagem diferente e ausência de conteúdo bruto fornecido no fixture.
  - Com callback de retry, ativar o botão chama o callback uma vez; sem callback, botão não está presente.
  - Alerta e botão são encontrados por roles e nomes acessíveis.
  - O teste renderiza `ErrorState` com Testing Library, sem montar a página `App`.
- **Rastreabilidade:** RF5 e RF6; AC5.2–AC5.6 e AC6.3; RNF3 e RNF6.
- **Dependências:** T-24, T-18
- **Arquivos prováveis:** `tests/unit/ErrorState.test.tsx`
- **Tipo:** Test

### T-41 — Testar o controle de unidade

- **ID:** T-41
- **Título:** Testar o controle de unidade
- **Prioridade:** P1
- **Tamanho:** P
- **Descrição:** Verificar seleção, estado visível e operação por teclado do controle de unidade.
- **Critérios de aceite:**
  - Testes selecionam Celsius e Fahrenheit e verificam o valor enviado ao callback em cada caso.
  - A unidade ativa é encontrada por estado acessível (`checked`, `pressed` ou equivalente).
  - Nenhuma função de serviço é invocada durante a interação.
- **Rastreabilidade:** RF4; AC4.1–AC4.4; RNF3 e RNF5.
- **Dependências:** T-24, T-19
- **Arquivos prováveis:** `tests/unit/UnitToggle.test.tsx`
- **Tipo:** Test

### T-42 — Testar composição da tela principal

- **ID:** T-42
- **Título:** Testar composição da tela principal
- **Prioridade:** P0
- **Tamanho:** M
- **Descrição:** Verificar a integração dos principais componentes e ações da página sem serviços externos.
- **Critérios de aceite:**
  - Testes com hook/serviços mockados cobrem renderização inicial, resultados, seleção, loading, vazio e erro.
  - Com fixture de clima atual e cinco dias, alternar para Fahrenheit atualiza cada temperatura disponível, mantendo cidade e as cinco datas inalteradas.
  - Contador do mock de forecast permanece inalterado após alternar unidade.
- **Rastreabilidade:** RF1–RF6; AC1.1–AC1.7, AC2.1–AC2.2, AC3.1–AC3.3, AC4.1–AC4.4, AC5.1–AC5.6 e AC6.1–AC6.3.
- **Dependências:** T-24, T-20
- **Arquivos prováveis:** `tests/unit/App.test.tsx`
- **Tipo:** Test

### T-43 — Validar o fluxo principal em E2E

- **ID:** T-43
- **Título:** Validar o fluxo principal em E2E
- **Prioridade:** P0
- **Tamanho:** M
- **Descrição:** Testar em Playwright o fluxo principal completo em desktop e viewport mobile.
- **Critérios de aceite:**
  - Em viewport desktop de 1440 px e mobile de 320 px, o cenário submete busca, seleciona explicitamente um resultado e verifica cidade, métricas atuais e exatamente cinco datas.
  - Em ambos os viewports, alternar para Fahrenheit atualiza todas as temperaturas disponíveis sem alterar cidade/datas nem aumentar o contador de chamadas forecast.
  - Em ambos os viewports, `document.documentElement.scrollWidth <= window.innerWidth`.
  - Interceptações Playwright atendem todas as chamadas geocoding/forecast; teste falha para requisição não interceptada aos hosts externos.
- **Rastreabilidade:** RF1–RF4; AC1.1–AC1.5, AC2.1, AC3.1–AC3.2 e AC4.1–AC4.4.
- **Dependências:** T-25, T-20, T-22, T-42, T-21
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`
- **Tipo:** Test

### T-44 — Validar falhas e concorrência em E2E

- **ID:** T-44
- **Título:** Validar falhas e concorrência em E2E
- **Prioridade:** P1
- **Tamanho:** M
- **Descrição:** Testar ausência de resultados, retry e descarte de respostas tardias no navegador.
- **Critérios de aceite:**
  - Cenário sem resultados verifica mensagem vazia, nenhuma seleção e zero chamadas ao forecast.
  - Cenário de falha verifica que loading termina e retry inicia nova chamada da mesma operação.
  - Cenários com respostas atrasadas verificam que resposta antiga de busca e forecast não substitui o conteúdo da operação mais recente.
  - Todas as chamadas externas são interceptadas; atraso é controlado pelo teste, não por espera temporal arbitrária.
- **Rastreabilidade:** RF1, RF5 e RF6; AC1.6–AC1.7, AC2.2 e AC5.2–AC5.5.
- **Dependências:** T-25, T-43
- **Arquivos prováveis:** `tests/e2e/weather-errors.spec.ts`
- **Tipo:** Test

### T-45 — Configurar a matriz de navegadores do Playwright

- **ID:** T-45
- **Título:** Configurar a matriz de navegadores do Playwright
- **Prioridade:** P2
- **Tamanho:** M
- **Descrição:** Preparar os projetos do runner para validar os navegadores exigidos pela spec.
- **Critérios de aceite:**
  - A configuração declara projetos para Chromium/Chrome, Firefox, WebKit/Safari desktop, Edge, Safari iOS e Chrome Android, ou documenta a limitação técnica de cada projeto não executável.
  - A matriz de execução registra as versões estável atual e anterior de cada navegador na data do lançamento e quais foram efetivamente executadas.
  - O script E2E permite selecionar projetos da matriz; `pnpm test` continua independente da matriz Playwright.
- **Rastreabilidade:** RNF7; estratégia de compatibilidade da spec.
- **Dependências:** T-25
- **Arquivos prováveis:** `playwright.config.ts`
- **Tipo:** Infra

### T-46 — Validar acessibilidade e viewports em E2E

- **ID:** T-46
- **Título:** Validar acessibilidade e viewports em E2E
- **Prioridade:** P1
- **Tamanho:** G
- **Descrição:** Verificar por Playwright a operação por teclado, anúncios acessíveis e responsividade nos fluxos principais.
- **Critérios de aceite:**
  - Em 320, 768, 1024 e 1440 CSS px, o teste verifica `scrollWidth <= innerWidth`.
  - Playwright completa por teclado busca, seleção, alternância de unidade e retry, e localiza loading/erro por roles ou regiões acessíveis.
  - Testes são executáveis nos projetos definidos pela matriz de navegadores e interceptam APIs externas.
- **Rastreabilidade:** RF1, RF4, RF5; AC5.6; RNF2, RNF3 e RNF7.
- **Dependências:** T-22, T-23, T-43, T-44, T-45
- **Arquivos prováveis:** `tests/e2e/weather-accessibility.spec.ts`
- **Tipo:** Test

## Entrega 8 — Hardening e prontidão para lançamento

### T-47 — Validar contratos e condições de uso da Open-Meteo

- **ID:** T-47
- **Título:** Validar contratos e condições de uso da Open-Meteo
- **Prioridade:** P2
- **Tamanho:** M
- **Descrição:** Verificar na documentação oficial os endpoints, parâmetros, variáveis, cobertura, limites, licença, atribuição e termos comerciais.
- **Critérios de aceite:**
  - Para geocoding e forecast, cada endpoint, parâmetro e variável enviada consta em registro com URL de documentação oficial, valor implementado e resultado da verificação.
  - Cobertura, limites, licença, atribuição e condições de uso aplicáveis têm resultado registrado como confirmado, não aplicável com justificativa ou pendente.
  - Qualquer item pendente permanece identificado como bloqueio de lançamento; nenhuma aprovação comercial é inferida sem evidência.
- **Rastreabilidade:** Plano, seção External APIs e Risks & Trade-offs; Open Question da spec sobre confirmação dos parâmetros/campos e risco de uso comercial/cobertura/termos.
- **Dependências:** T-05, T-06
- **Arquivos prováveis:** `README.md`, documentação operacional
- **Tipo:** Infra

### T-48 — Documentar transmissão e tratamento de dados de busca

- **ID:** T-48
- **Título:** Documentar transmissão e tratamento de dados de busca
- **Prioridade:** P1
- **Tamanho:** M
- **Descrição:** Atualizar a documentação de privacidade sobre o envio dos termos de cidade ao provedor e o tratamento local.
- **Critérios de aceite:**
  - A política de privacidade identifica Open-Meteo e informa que o termo da cidade é transmitido para executar a busca, incluindo tratamento pelo provedor conforme conhecido.
  - Inspeção do código/configuração confirma ausência de chamadas de geolocalização e de gravação de termo/coordenadas em armazenamento persistente, logs identificáveis ou analytics.
  - Aprovação ainda pendente da política ou do tratamento do provedor está registrada como bloqueio de lançamento.
- **Rastreabilidade:** RNF8; AC1.5; Open Question da spec sobre aprovação da política de privacidade.
- **Dependências:** T-05
- **Arquivos prováveis:** `README.md`, política de privacidade
- **Tipo:** Infra

### T-49 — Definir verificações operacionais de performance e disponibilidade

- **ID:** T-49
- **Título:** Definir verificações operacionais de performance e disponibilidade
- **Prioridade:** P2
- **Tamanho:** G
- **Descrição:** Documentar como medir os objetivos de performance e disponibilidade e distinguir a aplicação da fonte externa.
- **Critérios de aceite:**
  - O procedimento define P95 de até 3 s para solicitações bem-sucedidas quando a fonte está disponível, além de contagens separadas de erro e timeout.
  - A verificação sintética é agendada a cada minuto e só registra sucesso se a aplicação carregar e busca e unidade estiverem operáveis.
  - O registro define indicadores separados para disponibilidade da aplicação, disponibilidade da Open-Meteo e sucesso de consultas; disponibilidade mensal alvo da aplicação é 99,5%, excluindo manutenção programada.
  - A documentação identifica proprietário e mecanismo de execução; se ainda não escolhidos, registra-os como pendentes, sem alegar monitoramento ativo.
- **Rastreabilidade:** RNF1 e RNF4; Open Questions da spec sobre aprovação das metas de performance e disponibilidade.
- **Dependências:** T-21
- **Arquivos prováveis:** `README.md`, documentação de operação
- **Tipo:** Infra
