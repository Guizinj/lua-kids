/**
 * Fragmentos compartilhados: marca, campos, resumo, endereço e estados vazios.
 * Módulo encapsulado: só os métodos listados no final ficam disponíveis em LuaKids.
 * Os scripts tradicionais preservam a abertura direta pelo index.html, sem instalação.
 */
(() => {
  'use strict';
  const LuaKids = window.LuaKids;
  const { escaparHTML, formatarDinheiro } = LuaKids.utilitarios;
  const { ROTULOS_STATUS } = LuaKids.configuracao;
  const { montarIcone } = LuaKids.icones;
  const { caminhoImagem } = LuaKids.utilitarios;

  /**
   * Etiqueta de status: o rótulo vem da configuração, não do texto enviado pelo usuário.
   */
  const montarEtiquetaStatus = (status) =>
    `<span class="status ${escaparHTML(status)}">${escaparHTML(ROTULOS_STATUS[status])}</span>`;
  /**
   * A imagem original da logo é preservada; o recorte circular é exclusivamente CSS.
   */
  const montarMarca = () =>
    `<a class="brand" href="#/" aria-label="Lua Kids — início"><span class="brand-seal"><img src="recursos/imagens/logo-original.jpg" alt="Logo Lua Kids"></span><span class="brand-name">Lua <small>kids · atacado</small></span></a>`;

  /**
   * Recebe pares [rótulo, endereço opcional] e produz o caminho de navegação. Textos e
   * endereços passam por escape antes de entrar no HTML.
   */
  function montarCaminho(entries) {
    return /* HTML */ `<nav class="breadcrumb" aria-label="Caminho da página"
      ><a href="#/">Início</a>${entries
        .map(
          ([label, href]) =>
            `<span aria-hidden="true">/</span>${href ? `<a href="${escaparHTML(href)}">${escaparHTML(label)}</a>` : `<span aria-current="page">${escaparHTML(label)}</span>`}`,
        )
        .join('')}</nav
    >`;
  }

  /**
   * Monta um estado vazio reutilizável com ícone, mensagem e ação opcional. A ação deve ser
   * HTML estático controlado pela aplicação, nunca conteúdo recebido do usuário.
   */
  function montarEstadoVazio(symbol, title, text, action = '') {
    return /* HTML */ `<div class="empty-state"
      >${montarIcone(symbol)}<h2>${escaparHTML(title)}</h2
      ><p>${escaparHTML(text)}</p>${action}</div
    >`;
  }

  /**
   * Monta um campo rotulado do fechamento. Centraliza valor, autocomplete, obrigatoriedade e
   * instruções; valores de formulário são escapados para não virar HTML.
   */
  function montarCampo(name, label, options = {}) {
    const value = options.value ?? '';
    return /* HTML */ `<label class="field ${options.full ? 'full' : ''}"
      ><span>${escaparHTML(label)}${options.optional ? ' (opcional)' : ''}</span
      ><input
        name="${name}"
        value="${escaparHTML(value)}"
        ${options.optional ? '' : 'required'}
        ${options.attrs || ''}
        placeholder="${escaparHTML(options.placeholder || '')}"
        autocomplete="${options.autocomplete || 'off'}"
      />${options.hint ? `<small>${escaparHTML(options.hint)}</small>` : ''}</label
    >`;
  }

  /**
   * Monta a lista de valores por modelo. Aceita tanto itens atuais da sacola como as cópias
   * de preço e composição preservadas em um pedido. A opção compacto, usada no fechamento
   * e no histórico, mantém o essencial visível e recolhe tecido/cores do próprio item.
   */
  function montarResumoItens(items, { compacto = false } = {}) {
    return items
      .map((item) =>
        compacto
          ? montarItemPedidoCompacto(item)
          : `<div class="summary-item"><img src="${caminhoImagem(item.image)}" alt=""><div><h3>${escaparHTML(item.name)}</h3><p>${item.quantity} ${item.quantity === 1 ? 'grade' : 'grades'} · ${item.quantity * item.sizes.length} peças</p>${LuaKids.cores.montarCaracteristicas(item, true)}</div><strong>${formatarDinheiro(item.price * item.quantity)}</strong></div>`,
      )
      .join('');
  }

  /** Resumo sem controles de edição: quantidades e valores vêm do item recebido. */
  function montarItemPedidoCompacto(item) {
    const nome = escaparHTML(item.name);
    const temDetalhes = item.fabric || item.colors?.length;
    return /* HTML */ `<div class="summary-item item-pedido-compacto">
      <img src="${caminhoImagem(item.image)}" alt="" width="48" height="64" />
      <div>
        <h3>${nome}</h3>
        <div class="item-pedido-valores">
          <p
            >${item.quantity} ${item.quantity === 1 ? 'grade' : 'grades'} ·
            ${item.quantity * item.sizes.length} peças</p
          >
          <strong>${formatarDinheiro(item.price * item.quantity)}</strong>
        </div>
        <p class="item-pedido-tamanhos">Tamanhos: ${item.sizes.map(escaparHTML).join(' / ')}</p>
        ${temDetalhes
          ? `<details class="detalhes-item-pedido"><summary aria-label="Detalhes da grade de ${nome}">Detalhes da grade</summary>${LuaKids.cores.montarCaracteristicas(item, true, { mostrarTamanhos: false })}</details>`
          : ''}
      </div>
    </div>`;
  }

  /**
   * Formata o endereço registrado no pedido. Consulta a cópia histórica, sem substituí-la
   * pelo endereço atual do perfil; todos os campos são escapados.
   */
  function montarEndereco(order) {
    const c = order.customer;
    return /* HTML */ `<address class="address"
      ><strong>${escaparHTML(c.name)}</strong><br />${escaparHTML(c.street)},
      ${escaparHTML(c.number)}${c.complement ? ' · ' + escaparHTML(c.complement) : ''}<br />${escaparHTML(
        c.neighborhood,
      )}
      · ${escaparHTML(c.city)}/${escaparHTML(c.uf)}<br />CEP ${escaparHTML(c.cep)}<br />WhatsApp
      ${escaparHTML(c.phone)}</address
    >`;
  }

  /**
   * Retorna uma alternativa segura quando a rota ou o produto não existe, oferecendo a volta
   * ao catálogo.
   */
  function montarPaginaNaoEncontrada() {
    return /* HTML */ `<div class="container section"
      >${montarEstadoVazio(
        'search',
        'Não encontramos esta página.',
        'Volte ao catálogo para continuar explorando a Lua Kids.',
        '<a class="button" href="#/catalogo">Ir para o catálogo</a>',
      )}</div
    >`;
  }
  LuaKids.componentes = {
    montarMarca,
    montarEtiquetaStatus,
    montarCaminho,
    montarEstadoVazio,
    montarCampo,
    montarResumoItens,
    montarEndereco,
    montarPaginaNaoEncontrada,
  };
})();
