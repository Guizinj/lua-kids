/**
 * Conteúdo de orientação e dúvidas frequentes da primeira versão.
 * Módulo encapsulado: só os métodos listados no final ficam disponíveis em LuaKids.
 * Os scripts tradicionais preservam a abertura direta pelo index.html, sem instalação.
 */
(() => {
  'use strict';
  const LuaKids = window.LuaKids;
  const { escaparHTML } = LuaKids.utilitarios;
  const { montarCaminho } = LuaKids.componentes;
  const { montarIcone } = LuaKids.icones;

  /**
   * Monta o roteiro e as dúvidas de compra com as regras já combinadas. Pagamento,
   * disponibilidade e transporte continuam sendo tratados no atendimento.
   */
  function montarComoComprar() {
    return /* HTML */ `<div class="container"
      ><div class="page-heading"
        >${montarCaminho([['Como comprar']])}<p class="eyebrow">Uma compra simples, do seu jeito</p
        ><h1>Da nossa seleção para a sua loja.</h1
        ><p
          >Escolha os modelos, monte suas grades e converse com a Lua Kids para confirmar o
          pedido.</p
        ></div
      ><div class="step-grid"
        ><article class="step-card"
          ><div class="step-number">01.</div><h2>Escolha suas grades.</h2
          ><p
            >Cada modelo tem uma composição fechada, com uma unidade de cada tamanho. Os valores do
            catálogo são por grade e as cores são sortidas.</p
          ></article
        ><article class="step-card"
          ><div class="step-number">02.</div><h2>Complete 10 peças.</h2
          ><p
            >Combine grades de modelos diferentes até atingir o mínimo de 10 peças. A sacola mostra
            a quantidade total e o subtotal dos produtos.</p
          ></article
        ><article class="step-card"
          ><div class="step-number">03.</div><h2>Converse com a loja.</h2
          ><p
            >Informe o endereço e registre o pedido. Disponibilidade, pagamento e transporte são
            confirmados pelo WhatsApp. Acompanhe as atualizações na área de pedidos.</p
          ></article
        ></div
      ><section class="faq"
        ><h2>Alguns detalhes antes de escolher.</h2>${[
          [
            'Posso escolher as cores ou mudar os tamanhos?',
            'As cores são sortidas e a composição da grade é fechada. Consulte os tamanhos indicados em cada modelo antes de adicionar à sacola.',
          ],
          [
            'O preço é por peça ou por grade?',
            'O preço principal é pela grade completa. Na página do produto, o equivalente por unidade é apenas uma referência; a compra é feita em grades.',
          ],
          [
            'Como funciona a entrega?',
            'Em Caruaru/PE, a entrega é gratuita para o cliente. Para outras cidades, o transporte é por conta do cliente e combinado no atendimento, por loteiro ou transportadora. Não há retirada na loja nesta versão.',
          ],
          [
            'O pedido já garante a reserva das peças?',
            'O pedido é registrado aguardando confirmação. A reserva acontece quando o dono confirma no painel, após verificar disponibilidade e combinar o pagamento.',
          ],
          [
            'Onde aparece o comprovante do envio?',
            'A loja atualiza o andamento e pode anexar a foto do despacho ao pedido. O cliente consulta essa imagem nos detalhes da compra e recebe o aviso pelo atendimento.',
          ],
          [
            'Posso pagar por aqui?',
            'Nesta primeira versão, o pagamento é tratado pelo WhatsApp. Esta prévia usa produtos e pedidos fictícios e não processa compras ou cobranças reais.',
          ],
          [
            'Como ficam trocas e cancelamentos?',
            'As condições reais serão fornecidas e aprovadas pela loja antes do lançamento. Na prévia, o painel permite cancelar pedidos antes do envio e libera o estoque que estava reservado.',
          ],
        ]
          .map(
            ([question, answer]) =>
              `<details><summary>${escaparHTML(question)}</summary><p>${escaparHTML(answer)}</p></details>`,
          )
          .join('')}<a class="button" href="#/catalogo" style="margin-top:28px"
          >Encontrar meus próximos favoritos ${montarIcone('arrow')}</a
        ></section
      ></div
    >`;
  }
  LuaKids.comoComprar = { montarComoComprar };
})();
