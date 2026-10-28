/**
 * Detalhe do produto. A quantidade selecionada representa grades completas.
 * Módulo encapsulado: só os métodos listados no final ficam disponíveis em LuaKids.
 * Os scripts tradicionais preservam a abertura direta pelo index.html, sem instalação.
 */
(() => {
  'use strict';
  const LuaKids = window.LuaKids;
  const { encontrarProduto, escaparHTML, formatarDinheiro, caminhoImagem } = LuaKids.utilitarios;
  const { produtos } = LuaKids.demonstracao;
  const { obterEstado } = LuaKids.armazenamento;
  const { montarCaminho, montarPaginaNaoEncontrada } = LuaKids.componentes;
  const { montarIcone } = LuaKids.icones;
  const { montarCartaoProduto } = LuaKids.cartaoProduto;

  /**
   * Busca o modelo solicitado e monta foto, composição, preço por grade e controles de
   * quantidade. A alteração da sacola acontece no serviço de sacola, não nesta montagem.
   */
  function montarPaginaProduto(id) {
    const p = encontrarProduto(id);
    if (!p) return montarPaginaNaoEncontrada();
    const stock = obterEstado().stock[id] || 0;
    const favorite = obterEstado().favorites.includes(id);
    return /* HTML */ `<div class="container"
      ><div class="page-heading">${montarCaminho([['Catálogo', '#/catalogo'], [p.name]])}</div
      ><section class="product-detail"
        ><div
          ><div class="detail-photo"
            ><img
              src="${caminhoImagem(p.image)}"
              alt="${escaparHTML(p.name)} — foto ilustrativa"
              width="800"
              height="1000"
            /><button
              class="icon-button favorite-button ${favorite ? 'selected' : ''}"
              data-action="favorite"
              data-id="${id}"
              aria-label="${favorite ? 'Remover dos' : 'Adicionar aos'} favoritos"
              aria-pressed="${favorite}"
              >${montarIcone('heart')}</button
            ></div
          ><p class="small-print"
            >Imagem gerada para demonstração. O catálogo real e as fotos serão fornecidos pela
            loja.</p
          ></div
        ><div class="detail-copy"
          ><p class="eyebrow"
            >${escaparHTML(p.category)} ·
            ${escaparHTML(p.fabric)}${p.premium ? ' · Premium' : ''}</p
          ><h1>${escaparHTML(p.name)}</h1><p class="description">${escaparHTML(p.description)}</p
          ><div class="product-price"
            ><strong>${formatarDinheiro(p.price)} <small>/ grade completa</small></strong></div
          ><p class="per-piece"
            >Equivalente a ${formatarDinheiro(Math.round(p.price / p.sizes.length))} por unidade do
            modelo.</p
          ><div class="grade-box"
            ><h3>O que vem na sua grade · ${p.sizes.length} peças</h3
            ><div class="sizes"
              >${p.sizes
                .map(
                  (size) =>
                    `<div class="size-box">${escaparHTML(size)}<small>1 unidade</small></div>`,
                )
                .join('')}</div
            ><p
              >A grade é fechada: uma unidade de cada tamanho, sem alteração da composição.</p
            ></div
          ><div class="notice rose"
            ><strong>Um detalhe importante:</strong> as cores são sortidas e não podem ser
            escolhidas. A foto é ilustrativa.</div
          ><div class="purchase-row"
            ><div class="quantity"
              ><button
                data-action="detail-quantity"
                data-step="-1"
                aria-label="Diminuir quantidade de grades"
                >−</button
              ><output id="detail-quantity" aria-live="polite">1</output
              ><button
                data-action="detail-quantity"
                data-step="1"
                aria-label="Aumentar quantidade de grades"
                >+</button
              ></div
            ><button
              class="button"
              data-action="add-detail"
              data-id="${id}"
              ${stock < 1 ? 'disabled' : ''}
              >${montarIcone('bag')} ${stock ? 'Adicionar à sacola' : 'Indisponível'}</button
            ></div
          ><p class="detail-info"
            >${montarIcone('box')} ${stock} grades disponíveis no estoque demonstrativo.</p
          ><p class="detail-info"
            >${montarIcone('shield')} Pedido mínimo: 10 peças, combinando grades completas.</p
          ><hr class="form-divider" /><h3>Detalhes que fazem a diferença</h3
          ><ul class="details-list"
            >${p.details.map((detail) => `<li>${escaparHTML(detail)}</li>`).join('')}</ul
          ><a class="text-link" href="#/como-comprar"
            >Saiba como funciona a compra ${montarIcone('arrow')}</a
          ></div
        ></section
      ><section class="section" style="border-top:1px solid var(--line)"
        ><div class="section-heading"
          ><div
            ><h2>Para completar a sua seleção.</h2><p>Mais delicadeza para a sua loja.</p></div
          ></div
        ><div class="product-grid"
          >${produtos
            .filter((other) => other.id !== id)
            .slice(0, 3)
            .map(montarCartaoProduto)
            .join('')}</div
        ></section
      ></div
    >`;
  }
  LuaKids.produto = { montarPaginaProduto };
})();
