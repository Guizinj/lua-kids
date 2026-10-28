/**
 * Prévia das mensagens manuais de atendimento; não usa API de disparo automático.
 * Módulo encapsulado: só os métodos listados no final ficam disponíveis em LuaKids.
 * Os scripts tradicionais preservam a abertura direta pelo index.html, sem instalação.
 */
(() => {
  'use strict';
  const LuaKids = window.LuaKids;
  const { selecionar, escaparHTML, formatarDinheiro, somenteDigitos } = LuaKids.utilitarios;
  const { obterEstado } = LuaKids.armazenamento;
  const { WHATSAPP_LOJA, ROTULOS_STATUS } = LuaKids.configuracao;
  const { montarIcone } = LuaKids.icones;

  /**
   * Prepara uma mensagem identificada como demonstração e mostra a prévia em um diálogo. O
   * WhatsApp só é aberto se a pessoa clicar no link; o acompanhamento ainda é local.
   */
  function mostrarMensagemWhatsApp(id, kind) {
    const order = obterEstado().orders.find((o) => o.id === id);
    if (!order) return;
    const admin = kind === 'shipping';
    const link = location.href.split('#')[0] + '#/pedido/' + encodeURIComponent(order.id);
    const text = admin
      ? `DEMONSTRAÇÃO LUA KIDS — não é um aviso real\n\nOlá, ${order.customer.name}! O pedido ${order.id} está com o status: ${ROTULOS_STATUS[order.status]}.\n${order.attachment ? 'O comprovante de despacho foi anexado ao pedido.\n' : ''}\nPágina do pedido: ${link}\n\nNesta prévia, esse link só funciona com os dados do navegador em que o pedido foi criado. O link compartilhável será habilitado com a integração real.`
      : `DEMONSTRAÇÃO LUA KIDS — não é uma compra real\n\nOlá! Quero avaliar o pedido ${order.id}.\nCliente: ${order.customer.name}\n\n${order.items.map((item) => `${item.quantity} grade(s) de ${item.name} — ${item.quantity * item.sizes.length} peças — ${formatarDinheiro(item.price * item.quantity)}`).join('\n')}\n\nTotal: ${order.pieces} peças\nSubtotal dos produtos: ${formatarDinheiro(order.total)}\nEntrega: ${order.delivery.fee === 0 ? 'grátis em Caruaru/PE' : 'a combinar, por conta do cliente'}\nDestino: ${order.customer.city}/${order.customer.uf}\n\nPagamento e disponibilidade a confirmar com a loja.`;
    const destination = admin ? somenteDigitos(order.customer.phone) : WHATSAPP_LOJA;
    const href = `https://wa.me/${destination.startsWith('55') ? destination : '55' + destination}?text=${encodeURIComponent(text)}`;
    selecionar('#message-dialog').innerHTML =
      `<h2 id="message-title">Mensagem pronta, com você no controle.</h2><div class="notice">Esta é uma prévia. Nenhuma mensagem é enviada automaticamente.${admin ? ' Os clientes de exemplo têm números fictícios.' : ''}</div><label class="visually-hidden" for="message-text">Texto da mensagem</label><textarea id="message-text" readonly>${escaparHTML(text)}</textarea><div class="dialog-actions"><button class="button secondary" data-action="message-close">Voltar</button><a class="button" href="${escaparHTML(href)}" target="_blank" rel="noopener noreferrer">Abrir WhatsApp com demonstração ${montarIcone('arrow')}</a></div><p class="small-print">O link de acompanhamento da prévia é local. Compartilhamento entre dispositivos depende de hospedagem, Supabase e acesso do cliente.</p>`;
    selecionar('#message-dialog').showModal();
  }
  LuaKids.whatsapp = { mostrarMensagemWhatsApp };
})();
