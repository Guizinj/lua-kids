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
   * A linha principal concentra grade, tamanhos e controles da compra. Tecido,
   * cores e aviso ficam no details nativo, acessível por teclado e fechado inicialmente.
   */
  function montarItemSacola(produto, detalhesAbertos) {
    const id = escaparHTML(produto.id);
    const nome = escaparHTML(produto.name);
    return /* HTML */ `<article class="cart-item">
      <div class="cart-item-miniatura">
        <a href="#/produto/${id}" data-action="close-on-navigate">
          <img src="${caminhoImagem(produto.image)}" alt="${nome}" width="58" height="76" />
        </a>
        <button
          class="remove-item"
          data-action="cart-remove"
          data-id="${id}"
          aria-label="Remover ${nome} da sacola"
          >Remover</button
        >
      </div>
      <div class="cart-item-info">
        <h3>${nome}</h3>
        <p class="cart-item-meta"
          >Grade ${produto.sizes.length} peças<span class="cart-item-tamanhos"
            >Tamanhos: ${produto.sizes.map(escaparHTML).join(' / ')}</span
          ></p
        >
        <div class="cart-item-row">
          <div class="quantity">
            <button
              data-action="cart-quantity"
              data-id="${id}"
              data-step="-1"
              aria-label="Diminuir grades de ${nome}"
              >−</button
            >
            <output>${produto.quantity}</output>
            <button
              data-action="cart-quantity"
              data-id="${id}"
              data-step="1"
              aria-label="Aumentar grades de ${nome}"
              >+</button
            >
          </div>
          <strong>${formatarDinheiro(produto.price * produto.quantity)}</strong>
        </div>
        <details
          class="detalhes-item-sacola"
          data-produto="${id}"
          ${detalhesAbertos ? 'open' : ''}
        >
          <summary>Detalhes da grade</summary>
          ${LuaKids.cores.montarCaracteristicas(produto, true, { mostrarTamanhos: false })}
        </details>
      </div>
    </article>`;
  }

  /**
   * Reconstrói o conteúdo do diálogo da sacola: modelos, quantidades, subtotal e progresso
   * até dez peças. O diálogo é aberto/fechado pelo controlador de eventos.
   */
  function renderizarSacola() {
    const dialogo = selecionar('#cart-dialog');
    const posicaoLista = dialogo.querySelector('.cart-body')?.scrollTop || 0;
    const detalhesAbertos = new Set(
      [...dialogo.querySelectorAll('.detalhes-item-sacola[open]')].map(
        (item) => item.dataset.produto,
      ),
    );
    const { total, pieces, grades } = calcularTotaisSacola();
    const items = listarItensSacola();
    dialogo.innerHTML = `<div class="dialog-shell"><div class="dialog-heading"><div><h2 id="cart-title">Sua sacola</h2><p>${grades} ${grades === 1 ? 'grade' : 'grades'} · ${pieces} peças</p></div><button class="icon-button" data-action="cart-close" aria-label="Fechar sacola">${montarIcone('close')}</button></div><div class="cart-body">${items.length ? items.map((p) => montarItemSacola(p, detalhesAbertos.has(p.id))).join('') : `<div style="padding-top:28px">${montarEstadoVazio('bag', 'Sua seleção começa aqui.', 'Explore o catálogo e adicione suas primeiras grades.', '<button class="button secondary" data-action="browse">Conhecer o catálogo</button>')}</div>`}</div>${items.length ? `<div class="cart-bottom"><div class="cart-progress"><p>${pieces >= 10 ? 'Pedido mínimo atingido. Sua seleção está pronta!' : `Faltam ${10 - pieces} peças para atingir o mínimo de 10.`}</p><div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, pieces * 10)}%"></div></div></div><div class="summary-row total"><span>Subtotal dos produtos</span><strong>${formatarDinheiro(total)}</strong></div><button class="button full" data-action="checkout" ${pieces < 10 ? 'disabled' : ''}>Continuar pedido ${montarIcone('arrow')}</button><p class="small-print">Caruaru/PE: entrega grátis. Outras cidades: frete a combinar, por conta do cliente. A disponibilidade é confirmada pela loja.</p></div>` : ''}</div>`;
    // Ajustar a quantidade não fecha os detalhes escolhidos nem volta a lista ao topo.
    dialogo.querySelector('.cart-body').scrollTop = posicaoLista;
  }
  LuaKids.telaSacola = { renderizarSacola };
})();
