# Lua Kids · primeira versão navegável

Protótipo local em HTML, CSS e JavaScript puro, com identidade visual baseada na logo enviada. Não precisa instalar pacotes.

## Abrir

Abra `index.html` com dois cliques no navegador. A navegação usa rotas após `#`, por isso todas as telas funcionam no mesmo documento, inclusive sem servidor.

Se preferir um endereço local, na pasta do projeto execute:

```powershell
node servidor.mjs
```

Abra **http://127.0.0.1:5173**. Encerre o servidor com `Ctrl+C`. Abrir por arquivo e por HTTP utiliza armazenamentos separados; mantenha a mesma forma de acesso durante sua avaliação.

## O que experimentar

1. Explore o catálogo, combine filtros, abra um produto e adicione uma grade à sacola.
2. Observe que uma grade de quatro peças ainda não permite continuar. Complete pelo menos dez peças com grades inteiras.
3. Feche um pedido com dados fictícios. Caruaru/PE mostra entrega gratuita; outros destinos mostram frete a combinar, sem somá-lo como zero ao subtotal.
4. Abra **Painel demo** e o pedido criado. Confirme para reservar as grades; acompanhe as mudanças de status.
5. Anexe uma imagem JPG, PNG ou WebP de até 1 MB, simulando o comprovante do despacho.
6. Volte a **Meus pedidos**, selecione o perfil correspondente e consulte o mesmo anexo e o histórico atualizado.
7. Experimente cancelar um pedido confirmado, antes do envio: sua reserva é devolvida ao estoque demonstrativo.
8. Favorite um produto e recarregue a página para conferir a persistência.
9. O botão de WhatsApp primeiro mostra uma prévia da mensagem. A abertura do WhatsApp é manual e o texto identifica explicitamente a demonstração.

Use **Reiniciar demonstração**, no rodapé, para recuperar o catálogo e os pedidos de exemplo. O checklist da reunião tem outra chave de armazenamento e é preservado.

### Revisão para celular

- O botão de menu abre categorias, favoritos, endereço e atendimento. O acesso ao **Painel de acompanhamento · demo** está no rodapé.
- No catálogo, use **Filtrar e ordenar**, escolha os filtros e toque em **Aplicar filtros**. A busca enviada leva até os resultados.
- Cores são referências do modelo; o envio continua sortido e sujeito a substituição. Não há escolha individual.
- Em **Meus pedidos**, alterne entre Ana e Beatriz para conferir os favoritos separados. Em **Meu endereço**, salve um endereço fictício e confira o preenchimento do próximo pedido.
- No painel, **Cancelar pedido** abre a confirmação dentro da página. **Voltar** mantém o pedido; **Cancelar pedido** confirma a operação e devolve a reserva existente uma única vez.
- Os exemplos do carrossel não são depoimentos reais. O botão flutuante de WhatsApp abre apenas o atendimento manual.

A primeira versão está preservada na tag Git `primeira-versao-aprovada`. Veja [como recuperar a cópia](RESTAURACAO.md).

### Prévia no GitHub Pages

Editar esta pasta não atualiza automaticamente a página pública. Para testar pelo GitHub Pages, é necessário que os arquivos alterados e os novos arquivos entrem no commit, sejam enviados à branch configurada e a publicação termine. Confira especialmente `estilos/ajustes-previa.css`, os novos módulos e `recursos/fontes/`.

O HTML usa um identificador de revisão nas URLs de CSS/JavaScript para evitar que a nova publicação reutilize cópias antigas desses arquivos no navegador. Isso não substitui o envio/publicação dos arquivos.

## Limites desta entrega

- Produtos, preços, tamanhos, estoque, nomes de clientes, telefones de clientes e números vendidos são exemplos.
- As imagens dos produtos e do banner foram geradas para ilustrar o protótipo. A logo é a imagem original fornecida pelo usuário.
- Não há autenticação nem autorização de produção. A troca de perfis e o painel aberto são somente ferramentas de avaliação.
- Pedidos, favoritos, rascunho do formulário e anexos ficam em `localStorage`, neste navegador e origem. Não existe sincronização entre dispositivos.
- Se o navegador bloquear o armazenamento, a prévia funciona em memória e avisa que os dados serão perdidos ao fechar.
- O link de acompanhamento da mensagem é demonstrativo/local; um cliente em outro dispositivo não receberá os mesmos dados.
- Não há Supabase conectado, pagamento online, envio automático de WhatsApp ou cálculo de frete nacional.
- O painel não cadastra produtos nem oferece edição manual de estoque. O catálogo demonstrativo está em `js/dados/demonstracao.js`.
- A reserva de estoque local serve para validar o fluxo; controle concorrente e transações reais dependerão do Supabase.

