/**
 * Cartão reutilizado na vitrine, no catálogo e nos favoritos.
 * Módulo encapsulado: só os métodos listados no final ficam disponíveis em LuaKids.
 * Os scripts tradicionais preservam a abertura direta pelo index.html, sem instalação.
 */
(() => {
  'use strict';
  const LuaKids = window.LuaKids;
  const { escaparHTML, formatarDinheiro, caminhoImagem } = LuaKids.utilitarios;
  const { obterEstado } = LuaKids.armazenamento;
  const { montarIcone } = LuaKids.icones;

  /**
   * Recebe um produto do catálogo e monta seu cartão. Consulta favoritos e estoque atuais;
   * preço é por grade e a quantidade vendida é explicitamente ilustrativa.
   */
  function montarCartaoProduto(p) {
    const favorite = obterEstado().favorites.includes(p.id);
    const stock = obterEstado().stock[p.id] || 0;
    return /* HTML */ `<article class="product-card"
      ><div class="product-photo"
        ><a href="#/produto/${p.id}"
          ><img
            src="${caminhoImagem(p.image)}"
            alt="${escaparHTML(p.name)} — imagem ilustrativa"
            loading="lazy"
            width="600"
            height="750" /></a
        >${p.tag ? `<span class="product-tag">${escaparHTML(p.tag)}</span>` : ''}<button
          class="icon-button favorite-button ${favorite ? 'selected' : ''}"
          data-action="favorite"
          data-id="${p.id}"
          aria-label="${favorite ? 'Remover' : 'Adicionar'} ${escaparHTML(p.name)} ${favorite
            ? 'dos'
            : 'aos'} favoritos"
          aria-pressed="${favorite}"
          >${montarIcone('heart')}</button
        ></div
      ><p class="product-category"
        >${escaparHTML(p.category)}${p.premium
          ? '<span class="premium-dot"></span> Premium'
          : ''}</p
      ><h3 class="product-title"><a href="#/produto/${p.id}">${escaparHTML(p.name)}</a></h3
      ><p class="product-meta"
        >Grade ${p.sizes.length} peças · ${escaparHTML(p.sizes.join(' / '))}</p
      >${LuaKids.cores.montarCores(p.colors, true)}<p class="aviso-cores"
        >Cores sortidas; podem variar conforme disponibilidade.</p
      ><div class="product-price"
        ><strong>${formatarDinheiro(p.price)} <small>/ grade</small></strong
        ><button
          class="add-button"
          data-action="add"
          data-id="${p.id}"
          aria-label="Adicionar uma grade de ${escaparHTML(p.name)} à sacola"
          ${stock < 1 ? 'disabled' : ''}
          >${montarIcone('plus')}</button
        ></div
      ><p class="product-sold"
        >${montarIcone('bag')}
        ${stock < 1
          ? 'Indisponível no momento'
          : `${obterEstado().sold[p.id] || 0} grades vendidas · exemplo`}</p
      ></article
    >`;
  }
  LuaKids.cartaoProduto = { montarCartaoProduto };
})();
