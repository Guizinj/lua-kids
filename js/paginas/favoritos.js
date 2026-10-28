/**
 * Tela dos modelos guardados; reutiliza os mesmos cartões do catálogo.
 * Módulo encapsulado: só os métodos listados no final ficam disponíveis em LuaKids.
 * Os scripts tradicionais preservam a abertura direta pelo index.html, sem instalação.
 */
(() => {
  'use strict';
  const LuaKids = window.LuaKids;
  const { produtos } = LuaKids.demonstracao;
  const { obterEstado } = LuaKids.armazenamento;
  const { montarCaminho, montarEstadoVazio } = LuaKids.componentes;
  const { montarCartaoProduto } = LuaKids.cartaoProduto;

  /**
   * Monta os modelos favoritados no navegador. O estado vazio convida a explorar o catálogo;
   * guardar/remover favoritos é responsabilidade do serviço correspondente.
   */
  function montarFavoritos() {
    const favorites = produtos.filter((p) => obterEstado().favorites.includes(p.id));
    return /* HTML */ `<div class="container bottom-space"
      ><div class="page-heading"
        >${montarCaminho([['Favoritos']])}<p
          >Seus modelos favoritos ficam salvos neste navegador para você voltar quando quiser.</p
        ></div
      ><div class="product-grid"
        >${favorites.length
          ? favorites.map(montarCartaoProduto).join('')
          : montarEstadoVazio(
              'heart',
              'Qual look vai ganhar seu coração?',
              'Toque no coração dos produtos para montar sua seleção de favoritos.',
              '<a class="button" href="#/catalogo">Conhecer a seleção</a>',
            )}</div
      ></div
    >`;
  }
  LuaKids.telaFavoritos = { montarFavoritos };
})();
