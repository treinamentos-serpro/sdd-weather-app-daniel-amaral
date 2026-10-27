# Especificação do Produto: Weather App

## Overview

O Weather App permite que pessoas consultem as condições meteorológicas de uma cidade e planejem os próximos dias, em computadores e dispositivos móveis. A interface da versão inicial será em português do Brasil, não exigirá autenticação e apresentará temperaturas em Celsius por padrão.

**Objetivos do produto**

- Permitir encontrar e selecionar uma cidade pelo nome.
- Apresentar o clima atual e a previsão diária de hoje mais os quatro dias seguintes.
- Permitir alternar entre Celsius e Fahrenheit sem inconsistência nos valores apresentados.
- Comunicar claramente o progresso e os problemas durante buscas e consultas meteorológicas.

**Definições**

- “Hoje” e as datas da previsão são determinados pelo fuso horário da cidade selecionada.
- “Próximos 5 dias” significa a data local de hoje e as quatro datas de calendário seguintes, inclusive.
- A consulta atual mínima contém temperatura, sensação térmica, umidade relativa em porcentagem e condição meteorológica, apresentada em português do Brasil.
- Cada dia da previsão contém temperaturas mínima e máxima, condição meteorológica e probabilidade máxima de precipitação em porcentagem. Temperaturas são exibidas com uma casa decimal e unidade explícita.
- “Resposta parcial” é uma resposta que identifica a cidade, o fuso horário e o período consultados, mas não contém um ou mais campos meteorológicos esperados. Uma resposta sem identidade da cidade, fuso, período ou estrutura utilizável é inválida, não parcial.
- Uma preferência de unidade vale somente enquanto a página atual permanecer aberta. Uma nova carga da página começa em Celsius.

## Functional Requirements

- **RF1 — Busca de cidades:** A pessoa usuária deve poder enviar uma busca por nome de cidade. A busca ocorre após envio explícito, preserva letras Unicode e normaliza espaços no início e no fim. Cada resultado deve mostrar nome da cidade, divisão administrativa e país quando disponíveis, e exigir seleção explícita.
- **RF2 — Clima atual:** Para a cidade selecionada, o sistema deve exibir temperatura, sensação térmica, umidade relativa e condição meteorológica em português do Brasil.
- **RF3 — Previsão de cinco dias:** Para a cidade selecionada, o sistema deve exibir cinco datas locais consecutivas, começando por hoje, com temperaturas mínima e máxima, condição meteorológica e probabilidade máxima de precipitação.
- **RF4 — Unidade de temperatura:** O sistema deve permitir alternar entre Celsius e Fahrenheit, atualizar todas as temperaturas visíveis e identificar a unidade em cada valor. A unidade padrão em cada carga da página é Celsius; a escolha não é persistida.
- **RF5 — Estados de busca e consulta:** O sistema deve apresentar estados identificáveis de carregamento e erro para busca e consulta meteorológica, encerrar carregamentos em erro ou timeout e permitir nova tentativa quando aplicável. Uma solicitação sem resposta em 10 segundos expira.
- **RF6 — Dados incompletos:** O sistema deve exibir campos e dias válidos de uma resposta parcial, identificar os ausentes como indisponíveis e nunca substituir dados ausentes por zero, dados antigos ou valores inventados. Respostas sem cidade, fuso horário ou período identificáveis são tratadas como inválidas.

## User Stories

O discovery não define personas nomeadas; refere-se genericamente a usuários e descreve seus objetivos. As stories abaixo preservam essa persona genérica e a particularizam pelo objetivo de uso, sem pressupor características não documentadas.

- **US1 (RF1 — Busca de cidades):** Como pessoa usuária que procura uma cidade, quero buscá-la pelo nome e identificar o resultado correto para consultar o clima daquele local.
- **US2 (RF2 — Clima atual):** Como pessoa usuária que consulta as condições do tempo, quero ver o clima atual da cidade selecionada para entender as condições no momento.
- **US3 (RF3 — Previsão de cinco dias):** Como pessoa usuária que planeja os próximos dias, quero consultar a previsão diária de cinco dias para antecipar as condições meteorológicas.
- **US4 (RF4 — Unidade de temperatura):** Como pessoa usuária que prefere uma unidade de temperatura, quero alternar entre Celsius e Fahrenheit para interpretar os valores na unidade que conheço.
- **US5 (RF5 — Estados de busca e consulta):** Como pessoa usuária aguardando uma busca ou consulta meteorológica, quero saber quando ela está carregando ou falhou para entender o estado da solicitação e como proceder.
- **US6 (RF6 — Dados incompletos):** Como pessoa usuária consultando o tempo, quero distinguir dados disponíveis dos indisponíveis para não interpretar informação ausente como válida.

