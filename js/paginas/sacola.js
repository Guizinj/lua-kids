/**
 * Conteúdo do diálogo da sacola. Os cálculos ficam no serviço de sacola.
 * Módulo encapsulado: só os métodos listados no final ficam disponíveis em LuaKids.
 * Os scripts tradicionais preservam a abertura direta pelo index.html, sem instalação.
 */
(() => {
  'use strict';
  const LuaKids = window.LuaKids;
  const { selecionar, escaparHTML, formatarDinheiro, caminhoImagem } = LuaKids.utilitarios;
  const { listarItensSacola, calcularTotaisSacola } = LuaKids.sacola;
  const { montarEstadoVazio } = LuaKids.componentes;
  const { montarIcone } = LuaKids.icones;

  /**
   * Reconstrói o conteúdo do diálogo da sacola: modelos, quantidades, subtotal e progresso
   * até dez peças. O diálogo é aberto/fechado pelo controlador de eventos.
   */
  function renderizarSacola() {
    const { total, pieces, grades } = calcularTotaisSacola();
    const items = listarItensSacola();
    selecionar('#cart-dialog').innerHTML =
      `<div class="dialog-shell"><div class="dialog-heading"><div><h2 id="cart-title">Sua sacola</h2><p>${grades} ${grades === 1 ? 'grade' : 'grades'} · ${pieces} peças</p></div><button class="icon-button" data-action="cart-close" aria-label="Fechar sacola">${montarIcone('close')}</button></div><div class="cart-body">${items.length ? items.map((p) => `<article class="cart-item"><a href="#/produto/${p.id}" data-action="close-on-navigate"><img src="${caminhoImagem(p.image)}" alt="${escaparHTML(p.name)}"></a><div class="cart-item-info"><h3>${escaparHTML(p.name)}</h3><p>Grade ${p.sizes.length} peças · Cores sortidas</p><div class="cart-item-row"><div class="quantity"><button data-action="cart-quantity" data-id="${p.id}" data-step="-1" aria-label="Diminuir grades de ${escaparHTML(p.name)}">−</button><output>${p.quantity}</output><button data-action="cart-quantity" data-id="${p.id}" data-step="1" aria-label="Aumentar grades de ${escaparHTML(p.name)}">+</button></div><strong>${formatarDinheiro(p.price * p.quantity)}</strong></div><button class="remove-item" data-action="cart-remove" data-id="${p.id}">Remover modelo</button></div></article>`).join('') : `<div style="padding-top:28px">${montarEstadoVazio('bag', 'Sua seleção começa aqui.', 'Explore o catálogo e adicione suas primeiras grades.', '<button class="button secondary" data-action="browse">Conhecer o catálogo</button>')}</div>`}</div>${items.length ? `<div class="cart-bottom"><div class="cart-progress"><p>${pieces >= 10 ? 'Pedido mínimo atingido. Sua seleção está pronta!' : `Faltam ${10 - pieces} peças para atingir o mínimo de 10.`}</p><div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, pieces * 10)}%"></div></div></div><div class="summary-row total"><span>Subtotal dos produtos</span><strong>${formatarDinheiro(total)}</strong></div><button class="button full" data-action="checkout" ${pieces < 10 ? 'disabled' : ''}>Continuar pedido ${montarIcone('arrow')}</button><p class="small-print">Caruaru/PE: entrega grátis. Outras cidades: frete a combinar, por conta do cliente. A disponibilidade é confirmada pela loja.</p></div>` : ''}</div>`;
  }
  LuaKids.telaSacola = { renderizarSacola };
})();
