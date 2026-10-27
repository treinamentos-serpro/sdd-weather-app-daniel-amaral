## Contexto

A empresa precisa de uma aplicação de previsão do tempo para que usuários consultem as condições atuais e planejem os próximos dias. A experiência deve funcionar em dispositivos móveis e permitir a alternância entre Celsius e Fahrenheit.

## Requisitos Funcionais

- **RF1** — Permitir buscar cidades por nome.
- **RF2** — Exibir o clima atual da cidade selecionada.
- **RF3** — Exibir a previsão do tempo para os próximos 5 dias.
- **RF4** — Permitir alternar entre Celsius e Fahrenheit, atualizando os valores exibidos.
- **RF5** — Informar ao usuário quando a busca ou a consulta de clima estiver carregando ou falhar.

## Requisitos Não-Funcionais

- **RNF1 — Performance:** em condições normais de rede e com a fonte de dados disponível, a interface deve responder às interações em até 200 ms e apresentar o resultado da consulta em até 3 segundos no percentil 95.
- **RNF2 — Responsividade:** a aplicação deve funcionar de 320 px a 1440 px sem rolagem horizontal, mantendo busca, clima atual e previsão utilizáveis em telas móveis.
- **RNF3 — Acessibilidade:** atender ao nível AA da WCAG 2.2, incluindo contraste adequado, foco visível, operação por teclado e anúncio acessível dos estados de carregamento e erro.
- **RNF4 — Disponibilidade:** a aplicação deve ter disponibilidade mensal mínima de 99,5%, excluindo manutenções programadas. A disponibilidade da aplicação deve ser distinguida da disponibilidade de fontes de dados externas.
- **RNF5 — Usabilidade:** busca, consulta da previsão e alternância de unidade devem ter controles compreensíveis e feedback claro para as ações do usuário.
- **RNF6 — Resiliência:** falhas de conexão ou da fonte de dados devem ser comunicadas, permitir nova tentativa quando aplicável e não deixar a interface em estado indefinido.
- **RNF7 — Compatibilidade:** oferecer suporte às versões atuais e imediatamente anteriores dos principais navegadores desktop e móveis: Chrome, Firefox, Safari e Edge.
- **RNF8 — Privacidade e segurança:** proteger o tráfego com HTTPS, evitar a coleta de dados pessoais desnecessários e informar o tratamento e o período de retenção de dados de busca ou localização, caso sejam armazenados.

> As metas numéricas de performance e disponibilidade são propostas iniciais e devem ser validadas com o produto e com os limites da fonte de dados escolhida.

## Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| A busca retornar cidades com nomes iguais ou semelhantes | Média | Médio | Exibir informações adicionais para distinguir resultados, como estado ou país |
| Indisponibilidade ou lentidão da fonte de dados | Média | Alto | Apresentar estados de carregamento e erro, com opção de tentar novamente |
| Interpretação divergente de “previsão de 5 dias” | Média | Médio | Definir se o período inclui o dia atual |
| Valores inconsistentes ao alternar entre unidades | Baixa | Alto | Atualizar todos os valores e rótulos de unidade de forma consistente |

## Perguntas em Aberto

1. A busca deve oferecer sugestões enquanto o usuário digita ou apenas após o envio?
2. Como distinguir cidades homônimas: por estado, país ou ambos?
3. A previsão de 5 dias inclui o dia atual?
4. Quais informações devem aparecer no clima atual e na previsão diária?
5. Qual deve ser a unidade padrão na primeira visita?
6. A unidade escolhida deve ser mantida entre visitas ou sessões?
7. Há requisitos de idioma, além do idioma principal da aplicação?
8. Existe uma fonte de dados definida e quais são seus limites de uso?

## Suposições

- A consulta do clima depende de uma conexão com a internet.
- A aplicação não exige autenticação para consultar cidades e previsões.
- Celsius e Fahrenheit devem representar os mesmos dados meteorológicos, com conversão ou consulta equivalente na fonte de dados.
- O uso em dispositivos móveis é um requisito de interface responsiva, não necessariamente um aplicativo nativo.

## Decisões

- **Fonte de dados: Open-Meteo, sem API key.** Simplifica a integração e evita gerenciar uma chave de API. Resolve a pergunta sobre qual fonte usar; limites de uso e cobertura ainda devem ser verificados.
- **Previsão de 5 dias: hoje mais os 4 dias seguintes.** Torna explícito o período exibido. Resolve a pergunta sobre se o dia atual está incluído.
- **Unidade padrão: Celsius.** Define a unidade apresentada na primeira visita. Resolve a pergunta sobre a unidade inicial; não define se a preferência escolhida pelo usuário será salva localmente.
- **Sem autenticação e sem persistência de servidor.** Mantém a consulta disponível sem conta e evita armazenar dados de usuário no servidor. Define o escopo de autenticação e armazenamento no servidor; a persistência local de preferências continua em aberto.
- **Idioma da interface: pt-BR.** Define o idioma inicial da experiência. Resolve a pergunta sobre o idioma da UI na versão inicial; suporte a outros idiomas não faz parte desta decisão.