## Acceptance Criteria

### US1 / RF1 — Busca de cidades

- **AC1.1:** Given um termo não vazio com espaços externos, When a pessoa usuária envia a busca, Then a busca usa o termo sem os espaços externos e cada resultado mostra o nome da cidade e os campos de divisão administrativa e país que estiverem disponíveis.
- **AC1.2:** Given resultados homônimos com campos de localização distintos, When os resultados são exibidos, Then esses campos permitem distinguir cada resultado e nenhum deles é selecionado automaticamente.
- **AC1.3:** Given resultados que ainda tenham rótulos idênticos após exibir nome, divisão administrativa e país, When a lista é exibida, Then cada resultado também mostra coordenadas suficientes para diferenciá-lo.
- **AC1.4:** Given um campo vazio ou composto somente por espaços, When a pessoa usuária tenta enviar a busca, Then nenhuma solicitação é enviada e uma mensagem de validação é exibida junto ao campo.
- **AC1.5:** Given um termo com acentos, hífens ou apóstrofos, When a pessoa usuária o envia, Then esses caracteres são preservados na busca e no texto exibido, sem serem interpretados como conteúdo executável.
- **AC1.6:** Given que a busca retorna lista vazia, When a resposta é recebida, Then a interface informa que nenhuma cidade foi encontrada, não inicia consulta meteorológica e não apresenta dados da cidade anteriormente selecionada como resultado da nova busca.
- **AC1.7:** Given uma busca anterior ainda em andamento e uma busca mais recente enviada, When a resposta da busca anterior chega por último, Then ela não substitui os resultados da busca mais recente.

### US2 / RF2 — Clima atual

- **AC2.1:** Given uma resposta atual completa para uma cidade selecionada, When a consulta termina com sucesso, Then a interface mostra o nome da cidade, temperatura, sensação térmica, umidade relativa e condição meteorológica em português do Brasil.
- **AC2.2:** Given que uma resposta atual pertence a uma cidade diferente da seleção vigente, When essa resposta é recebida, Then ela não é apresentada como clima da cidade selecionada.

### US3 / RF3 — Previsão de cinco dias

- **AC3.1:** Given uma cidade com fuso horário identificado e uma data local de referência, When a previsão é exibida, Then há exatamente cinco datas consecutivas em ordem cronológica, começando pela data local da cidade, inclusive quando ela difere da data UTC.
- **AC3.2:** Given uma resposta completa de previsão para a cidade selecionada, When os cinco dias são exibidos, Then cada dia mostra temperatura mínima, temperatura máxima, condição meteorológica e probabilidade máxima de precipitação correspondentes àquela data.
- **AC3.3:** Given que uma data do período não tem dados meteorológicos, When a previsão é exibida, Then a data permanece entre as cinco e seus campos ausentes são identificados como indisponíveis.

### US4 / RF4 — Alternância de unidade

- **AC4.1:** Given uma nova carga da página, When a interface meteorológica é exibida, Then Celsius está selecionado e todas as temperaturas disponíveis exibem °C.
- **AC4.2:** Given clima e previsão exibidos em Celsius, When a pessoa usuária seleciona Fahrenheit, Then todas as temperaturas disponíveis são convertidas, exibem °F e usam uma casa decimal; 0 °C é exibido como 32,0 °F.
- **AC4.3:** Given clima e previsão exibidos em Fahrenheit, When a pessoa usuária seleciona Celsius, Then todas as temperaturas disponíveis são convertidas, exibem °C e usam uma casa decimal; 32 °F é exibido como 0,0 °C.
- **AC4.4:** Given cidade e cinco datas exibidas, When a pessoa usuária alterna a unidade, Then a cidade e as datas permanecem inalteradas. Given uma nova carga da página, When a preferência não é persistida, Then Celsius volta a ser a unidade selecionada.

### US5 / RF5 — Carregamento e falhas

- **AC5.1:** Given uma busca ou consulta iniciada sem resposta recebida, When a solicitação começa, Then a interface apresenta imediatamente texto identificando qual operação está carregando.
- **AC5.2:** Given uma busca ou consulta que retorna erro, When a falha é recebida, Then o carregamento termina e a mensagem identifica a operação que falhou.
- **AC5.3:** Given uma busca ou consulta sem resposta por 10 segundos, When o limite é atingido, Then o carregamento termina, a interface informa timeout e oferece uma ação de nova tentativa.
- **AC5.4:** Given uma mensagem de falha com nova tentativa disponível, When a pessoa usuária aciona essa ação, Then uma nova solicitação da mesma operação é iniciada.
- **AC5.5:** Given uma solicitação anterior ainda em andamento e uma solicitação mais recente para outra cidade, When a resposta anterior chega por último, Then ela não substitui o estado ou os dados da solicitação mais recente.
- **AC5.6:** Given um estado de carregamento ou erro, When a interface o apresenta, Then há texto visível e o estado é anunciado por tecnologia assistiva sem depender somente de cor.

