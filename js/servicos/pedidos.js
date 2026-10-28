/**
 * Operações de pedidos na demonstração. Futuramente deverão ser validadas no banco/API.
 * Módulo encapsulado: só os métodos listados no final ficam disponíveis em LuaKids.
 * Os scripts tradicionais preservam a abertura direta pelo index.html, sem instalação.
 */
(() => {
  'use strict';
  const LuaKids = window.LuaKids;
  const { obterEstado, alterarEstado } = LuaKids.armazenamento;
  const { somenteDigitos } = LuaKids.utilitarios;
  const { listarItensSacola, calcularTotaisSacola } = LuaKids.sacola;
  const { calcularEntrega } = LuaKids.entrega;

  /**
   * Agrupa os clientes presentes nos pedidos pelo identificador e inclui o perfil
   * demonstrativo ativo. Não é autenticação: serve para testar históricos no protótipo.
   */
  function listarClientes() {
    const map = new Map(obterEstado().orders.map((o) => [o.customer.id, o.customer]));
    if (obterEstado().profile.id) map.set(obterEstado().profile.id, obterEstado().profile);
    return [...map.values()];
  }

  /**
   * Valida a transição e altera uma cópia do estado. Confirmação verifica todos os itens
   * antes de reservar; cancelamento devolve uma reserva uma única vez. É uma transação
   * simulada localmente.
   */
  function alterarStatusPedido(id, status) {
    const allowed = {
      aguardando: ['confirmado', 'cancelado'],
      confirmado: ['preparando', 'cancelado'],
      preparando: ['enviado', 'cancelado'],
      enviado: ['entregue'],
      entregue: [],
      cancelado: [],
    };
    alterarEstado((next) => {
      const order = next.orders.find((o) => o.id === id);
      if (!order || !allowed[order.status].includes(status))
        throw new Error('Esta alteração de status não está disponível.');
      if (status === 'confirmado') {
        for (const item of order.items)
          if ((next.stock[item.productId] || 0) < item.quantity)
            throw new Error(
              `Estoque insuficiente para ${item.name}. Ajuste o pedido com o cliente antes de confirmar.`,
            );
        for (const item of order.items) {
          next.stock[item.productId] -= item.quantity;
          next.sold[item.productId] = (next.sold[item.productId] || 0) + item.quantity;
        }
        order.reserved = true;
      }
      if (status === 'cancelado' && order.reserved) {
        for (const item of order.items) {
          next.stock[item.productId] += item.quantity;
          next.sold[item.productId] = Math.max(0, (next.sold[item.productId] || 0) - item.quantity);
        }
        order.reserved = false;
      }
      order.status = status;
      order.timeline.push({ status, at: new Date().toISOString() });
    });
  }
  /**
   * Cria o pedido a partir dos campos do fechamento. Copia preço, composição e endereço;
   * limpa a sacola somente depois de gravar. Nenhum estoque é reservado neste momento.
   * @param {Object} valores Campos já coletados; saveAddress é um booleano.
   * @returns {string} Identificador do pedido demonstrativo criado.
   */
  function criarPedido(valores) {
    const telefone = somenteDigitos(valores.phone);
    if (!/^[1-9]\d{9,10}$/.test(telefone))
      throw new Error('Informe um WhatsApp com DDD e 10 ou 11 dígitos.');
    const itens = listarItensSacola(),
      totais = calcularTotaisSacola();
    if (totais.pieces < 10) throw new Error('O pedido mínimo é de 10 peças em grades completas.');
    for (const item of itens)
      if (item.quantity > obterEstado().stock[item.id])
        throw new Error(
          'O estoque de ' + item.name + ' mudou. Revise a sacola antes de continuar.',
        );
    const conhecido = obterEstado().orders.find(
      (pedido) => somenteDigitos(pedido.customer.phone) === telefone,
    )?.customer;
    const cliente = { id: conhecido?.id || 'demo-' + telefone };
    for (const campo of [
      'name',
      'phone',
      'cep',
      'city',
      'uf',
      'street',
      'number',
      'neighborhood',
      'complement',
    ])
      cliente[campo] = String(valores[campo] || '').trim();
    const sufixo = (globalThis.crypto?.randomUUID?.() || Date.now().toString(36))
      .replace(/-/g, '')
      .slice(0, 7)
      .toUpperCase();
    const pedido = {
      id: 'LK-' + sufixo,
      customer: cliente,
      items: itens.map((item) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        sizes: [...item.sizes],
        image: item.image,
        quantity: item.quantity,
      })),
      total: totais.total,
      pieces: totais.pieces,
      status: 'aguardando',
      reserved: false,
      createdAt: new Date().toISOString(),
      timeline: [{ status: 'aguardando', at: new Date().toISOString() }],
      attachment: null,
      delivery: {
        ...calcularEntrega(cliente),
        preference: String(valores.preference || '').trim(),
        notes: String(valores.notes || '').trim(),
      },
    };
    alterarEstado((copia) => {
      copia.orders.unshift(pedido);
      copia.cart = {};
      copia.profile = valores.saveAddress
        ? { ...cliente }
        : { id: cliente.id, name: cliente.name, phone: cliente.phone };
      copia.checkoutDraft = {};
    });
    return pedido.id;
  }
  /**
   * Troca somente o perfil fictício de avaliação; não cria sessão ou permissão de acesso
   * real.
   */
  function selecionarCliente(id) {
    const cliente = listarClientes().find((item) => item.id === id);
    if (cliente)
      alterarEstado((copia) => {
        copia.profile = { ...cliente };
      });
  }

  LuaKids.pedidos = { listarClientes, criarPedido, alterarStatusPedido, selecionarCliente };
})();
