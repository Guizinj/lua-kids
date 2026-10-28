/**
 * Página inicial: apresenta a marca e a seleção de modelos de demonstração.
 * Módulo encapsulado: só os métodos listados no final ficam disponíveis em LuaKids.
 * Os scripts tradicionais preservam a abertura direta pelo index.html, sem instalação.
 */
(() => {
  'use strict';
  const LuaKids = window.LuaKids;
  const { escaparHTML } = LuaKids.utilitarios;
  const { produtos } = LuaKids.demonstracao;
  const { montarIcone } = LuaKids.icones;
  const { montarCartaoProduto } = LuaKids.cartaoProduto;

  /**
   * Monta a vitrine inicial com regras resumidas e cartões de produtos. Esta função
   * retorna HTML; os eventos são registrados separadamente.
   */
  function montarInicio() {
    return /* HTML */ `<div class="container"
      ><div class="perks"
        ><div class="perk"
          >${montarIcone('box')}<div
            ><strong>Atacado em grades</strong><span>Uma unidade de cada tamanho</span></div
          ></div
        ><div class="perk"
          >${montarIcone('bag')}<div
            ><strong>A partir de 10 peças</strong
            ><span>Monte seu pedido com grades completas</span></div
          ></div
        ><div class="perk"
          >${montarIcone('truck')}<div
            ><strong>Caruaru com frete grátis</strong
            ><span>Demais cidades: transporte a combinar</span></div
          ></div
        ><div class="perk"
          >${montarIcone('chat')}<div
            ><strong>Atendimento pelo WhatsApp</strong
            ><span>Converse com a loja para concluir</span></div
          ></div
        ></div
      >
      ${LuaKids.maisVendidos.montarMaisVendidos()}
      <section class="section" aria-labelledby="selection-title"
        ><div class="section-heading"
          ><div
            ><p class="eyebrow">Nossa seleção</p
            ><h2 id="selection-title">Lua Kids Atacado.</h2
            ><p>Conheça as grades e encontre os próximos favoritos da sua loja.</p></div
          ><a class="text-link" href="#/catalogo">Ver tudo</a></div
        ><div class="category-tabs" aria-label="Categorias"
          >${['Todos', 'Vestidos', 'Conjuntos', 'Bebê']
            .map(
              (category, i) =>
                `<a class="chip ${i === 0 ? 'active' : ''}" href="#/catalogo${i ? '?categoria=' + encodeURIComponent(category) : ''}">${escaparHTML(category)}</a>`,
            )
            .join('')}</div
        ><div class="product-grid">${produtos.map(montarCartaoProduto).join('')}</div></section
      >
      <section class="split-banner"
        ><div
          ><p class="eyebrow">Sua loja, cheia de possibilidades</p
          ><h2>Escolha as grades.<br />O encanto vem junto.</h2
          ><p
            >Uma peça de cada tamanho, cores sortidas e um atendimento próximo para acompanhar a
            sua compra.</p
          ><a class="text-link" href="#/como-comprar"
            >Entenda como comprar ${montarIcone('arrow')}</a
          ></div
        ><div class="banner-facts"
          ><div><strong>10</strong><span>peças no pedido mínimo</span></div
          ><div><strong>100%</strong><span>grades completas</span></div></div
        ></section
      >${LuaKids.depoimentos.montarDepoimentos()}</div
    >`;
  }
  LuaKids.inicio = { montarInicio };
})();
