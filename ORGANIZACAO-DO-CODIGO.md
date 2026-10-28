# Lua Kids · como ler e continuar o código

A organização foi feita em 28/10/2026 para facilitar a leitura e preparar a evolução para o Supabase, preservando o visual e os fluxos do protótipo. Os arquivos antigos concentrados foram substituídos por módulos pequenos, com funções nomeadas e comentários em português.

## Primeiro: o caminho de uma ação

Quando alguém adiciona um produto, acontece esta sequência:

1. O cartão é montado por `js/componentes/cartao-produto.js`. O botão declara `data-action="add"` e o identificador do modelo.
2. `js/eventos.js` identifica o clique e chama o serviço responsável.
3. `js/servicos/sacola.js` consulta o modelo, confere a disponibilidade e calcula a nova quantidade de grades.
4. `js/servicos/armazenamento.js` altera uma cópia do estado e tenta salvá-la. Se houver falha, a alteração incompleta é descartada.
5. O controlador atualiza o contador do cabeçalho e mostra a mensagem de resultado.

Isso separa a pergunta **“como mostrar?”** da operação **“o que deve mudar nos dados?”**. Os serviços atuais simulam regras no navegador; depois, as regras confiáveis de pedidos, preços e estoque também precisarão ser aplicadas no banco/API.

## Ordem recomendada de leitura

| Arquivo ou pasta | O que você encontra |
| --- | --- |
| `index.html` | Estrutura fixa, espaços para telas/diálogos e ordem de carregamento dos arquivos. Continua sendo a entrada padrão da web. |
| `js/aplicacao.js` | Escolha da página por rota, título, navegação ativa e inicialização. Não concentra mais os cálculos ou o armazenamento. |
| `js/navegacao.js` | Leitura de `#/pagina?filtro=valor` e pedido de atualização da tela. O renderizador é registrado na inicialização, evitando dependência circular com as páginas. |
| `js/eventos.js` | Cliques, buscas, formulários, seletores e upload. Os ouvintes são registrados uma vez e atendem elementos criados depois. |
| `js/paginas/` | Funções que montam o HTML do início, catálogo, produto, sacola, fechamento, favoritos, pedidos, painel e orientações. |
| `js/servicos/` | Operações locais de armazenamento, sacola, favoritos, entrega, pedidos e anexos. É o ponto de evolução da persistência real. |
| `js/componentes/` | Fragmentos compartilhados: ícones, marca, cabeçalho, rodapé, cartão, campos, resumo, avisos e mensagem de WhatsApp. |
| `js/dados/demonstracao.js` | Produtos e clientes fictícios e a função que restaura os exemplos iniciais. |
| `js/configuracao.js` | Configurações públicas; nunca deve receber chaves privilegiadas. |
| `js/utilitarios.js` | Seletores do DOM, escape de texto, formatação e caminhos de imagens. |

As pastas e os arquivos usam português sem acentos nos caminhos, facilitando referências e comandos. `index.html`, `js`, extensões e nomes de APIs do navegador seguem as convenções da plataforma.

## Como os módulos se comunicam

Para continuar abrindo a loja diretamente pelo arquivo, usamos scripts tradicionais com `defer`, carregados na ordem do `index.html`. Esta entrega não usa `import`/`export`, framework ou empacotador.

Cada arquivo envolve seu código em uma função executada uma vez. As variáveis internas ficam nesse escopo; os métodos necessários para outros módulos são publicados em um único objeto, `window.LuaKids`.

Exemplo do serviço de sacola:

```javascript
const { calcularTotaisSacola } = window.LuaKids.sacola;
const totais = calcularTotaisSacola();
// totais.total: subtotal em centavos
// totais.pieces: unidades comerciais nas grades
// totais.grades: número de grades
```

Esse encapsulamento organiza dependências. **Não é uma barreira de segurança:** o código do navegador continua público e modificável localmente. As permissões reais continuarão sendo responsabilidade do banco/API, conforme [SEGURANCA.md](SEGURANCA.md).

## Estado e compatibilidade

- A chave continua `lua-kids:prototype:v1`. Os registros existentes não são apagados ou renomeados.
- Os métodos públicos usam português, mas as propriedades já gravadas foram preservadas. Exemplos: `price` é preço em centavos, `sizes` é composição, `quantity` é quantidade de grades, `stock` é estoque, `customer` é cliente e `attachment` é comprovante.
- Use `obterEstado()` para consultar o estado atual e `alterarEstado(funcao)` para alterações. Não guarde uma cópia antiga do estado numa variável global: cada gravação bem-sucedida substitui o objeto atual.
- Pedidos guardam cópias de preço, composição e endereço. O histórico não deve mudar quando o catálogo ou o perfil forem atualizados.
- As imagens foram movidas para `recursos/imagens/`. O utilitário traduz os identificadores antigos (`dress`, `set` etc.) para os arquivos em português, mantendo os pedidos salvos compatíveis.
- O armazenamento local simula gravação por cópia, mas não implementa transações concorrentes, autenticação ou sincronização entre dispositivos.

## Estilos e recursos

O CSS deixou de ser compacto e foi separado, preservando sua ordem de aplicação:

1. `estilos/base.css`: cores, tipografia, dimensões gerais, ícones e acessibilidade.
2. `estilos/estrutura.css`: faixa de atacado, cabeçalho, busca, navegação e aviso de demonstração.
3. `estilos/vitrine.css`: banner, botões, cartões, categorias e benefícios.
4. `estilos/rodape.css`: atendimento e navegação inferior.
5. `estilos/paginas.css`: catálogo e demais telas internas, diálogos e painel.
6. `estilos/responsivo.css`: adaptações por largura e redução de movimento.

Os seletores existentes foram mantidos para preservar a apresentação. Para detalhes de imagens e seus prompts, consulte [IMAGENS-ILUSTRATIVAS.md](IMAGENS-ILUSTRATIVAS.md). O servidor opcional agora é executado por `node servidor.mjs`.

## Verificação da refatoração

Verificado em 28/10/2026, com dados fictícios:

- `node testes/verificar-modulos.cjs`: sintaxe, recursos do index, leitura de um estado da versão anterior, totais, entrega, reserva/cancelamento e descarte de alterações com erro.
- `node testes/verificar-navegacao.cjs`: percurso pelo catálogo, filtros, favoritos, sacola, mínimo, fechamento, rascunho, painel, status, upload/rejeição de arquivos, consulta pelo cliente, WhatsApp manual e estados vazios.
- Chrome headless no Windows; páginas representativas em 1440, 768, 390 e 320 pixels, sem transbordamento horizontal. Também conferidos arquivo direto, HTTP local e armazenamento bloqueado, sem erros de execução ou recursos ausentes.
- O teste de navegador mantém capturas na pasta temporária indicada ao terminar. Ele usa um perfil separado e não compartilha os dados do navegador pessoal.

Essas evidências são de regressão funcional. Os controles de produção do guia de segurança permanecem pendentes; o login continua sem decisão final.