### US6 / RF6 — Dados incompletos

- **AC6.1:** Given uma resposta com cidade, fuso horário e período identificáveis, mas com um campo meteorológico ausente, When os dados são exibidos, Then os campos válidos permanecem visíveis e o campo ausente é identificado como indisponível, nunca como zero ou dado anterior.
- **AC6.2:** Given uma resposta de previsão com cidade e fuso horário identificáveis, mas sem dados para uma ou mais das cinco datas, When a previsão é exibida, Then as cinco datas continuam visíveis e cada dia sem dados é identificado como indisponível.
- **AC6.3:** Given uma resposta sem cidade, fuso horário, período identificáveis ou sem estrutura utilizável, When ela é recebida, Then é tratada como falha, não como resposta parcial, e nenhum dado inválido é apresentado como atual.

## Non-Functional Requirements

- **RNF1 — Performance:** O feedback visual de uma interação local aparece em até 200 ms. Entre as solicitações bem-sucedidas com a fonte disponível, o tempo do envio da busca ou seleção da cidade até a exibição dos dados meteorológicos tem P95 de até 3 segundos. Taxas de erro e timeout são acompanhadas como indicadores separados. O timeout de cada solicitação é de 10 segundos.
- **RNF2 — Responsividade:** Em viewports de 320 px, 768 px, 1024 px e 1440 px, não há rolagem horizontal; busca, clima atual, unidade e cinco dias da previsão permanecem legíveis e operáveis.
- **RNF3 — Acessibilidade:** Atender à WCAG 2.2 nível AA nos fluxos de busca, seleção, consulta, alternância de unidade e erro. Texto comum apresenta contraste mínimo de 4,5:1; texto grande (a partir de 24 px regular ou 18,66 px em negrito) e componentes gráficos essenciais, 3:1. Todas as ações são operáveis por teclado, com foco visível, e os estados são anunciados por tecnologia assistiva.
- **RNF4 — Disponibilidade:** A disponibilidade mensal da aplicação sob controle do produto deve ser de pelo menos 99,5%, excluindo manutenção programada, medida por verificações sintéticas a cada minuto. Uma verificação é bem-sucedida quando a aplicação carrega e os controles de busca e unidade estão operáveis. Disponibilidade da Open-Meteo e sucesso das consultas meteorológicas devem ter métricas separadas.
- **RNF5 — Usabilidade:** A busca deve ter rótulo e ação de envio identificáveis; resultados devem indicar que são selecionáveis; o controle de unidade deve mostrar a opção selecionada. Após envio, seleção ou alternância, a interface deve apresentar o estado correspondente definido nos critérios de aceite.
- **RNF6 — Resiliência:** Falhas de conexão ou da fonte de dados devem ser comunicadas; quando aplicável, deve ser possível tentar novamente. A interface não pode permanecer em estado indefinido após uma falha.
- **RNF7 — Compatibilidade:** Os fluxos de aceite devem funcionar nas versões estável atual e anterior disponíveis na data de cada lançamento: Chrome, Firefox, Safari para macOS e Edge em desktop; Safari para iOS e Chrome para Android em dispositivos móveis.
- **RNF8 — Privacidade e segurança:** Todo o tráfego usa HTTPS. A aplicação não solicita GPS, não mantém histórico de busca e não armazena persistentemente termos de busca ou coordenadas. Termos de cidade são enviados à Open-Meteo para atender à solicitação; antes do lançamento, a política de privacidade deve informar essa transmissão e o tratamento feito pelo provedor.

> A aprovação das metas de performance e disponibilidade e a validação de limites, cobertura e termos da Open-Meteo são bloqueios de lançamento, não premissas já confirmadas.

## Traceability Matrix

| User Story | Requisito funcional | Acceptance Criteria | Requisitos não-funcionais relevantes |
|---|---|---|---|
| US1 — Busca de cidades | RF1 | AC1.1–AC1.7 | RNF1, RNF2, RNF3, RNF4, RNF5, RNF6, RNF7, RNF8 |
| US2 — Clima atual | RF2 | AC2.1–AC2.2 | RNF1, RNF2, RNF3, RNF4, RNF5, RNF6, RNF7, RNF8 |
| US3 — Previsão de cinco dias | RF3 | AC3.1–AC3.3 | RNF1, RNF2, RNF3, RNF4, RNF5, RNF6, RNF7, RNF8 |
| US4 — Alternância de unidade | RF4 | AC4.1–AC4.4 | RNF1, RNF2, RNF3, RNF5, RNF7 |
| US5 — Carregamento e falhas | RF5 | AC5.1–AC5.6 | RNF1, RNF2, RNF3, RNF4, RNF5, RNF6, RNF7 |
| US6 — Dados incompletos | RF6 | AC6.1–AC6.3 | RNF1, RNF2, RNF3, RNF4, RNF6, RNF7, RNF8 |

