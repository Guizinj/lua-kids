/**
 * Carrossel de quatro modelos, reutilizando os cartões da loja.
 * As vendas são fictícias nesta prévia. Na integração, a classificação deve vir
 * de uma consulta confiável no banco, segundo o critério comercial aprovado.
 */
(() => {
  'use strict';
  const { produtos } = window.LuaKids.demonstracao;
  const { obterEstado } = window.LuaKids.armazenamento;
  const { montarCartaoProduto } = window.LuaKids.cartaoProduto;
  const { montarIcone } = window.LuaKids.icones;

  /** Não altera a ordem do catálogo original. Empates usam o nome do modelo. */
  function listarMaisVendidos() {
    const vendidos = obterEstado().sold;
    return [...produtos]
      .sort(
        (a, b) =>
          (vendidos[b.id] || 0) - (vendidos[a.id] || 0) ||
          a.name.localeCompare(b.name, 'pt-BR'),
      )
      .slice(0, 4);
  }

  /** O próximo cartão fica parcialmente visível para indicar que a lista desliza. */
  function montarMaisVendidos() {
    return `<section class="section mais-vendidos" aria-labelledby="titulo-mais-vendidos"><div class="section-heading"><div><h2 id="titulo-mais-vendidos">Mais vendidos</h2><p>Seleção demonstrativa · vendas ilustrativas</p></div><div class="setas-mais-vendidos"><button class="icon-button" data-action="mais-vendidos-rolar" data-step="-1" aria-label="Ver produtos anteriores" aria-controls="lista-mais-vendidos" disabled>${montarIcone('back')}</button><button class="icon-button" data-action="mais-vendidos-rolar" data-step="1" aria-label="Ver próximos produtos" aria-controls="lista-mais-vendidos">${montarIcone('arrow')}</button></div></div><div class="lista-mais-vendidos" id="lista-mais-vendidos" tabindex="0" role="group" aria-roledescription="carrossel" aria-label="Quatro produtos mais vendidos da demonstração">${listarMaisVendidos().map(montarCartaoProduto).join('')}</div></section>`;
  }

  /** As setas refletem os limites após arraste, redimensionamento ou atualização. */
  function atualizarControles() {
    const lista = document.querySelector('#lista-mais-vendidos');
    if (!lista) return;
    const limite = lista.scrollWidth - lista.clientWidth;
    document.querySelectorAll('[data-action="mais-vendidos-rolar"]').forEach((botao) => {
      botao.disabled =
        Number(botao.dataset.step) < 0 ? lista.scrollLeft <= 1 : lista.scrollLeft >= limite - 1;
    });
  }

  /** Avança um cartão por toque; nunca troca produtos automaticamente. */
  function rolarMaisVendidos(passo) {
    const lista = document.querySelector('#lista-mais-vendidos');
    if (!lista) return;
    const largura = lista.querySelector('.product-card').getBoundingClientRect().width;
    const intervalo = parseFloat(getComputedStyle(lista).columnGap) || 0;
    lista.scrollBy({
      left: (largura + intervalo) * passo,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  }

  window.LuaKids.maisVendidos = {
    montarMaisVendidos,
    listarMaisVendidos,
    rolarMaisVendidos,
    atualizarControles,
  };
})();
