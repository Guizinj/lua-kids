/**
 * Painel de acompanhamento: visão dos históricos e seus filtros. Sem cadastro de produtos.
 * Módulo encapsulado: só os métodos listados no final ficam disponíveis em LuaKids.
 * Os scripts tradicionais preservam a abertura direta pelo index.html, sem instalação.
 */
(() => {
  'use strict';
  const LuaKids = window.LuaKids;
  const {
    selecionar,
    escaparHTML,
    formatarDinheiro,
    formatarData,
    normalizarTexto,
    somenteDigitos,
  } = LuaKids.utilitarios;
  const { obterEstado } = LuaKids.armazenamento;
  const { listarClientes } = LuaKids.pedidos;
  const { lerRota } = LuaKids.navegacao;
  const { montarCaminho, montarEtiquetaStatus, montarEstadoVazio } = LuaKids.componentes;
  const { ROTULOS_STATUS } = LuaKids.configuracao;
  const { montarIcone } = LuaKids.icones;

  /**
   * Monta indicadores e seleção de históricos por cliente. O painel continua limitado ao
   * acompanhamento de pedidos, sem cadastro de produtos ou edição manual de estoque.
   */
  function montarPainel() {
    const all = listarClientes();
    const pending = obterEstado().orders.filter((o) => o.status === 'aguardando').length;
    const inProgress = obterEstado().orders.filter((o) =>
      ['confirmado', 'preparando'].includes(o.status),
    ).length;
    const shipped = obterEstado().orders.filter((o) =>
      ['enviado', 'entregue'].includes(o.status),
    ).length;
    const selected = lerRota().params.get('cliente') || '';
    return /* HTML */ `<div class="container"
      ><div class="page-heading"
        >${montarCaminho([['Painel demonstrativo']])}<div class="admin-intro"
          ><div
            ><p class="eyebrow">Lua Kids · Acompanhamento</p><h1>Cada pedido, mais perto.</h1
            ><p
              >Consulte o histórico dos clientes, confirme pedidos e compartilhe os comprovantes
              de despacho.</p
            ></div
          ><a class="button secondary small" href="#/">Ver loja ${montarIcone('arrow')}</a></div
        ><div class="notice"
          >Painel de demonstração aberto, sem autenticação. Use somente dados fictícios.
          Cadastro de produtos e edição manual do estoque ficam para uma etapa futura.</div
        ><div class="stat-grid"
          >${[
            ['Pedidos no histórico', obterEstado().orders.length],
            ['Aguardando confirmação', pending],
            ['Em atendimento', inProgress],
            ['Enviados ou entregues', shipped],
          ]
            .map(
              ([label, value]) =>
                `<div class="stat-card"><small>${label}</small><strong>${value}</strong></div>`,
            )
            .join('')}</div
        ></div
      ><div class="admin-layout"
        ><aside class="customers"
          ><h2>Histórico por cliente</h2
          ><button
            class="customer-button ${!selected ? 'active' : ''}"
            data-action="customer"
            data-id=""
            >Todos os clientes<small>${all.length} perfis de demonstração</small></button
          >${all
            .map(
              (c) =>
                `<button class="customer-button ${selected === c.id ? 'active' : ''}" data-action="customer" data-id="${escaparHTML(c.id)}">${escaparHTML(c.name)}<small>${obterEstado().orders.filter((o) => o.customer.id === c.id).length} pedidos · ${escaparHTML(c.phone)}</small></button>`,
            )
            .join('')}</aside
        ><section class="admin-orders" aria-label="Pedidos"
          ><div class="table-toolbar"
            ><label class="visually-hidden" for="admin-search"
              >Buscar por pedido, cliente ou WhatsApp</label
            ><input
              id="admin-search"
              type="search"
              placeholder="Buscar pedido, cliente ou WhatsApp…"
            /><label class="visually-hidden" for="admin-status">Filtrar status</label
            ><select id="admin-status"
              ><option value="">Todos os status</option
              >${Object.entries(ROTULOS_STATUS)
                .map(([key, label]) => `<option value="${key}">${label}</option>`)
                .join('')}</select
            ></div
          ><div class="table-wrap" id="admin-table"></div></section></div
    ></div>`;
  }

  /**
   * Filtra os pedidos por cliente, busca e status e atualiza apenas a tabela. O formulário de
   * filtros permanece no DOM para não perder a digitação.
   */
  function atualizarTabelaPedidos() {
    const root = selecionar('#admin-table');
    if (!root) return;
    const q = normalizarTexto(selecionar('#admin-search').value);
    const filter = selecionar('#admin-status').value;
    const selected = lerRota().params.get('cliente');
    const orders = obterEstado().orders.filter(
      (o) =>
        (!selected || o.customer.id === selected) &&
        (!filter || o.status === filter) &&
        (!q ||
          normalizarTexto(
            `${o.id} ${o.customer.name} ${o.customer.phone} ${somenteDigitos(o.customer.phone)}`,
          ).includes(q)),
    );
    root.innerHTML = orders.length
      ? `<table class="orders-table"><thead><tr><th scope="col">Pedido / data</th><th scope="col">Cliente</th><th scope="col">Status</th><th scope="col">Produtos</th><th scope="col"><span class="visually-hidden">Detalhes</span></th></tr></thead><tbody>${orders.map((o) => `<tr><td data-label="Pedido / data"><a href="#/painel/pedido/${escaparHTML(o.id)}">${escaparHTML(o.id)}</a><small>${formatarData(o.createdAt)}</small></td><td data-label="Cliente">${escaparHTML(o.customer.name)}<small>${escaparHTML(o.customer.city)}/${escaparHTML(o.customer.uf)}</small></td><td data-label="Status">${montarEtiquetaStatus(o.status)}</td><td data-label="Produtos">${formatarDinheiro(o.total)}<small>${o.pieces} peças</small></td><td data-label=""><a href="#/painel/pedido/${escaparHTML(o.id)}" aria-label="Abrir pedido ${escaparHTML(o.id)}">Abrir →</a></td></tr>`).join('')}</tbody></table>`
      : montarEstadoVazio(
          'search',
          'Nenhum pedido encontrado.',
          'Altere a busca, o status ou o cliente selecionado.',
        );
  }
  LuaKids.painel = { montarPainel, atualizarTabelaPedidos };
})();
