/** Cores informativas, compartilhadas entre cartões, sacola e histórico da compra. */
(() => {
  'use strict';
  const { escaparHTML } = window.LuaKids.utilitarios;
  const AVISO_CORES =
    'As cores são sortidas e podem ser substituídas conforme a disponibilidade. Não há escolha individual.';

  /**
   * Não são botões de seleção: cada amostra tem nome legível e uma cor CSS validada.
   * Pedidos antigos sem a informação não recebem cores atuais do catálogo.
   */
  function montarCores(cores, compacto = false) {
    if (!Array.isArray(cores) || !cores.length) return '';
    return `<div class="cores-modelo ${compacto ? 'cores-compactas' : ''}"><span class="cores-rotulo">Cores do modelo</span><ul aria-label="Cores do modelo, envio sortido">${cores
      .map((cor) => {
        const hexadecimal = /^#[\da-f]{6}$/i.test(cor.hex) ? cor.hex : '#eae2df';
        return `<li title="${escaparHTML(cor.name)}"><span class="amostra-cor" style="background-color:${hexadecimal}" aria-hidden="true"></span><span>${escaparHTML(cor.name)}</span></li>`;
      })
      .join('')}</ul></div>`;
  }

  /**
   * Reúne características sem consultar o catálogo em pedidos antigos.
   * A sacola e os resumos compactos omitem tamanhos aqui porque já os exibem fora dos detalhes.
   */
  function montarCaracteristicas(item, compacto = false, { mostrarTamanhos = true } = {}) {
    return `<div class="caracteristicas-item">${item.fabric ? `<p>Tecido: ${escaparHTML(item.fabric)}</p>` : ''}${mostrarTamanhos ? `<p>Tamanhos: ${item.sizes.map(escaparHTML).join(' / ')} · 1 unidade por tamanho</p>` : ''}${montarCores(item.colors, compacto)}${item.colors?.length ? `<p class="aviso-cores">${AVISO_CORES}</p>` : ''}</div>`;
  }
  window.LuaKids.cores = { montarCores, montarCaracteristicas, AVISO_CORES };
})();
