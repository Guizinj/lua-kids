/** Estrutura de relatos ilustrativos. Substituir por depoimentos reais autorizados. */
(() => {
  function montarDepoimentos() {
    const exemplos = [
      'Aqui ficará o relato de uma cliente sobre os produtos recebidos.',
      'Aqui ficará o relato de uma cliente sobre o atendimento da Lua Kids.',
      'Aqui ficará o relato de uma cliente sobre sua experiência de compra.',
    ];
    return `<section class="section depoimentos" aria-labelledby="titulo-depoimentos"><div class="section-heading"><div><p class="eyebrow">Experiências de compra</p><h2 id="titulo-depoimentos">O que nossas clientes dizem</h2><p class="small-print">Espaço demonstrativo: os relatos reais serão incluídos com autorização das clientes.</p></div><div class="setas-depoimentos"><button class="icon-button" data-action="depoimentos-rolar" data-step="-1" aria-label="Depoimento anterior">${window.LuaKids.icones.montarIcone('back')}</button><button class="icon-button" data-action="depoimentos-rolar" data-step="1" aria-label="Próximo depoimento">${window.LuaKids.icones.montarIcone('arrow')}</button></div></div><div class="lista-depoimentos" tabindex="0" aria-label="Depoimentos ilustrativos, deslize para navegar">${exemplos.map((texto, i) => `<article class="cartao-depoimento"><span class="etiqueta-exemplo">Exemplo de apresentação</span><p>${texto}</p><strong>Cliente ${i + 1} · exemplo</strong></article>`).join('')}</div></section>`;
  }

  /** Avanço manual sem temporizador; respeita a preferência por movimento reduzido. */
  function rolarDepoimentos(passo) {
    const lista = document.querySelector('.lista-depoimentos');
    const largura = lista.querySelector('article').getBoundingClientRect().width + 20;
    lista.scrollBy({
      left: largura * passo,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  }
  window.LuaKids.depoimentos = { montarDepoimentos, rolarDepoimentos };
})();