## Edge Cases

- Cidade inexistente ou geocoding sem resultados: mostrar estado vazio, não selecionar cidade nem consultar clima, e manter claramente identificada a seleção anterior sem atribuí-la ao novo termo.
- Caracteres especiais: preservar letras Unicode, acentos, hífens e apóstrofos; remover espaços externos e não interpretar o termo como conteúdo executável.
- Falha de API ou timeout: encerrar carregamento, identificar a operação, oferecer nova tentativa e ignorar respostas tardias que pertençam a uma solicitação superada. Timeout ocorre aos 10 segundos.
- Resposta parcial: apresentar os campos válidos e marcar os ausentes como indisponíveis; resposta sem cidade, fuso horário ou período identificáveis é falha, não parcial.
- Cidades homônimas: exibir nome, divisão administrativa e país; se os rótulos continuarem idênticos, incluir coordenadas para permitir seleção explícita.
- Mudança de dia ou fuso: calcular as cinco datas no fuso da cidade selecionada, não no fuso do dispositivo nem em UTC.
- Alternância de unidade durante carregamento: manter seleção e datas; qualquer temperatura que chegar deve usar a unidade atualmente selecionada.

## Assumptions

- A consulta de cidades e clima requer conexão com a internet.
- Não é necessário autenticar para buscar cidades ou consultar previsões.
- A Open-Meteo está aprovada para o uso comercial, cobertura e volume previstos pelo produto. A verificação dos nomes e da disponibilidade de cada campo na documentação oficial da API continua pendente; campos meteorológicos individuais ausentes são exibidos como indisponíveis, enquanto cidade, fuso horário e período ausentes tornam a resposta inválida.
- Celsius e Fahrenheit representam as mesmas condições meteorológicas; a alternância não deve alterar a cidade ou o período consultado.
- O idioma da interface inicial é pt-BR. Não está implícito suporte a outros idiomas.
- O uso em dispositivos móveis significa uma interface responsiva, não um aplicativo nativo.
- A preferência de unidade não é persistida e retorna a Celsius após nova carga da página.
- Termos de busca são enviados ao provedor de geocoding, mas não são mantidos pela aplicação após a resposta nem incluídos em logs ou análises que identifiquem a cidade.
- As metas de performance e disponibilidade são requisitos propostos pelo discovery; sua aprovação final permanece como bloqueio de lançamento.

## Risks

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Cidades homônimas não distinguíveis | Média | Médio | Exibir nome, divisão administrativa, país e, se necessário, coordenadas antes da seleção. |
| Indisponibilidade da Open-Meteo ou divergência entre os campos esperados e os fornecidos | Média | Alto | Confirmar nomes e disponibilidade dos campos na documentação oficial; exibir métricas ausentes como indisponíveis e monitorar falhas da fonte separadamente. |
| Resposta parcial ou atrasada apresentar informação enganosa | Média | Alto | Marcar campos indisponíveis, nunca reutilizar valores antigos e descartar respostas de solicitações superadas. |
| Metas de performance, disponibilidade ou custo incompatíveis com a fonte externa | A confirmar | Alto | Aprovar metas, validar limites e monitorar experiência da aplicação e disponibilidade da fonte em indicadores separados. |

## Out of Scope

- Autenticação, contas de usuário ou sincronização entre dispositivos.
- Aplicativo móvel nativo; o escopo contempla a experiência web responsiva.
- Persistência de dados de usuário no servidor.
- Persistência da preferência de unidade entre cargas da página.
- Idiomas adicionais além de pt-BR na versão inicial.
- Alertas meteorológicos, notificações, mapas, localização automática por GPS e dados históricos.

## Open Questions

- A política de privacidade foi aprovada para informar que os termos de cidade são enviados à Open-Meteo?
- O produto aprovou as metas de 200 ms, P95 de 3 segundos e disponibilidade mensal de 99,5%?
- A documentação oficial da Open-Meteo confirma os parâmetros e nomes dos campos de clima atual, previsão, localização e fuso horário? Campos meteorológicos individuais não fornecidos serão exibidos como indisponíveis; cidade, fuso horário e período continuam obrigatórios para uma resposta válida.