## Como o código está organizado

```text
index.html                   Entrada da loja e ordem de carregamento
js/
  aplicacao.js               Inicialização e montagem da página escolhida
  configuracao.js            Chave local, atendimento e rótulos de status
  navegacao.js               Leitura e mudança das rotas
  eventos.js                 Cliques, formulários e alterações dos campos
  utilitarios.js             DOM, textos, dinheiro, datas e caminhos
  dados/                    Catálogo e pedidos fictícios
  servicos/                 Armazenamento, sacola, entrega, pedidos e anexos
  componentes/              Marca, cabeçalho, cartões, avisos e mensagens
  paginas/                  Início, catálogo, produto, fechamento e históricos
estilos/                    CSS legível, separado por área e responsividade
recursos/imagens/            Logo original e imagens ilustrativas
testes/                     Regressões locais e verificação no navegador
servidor.mjs                 Servidor HTTP opcional
```

Para entender por onde começar a leitura, veja [organização do código](ORGANIZACAO-DO-CODIGO.md). As funções e os trechos importantes estão comentados em português. A chave e o formato dos dados locais foram preservados para manter os pedidos, a sacola e os favoritos existentes.

Documentos de referência: [contexto e decisões](CONTEXTO-PROJETO.md), [guia de segurança](SEGURANCA.md) e [imagens ilustrativas](IMAGENS-ILUSTRATIVAS.md). O `checklist-reuniao.html` continua separado da loja.

## Repetir as verificações

Com Node.js 24 ou mais recente, execute:

```powershell
node testes/verificar-modulos.cjs
node testes/verificar-navegacao.cjs
```

O primeiro verifica módulos, referências, compatibilidade dos dados e operações locais sem abrir navegador. O segundo usa Chrome ou Edge instalado, com perfil temporário e janela oculta, para percorrer a interface. Não precisa instalar pacotes. Se o navegador estiver em outro local, informe o caminho em `NAVEGADOR_EXECUTAVEL` antes de rodar o segundo teste. Ele usa as portas locais 5188 e 9243; deixe-as livres e aguarde o encerramento antes de repetir.

## Verificação realizada

Conferido em Chrome headless no Windows, com navegação real da interface: filtros e ordenação, mínimo de peças, cálculo do subtotal, regras de entrega, recuperação da sacola e do rascunho, criação de pedido, confirmação/reserva, bloqueio de estoque insuficiente, cancelamento com devolução, upload e rejeição de anexos inválidos, consulta pelo cliente e prévia do WhatsApp.

Foram verificadas páginas representativas em larguras de 320, 390, 768 e 1440 pixels, sem transbordamento horizontal da página. São simulações de tela; não substituem a avaliação em aparelhos físicos. A abertura direta do arquivo, o servidor HTTP e a navegação com armazenamento bloqueado também foram conferidos, sem erros de JavaScript ou recursos ausentes.

Não coloque dados reais de clientes nesta prévia. Antes de publicar a loja para vendas, conclua autenticação, permissões, armazenamento privado dos comprovantes, catálogo real e demais pendências registradas no contexto.

Tempo real entre aparelhos será implementado com Supabase. A prévia sincroniza apenas abas da mesma origem/navegador; as verificações locais não aprovam permissões de produção. Revise especialmente o cancelamento no Chrome e Safari do seu celular após esta atualização.

Na revisão de 28/10/2026, os testes foram ampliados para migração por cliente, preservação de cores/tecido nos pedidos, eventos de toque do Chromium e sincronização de todos os status e comprovante entre duas abas. Esses testes usam perfis isolados e dados fictícios; não acessam seu navegador pessoal.
