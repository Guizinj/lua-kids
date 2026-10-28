/**
 * Histórico e detalhes de pedidos, compartilhados com a visão do painel.
 * Módulo encapsulado: só os métodos listados no final ficam disponíveis em LuaKids.
 * Os scripts tradicionais preservam a abertura direta pelo index.html, sem instalação.
 */
(() => {
  'use strict';
  const LuaKids = window.LuaKids;
  const { escaparHTML, formatarDinheiro, formatarData, caminhoImagem } = LuaKids.utilitarios;
  const { obterEstado } = LuaKids.armazenamento;
  const { listarClientes } = LuaKids.pedidos;
  const { lerRota } = LuaKids.navegacao;
  const {
    montarCaminho,
    montarEstadoVazio,
    montarEtiquetaStatus,
    montarResumoItens,
    montarEndereco,
    montarPaginaNaoEncontrada,
  } = LuaKids.componentes;
  const { ROTULOS_STATUS } = LuaKids.configuracao;
  const { montarIcone } = LuaKids.icones;

  /**
   * Monta a área do cliente com histórico filtrado pelo perfil de demonstração. A troca de
   * perfil é visível e declarada como ferramenta de avaliação, sem proteção de produção.
   */
  function montarHistoricoCliente() {
    const profile = obterEstado().profile;
    const orders = obterEstado().orders.filter((o) => o.customer.id === profile.id);
    return /* HTML */ `<div class="container"
      ><div class="page-heading"
        >${montarCaminho([['Meus pedidos']])}<p
          >Acompanhe os detalhes e o andamento dos seus pedidos em um só lugar.</p
        ></div
      ><div class="account-layout"
        ><aside class="account-sidebar"
          ><div class="avatar">${escaparHTML(profile.name?.charAt(0) || 'L')}</div
          ><h2>${escaparHTML(profile.name || 'Cliente de demonstração')}</h2
          ><p>${escaparHTML(profile.phone)}</p
          ><div class="notice"
            >Área demonstrativa, sem autenticação. A troca de cliente abaixo existe apenas para
            avaliar o protótipo.</div
          ><a class="button secondary full atalho-endereco" href="#/endereco"
            >${montarIcone('location')}<span>Meu endereço</span>${montarIcone('arrow')}</a
          ><label class="field"
            ><span>Simular outro cliente</span
            ><select id="demo-profile"
              >${listarClientes()
                .map(
                  (c) =>
                    `<option value="${escaparHTML(c.id)}" ${profile.id === c.id ? 'selected' : ''}>${escaparHTML(c.name)}</option>`,
                )
                .join('')}</select
            ></label
          ></aside
        ><section
          ><div class="account-tabs"
            ><a class="chip active" href="#/pedidos">Meus pedidos (${orders.length})</a
            ><a class="chip" href="#/favoritos"
              >Favoritos (${obterEstado().favorites.length})</a
            ></div
          ><div class="orders-list"
            >${orders.length
              ? orders.map(montarCartaoPedido).join('')
              : montarEstadoVazio(
                  'bag',
                  'Sua história começa na próxima escolha.',
                  'Adicione algumas grades e experimente criar seu primeiro pedido.',
                  '<a class="button" href="#/catalogo">Explorar catálogo</a>',
                )}</div
          ></section
        ></div
      ></div
    >`;
  }

  /**
   * Resume um pedido com status, data, modelos, subtotal e acesso aos detalhes. Usa os
   * valores copiados na compra, preservando o histórico mesmo se o catálogo mudar.
   */
  function montarCartaoPedido(order) {
    return /* HTML */ `<article class="order-card"
      ><div class="order-card-top"
        ><div
          ><h3>Pedido ${escaparHTML(order.id)}</h3
          ><p class="date">${formatarData(order.createdAt)}</p></div
        >${montarEtiquetaStatus(order.status)}</div
      ><div class="order-card-bottom"
        ><div class="order-thumbnails"
          >${order.items
            .slice(0, 3)
            .map(
              (item) =>
                `<img src="${caminhoImagem(item.image)}" alt="${escaparHTML(item.name)}">`,
            )
            .join('')}</div
        ><div class="order-card-total"
          >${formatarDinheiro(order.total)}<small
            >${order.pieces} peças ·
            ${order.delivery.fee === 0 ? 'Entrega grátis' : 'Frete a combinar'}</small
          ></div
        ><a class="button secondary small" href="#/pedido/${escaparHTML(order.id)}"
          >Ver pedido ${montarIcone('arrow')}</a
        ></div
      ></article
    >`;
  }

  /**
   * Monta a visualização e o download de uma imagem local de comprovante. Aceita somente Data
   * URLs dos formatos previstos; não representa acesso privado de produção.
   */
  function montarComprovante(order) {
    if (
      !order.attachment ||
      !/^data:image\/(png|jpeg|webp);base64,/.test(order.attachment.data)
    )
      return '<p class="small-print">O comprovante de despacho aparecerá aqui quando a loja anexar a imagem.</p>';
    return /* HTML */ `<img
        class="attachment-preview"
        src="${order.attachment.data}"
        alt="Comprovante de despacho do pedido ${escaparHTML(order.id)}"
      /><p class="attachment-name">${escaparHTML(order.attachment.name)}</p
      ><a
        class="text-link"
        href="${order.attachment.data}"
        download="${escaparHTML(order.attachment.name)}"
        >Baixar comprovante ${montarIcone('arrow')}</a
      >`;
  }

  /**
   * Monta os detalhes usados pela área do cliente e pelo painel. O parâmetro admin muda os
   * controles exibidos; esta opção não é uma autorização e será substituída por permissões
   * reais.
   */
  function montarDetalhesPedido(id, admin = false) {
    const order = obterEstado().orders.find((o) => o.id === id);
    if (!order) return montarPaginaNaoEncontrada();
    if (!admin && order.customer.id !== obterEstado().profile.id)
      return /* HTML */ `<div class="container section"
        >${montarEstadoVazio(
          'user',
          'Este pedido pertence a outro perfil de demonstração.',
          'Selecione o cliente correspondente na área Meus pedidos. Na versão final, o acesso será protegido por autenticação.',
          '<a class="button" href="#/pedidos">Ir para meus pedidos</a>',
        )}</div
      >`;
    const nextStatus = {
      aguardando: ['confirmado', 'Confirmar e reservar estoque'],
      confirmado: ['preparando', 'Marcar em preparação'],
      preparando: ['enviado', 'Marcar como enviado'],
      enviado: ['entregue', 'Marcar como entregue'],
    }[order.status];
    const canCancel = ['aguardando', 'confirmado', 'preparando'].includes(order.status);
    return /* HTML */ `<div class="container"
      ><div class="page-heading"
        >${montarCaminho(
          admin
            ? [['Painel demonstrativo', '#/painel'], [order.id]]
            : [['Meus pedidos', '#/pedidos'], [order.id]],
        )}</div
      >${lerRota().params.get('novo')
        ? '<div class="success-heading">' +
          montarIcone('check') +
          '<p><strong>Pedido de demonstração criado!</strong>Ele já aparece no painel, aguardando confirmação. Nenhum pagamento foi efetuado e nenhuma mensagem foi enviada.</p></div>'
        : ''}<div class="order-heading"
        ><div
          ><h1>Pedido ${escaparHTML(order.id)}</h1
          ><p
            >${formatarData(order.createdAt)} · ${escaparHTML(order.customer.name)} ·
            ${order.pieces} peças</p
          ></div
        >${montarEtiquetaStatus(order.status)}</div
      ><div class="order-columns"
        ><div
          ><section class="panel-card"
            ><h2>A sua seleção</h2>${montarResumoItens(order.items, { compacto: true })}<div
              class="summary-row"
              ><span>Entrega</span
              ><span
                >${order.delivery.fee === 0
                  ? 'Grátis · Caruaru/PE'
                  : 'A combinar, por conta do cliente'}</span
              ></div
            ><div class="summary-row total"
              ><span>Subtotal dos produtos</span
              ><strong>${formatarDinheiro(order.total)}</strong></div
            ><p class="small-print"
              >${order.delivery.fee === 0
                ? 'Prazo e horário da entrega serão combinados com a loja.'
                : 'O transporte é combinado no atendimento e não está incluído neste subtotal.'}</p
            >${order.status === 'aguardando'
              ? '<div class="notice" style="margin-top:18px">A loja ainda vai confirmar a disponibilidade e combinar o pagamento. O estoque ainda não está reservado.</div>'
              : ''}</section
          ><section class="panel-card"
            ><h2>Acompanhamento do pedido</h2
            ><ol class="timeline"
              >${order.timeline
                .map(
                  (event) =>
                    `<li><strong>${escaparHTML(ROTULOS_STATUS[event.status])}</strong><small>${formatarData(event.at)} · ${new Date(event.at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</small></li>`,
                )
                .join('')}</ol
            ></section
          ><section class="panel-card"
            ><h2>Comprovante de despacho</h2>${montarComprovante(order)}${admin
              ? `<hr class="form-divider"><label class="upload" for="dispatch-file">${montarIcone('upload')}Anexar foto do despacho<small>JPG, PNG ou WebP · até 1 MB · visível na área deste cliente</small></label><input id="dispatch-file" type="file" accept="image/jpeg,image/png,image/webp" data-order="${escaparHTML(order.id)}" aria-label="Foto do comprovante de despacho">${order.attachment ? `<button class="text-link" data-action="remove-attachment" data-id="${escaparHTML(order.id)}">Remover anexo</button>` : ''}`
              : ''}</section
          ></div
        ><aside
          ><section class="panel-card"
            ><h2>Endereço de entrega</h2>${montarEndereco(order)}${order.delivery.preference
              ? `<hr class="form-divider"><p class="small-print"><strong>Transporte de preferência</strong><br>${escaparHTML(order.delivery.preference)}</p>`
              : ''}${order.delivery.notes
              ? `<p class="small-print"><strong>Observações</strong><br>${escaparHTML(order.delivery.notes)}</p>`
              : ''}</section
          ><section class="panel-card"
            ><h2>${admin ? 'Acompanhar este pedido' : 'Fale com a loja'}</h2>${admin
              ? `<div class="notice" style="margin-bottom:18px">Painel demonstrativo sem login. As ações alteram apenas os dados deste navegador.</div><div class="admin-actions">${nextStatus ? `<button class="button" data-action="status" data-id="${escaparHTML(order.id)}" data-status="${nextStatus[0]}">${escaparHTML(nextStatus[1])}</button>` : ''}<button class="button secondary" data-action="message" data-id="${escaparHTML(order.id)}" data-kind="shipping">${montarIcone('chat')} Preparar aviso pelo WhatsApp</button>${canCancel ? `<button class="button danger" data-action="status" data-id="${escaparHTML(order.id)}" data-status="cancelado">Cancelar pedido</button>` : ''}</div><p class="small-print">Ao confirmar, as grades são reservadas. Cancelar um pedido confirmado ou em preparação devolve a reserva ao estoque demonstrativo.</p>`
              : `<p class="small-print" style="margin:0 0 17px">O pagamento e o transporte são combinados pelo atendimento. Você pode preparar uma mensagem com os detalhes desta demonstração.</p><button class="button full" data-action="message" data-id="${escaparHTML(order.id)}" data-kind="order">${montarIcone('chat')} Prévia para WhatsApp</button>`}</section
          ><a
            class="text-link"
            href="${admin ? '#/painel' : '#/pedidos'}"
            style="margin-top:18px"
            >${montarIcone('back')} Voltar para ${admin ? 'o painel' : 'meus pedidos'}</a
          ></aside
        ></div
      ></div
    >`;
  }
  LuaKids.telaPedidos = { montarHistoricoCliente, montarDetalhesPedido };
})();
