/**
 * Formulário de fechamento, avisos de entrega e recuperação do rascunho.
 * Módulo encapsulado: só os métodos listados no final ficam disponíveis em LuaKids.
 * Os scripts tradicionais preservam a abertura direta pelo index.html, sem instalação.
 */
(() => {
  'use strict';
  const LuaKids = window.LuaKids;
  const { selecionar, escaparHTML, formatarDinheiro } = LuaKids.utilitarios;
  const { obterEstado, alterarEstado } = LuaKids.armazenamento;
  const { listarItensSacola, calcularTotaisSacola } = LuaKids.sacola;
  const { montarCaminho, montarEstadoVazio, montarCampo, montarResumoItens } = LuaKids.componentes;
  const { montarIcone } = LuaKids.icones;
  const { calcularEntrega } = LuaKids.entrega;
  const { criarPedido } = LuaKids.pedidos;
  const { navegar } = LuaKids.navegacao;
  const { renderizarCabecalho } = LuaKids.estrutura;
  const { mostrarAviso } = LuaKids.avisos;

  let temporizadorRascunho;
  /**
   * Monta o fechamento somente quando há dez ou mais peças. Restaura o rascunho/endereço,
   * apresenta as regras de transporte e mantém a indicação de demonstração sem login.
   */
  function montarFechamento() {
    const { total, pieces, grades } = calcularTotaisSacola();
    if (pieces < 10)
      return /* HTML */ `<div class="container section"
        >${montarEstadoVazio(
          'bag',
          'Vamos completar a sua sacola?',
          'O pedido precisa ter no mínimo 10 peças, em grades completas.',
          '<button class="button" data-action="cart-open">Revisar sacola</button>',
        )}</div
      >`;
    const draft = obterEstado().checkoutDraft || {};
    const profile = obterEstado().profile || {};
    const value = (key) => draft[key] ?? profile[key] ?? '';
    const ufs = [
      'AC',
      'AL',
      'AP',
      'AM',
      'BA',
      'CE',
      'DF',
      'ES',
      'GO',
      'MA',
      'MT',
      'MS',
      'MG',
      'PA',
      'PB',
      'PR',
      'PE',
      'PI',
      'RJ',
      'RN',
      'RS',
      'RO',
      'RR',
      'SC',
      'SP',
      'SE',
      'TO',
    ];
    return /* HTML */ `<div class="container"
      ><div class="page-heading"
        >${montarCaminho([['Catálogo', '#/catalogo'], ['Fechar pedido']])}<h1
          >Vamos cuidar do seu pedido.</h1
        ><p
          >Preencha os dados para experimentar o fechamento. O pagamento será combinado diretamente
          com a loja pelo WhatsApp.</p
        ></div
      ><div class="form-layout"
        ><form id="checkout-form"
          ><section class="panel-card"
            ><h2>01 · Quem está comprando?</h2
            ><div class="notice" style="margin-bottom:23px"
              >Esta é uma demonstração sem login. Use dados fictícios. O acesso real dos clientes
              será definido na próxima etapa.</div
            ><div class="form-grid"
              >${montarCampo('name', 'Nome completo', {
                value: value('name'),
                autocomplete: 'name',
                attrs: 'maxlength="100" minlength="3"',
                placeholder: 'Como podemos chamar você?',
              })}${montarCampo('phone', 'WhatsApp com DDD', {
                value: value('phone'),
                attrs: 'type="tel" inputmode="tel" maxlength="20"',
                autocomplete: 'tel',
                placeholder: '(81) 90000-0000',
              })}</div
            ></section
          ><section class="panel-card"
            ><h2>02 · Onde você quer receber?</h2
            ><div class="form-grid"
              >${montarCampo('cep', 'CEP', {
                value: value('cep'),
                attrs: 'inputmode="numeric" maxlength="9" pattern="[0-9]{5}-?[0-9]{3}"',
                autocomplete: 'postal-code',
                placeholder: '00000-000',
              })}${montarCampo('city', 'Cidade', {
                value: value('city'),
                attrs: 'maxlength="100"',
                autocomplete: 'address-level2',
                placeholder: 'Sua cidade',
              })}<label class="field"
                ><span>Estado</span
                ><select name="uf" required autocomplete="address-level1"
                  ><option value="">Selecione</option
                  >${ufs
                    .map(
                      (uf) =>
                        `<option value="${uf}" ${value('uf') === uf ? 'selected' : ''}>${uf}</option>`,
                    )
                    .join('')}</select
                ></label
              >${montarCampo('neighborhood', 'Bairro', {
                value: value('neighborhood'),
                attrs: 'maxlength="100"',
                placeholder: 'Seu bairro',
              })}${montarCampo('street', 'Rua / avenida', {
                value: value('street'),
                full: true,
                attrs: 'maxlength="160"',
                autocomplete: 'address-line1',
                placeholder: 'Endereço de entrega',
              })}${montarCampo('number', 'Número', {
                value: value('number'),
                attrs: 'maxlength="20"',
                placeholder: 'Número ou S/N',
              })}${montarCampo('complement', 'Complemento', {
                value: value('complement'),
                optional: true,
                attrs: 'maxlength="120"',
                autocomplete: 'address-line2',
                placeholder: 'Apartamento, referência…',
              })}</div
            ><div id="delivery-notice" style="margin-top:22px"></div></section
          ><section class="panel-card"
            ><h2>03 · Transporte e observações</h2
            ><div class="form-grid"
              >${montarCampo('preference', 'Loteiro ou transportadora de preferência', {
                value: draft.preference || '',
                optional: true,
                full: true,
                attrs: 'maxlength="160"',
                placeholder: 'Nome ou contato, se já tiver',
                hint: 'Para fora de Caruaru, a escolha e o custo do transporte são combinados com você.',
              })}<label class="field full"
                ><span>Observações (opcional)</span
                ><textarea
                  name="notes"
                  maxlength="1000"
                  placeholder="Algo que a loja precisa saber?"
                >
${escaparHTML(draft.notes || '')}</textarea
                ></label
              ><label class="check-inline field full"
                ><input
                  type="checkbox"
                  name="saveAddress"
                  ${draft.saveAddress === false ? '' : 'checked'}
                />
                Guardar este endereço na demonstração deste navegador.</label
              ></div
            ></section
          ></form
        ><aside class="panel-card order-summary"
          ><h2>Seu pedido</h2>${montarResumoItens(listarItensSacola())}<div class="summary-row"
            ><span>Grades completas</span><span>${grades}</span></div
          ><div class="summary-row"><span>Total de peças</span><span>${pieces}</span></div
          ><div class="summary-row"><span>Entrega</span><span id="delivery-summary"></span></div
          ><div class="summary-row total"
            ><span>Subtotal dos produtos</span><strong>${formatarDinheiro(total)}</strong></div
          ><button type="submit" form="checkout-form" class="button full"
            >Criar pedido de demonstração ${montarIcone('arrow')}</button
          ><p class="small-print"
            >O pedido ficará aguardando confirmação. As grades só serão reservadas quando o dono
            confirmar no painel. Fora de Caruaru, o subtotal não inclui o transporte.</p
          ><button class="text-link" data-action="cart-open">Revisar minha sacola</button></aside
        ></div
      ></div
    >`;
  }

  /**
   * Lê cidade e UF do formulário e atualiza o aviso e o resumo da entrega. É uma simulação
   * visual; a versão com Supabase também precisará validar isso no ambiente confiável.
   */
  function atualizarAvisoEntrega() {
    const form = selecionar('#checkout-form');
    if (!form) return;
    const city = form.elements.city.value.trim();
    const uf = form.elements.uf.value;
    const local = calcularEntrega({ city, uf }).type === 'local';
    selecionar('#delivery-notice').innerHTML =
      `<div class="notice ${local ? 'green' : ''}">${local ? '<strong>Entrega grátis em Caruaru/PE.</strong> O prazo será combinado com a loja.' : '<strong>Frete a combinar, por sua conta.</strong> A loja organiza o despacho no loteiro ou transportadora combinado com você. Não há cobrança automática de R$ 30 nem cálculo por distância.'}</div>`;
    selecionar('#delivery-summary').textContent = local ? 'Grátis · Caruaru/PE' : 'A combinar';
  }

  /**
   * Guarda os campos e a preferência de salvar endereço na mesma origem do navegador. Isso
   * permite voltar ao fechamento sem perder o preenchimento.
   */
  function salvarRascunho(form) {
    const fields = Object.fromEntries(new FormData(form));
    fields.saveAddress = form.elements.saveAddress.checked;
    alterarEstado((next) => {
      next.checkoutDraft = fields;
    });
  }
  /**
   * Valida o formulário nativo e delega a criação ao serviço de pedidos antes de navegar.
   */
  function enviarFormulario(formulario) {
    if (!formulario.reportValidity()) return;
    const valores = Object.fromEntries(new FormData(formulario));
    valores.saveAddress = formulario.elements.saveAddress.checked;
    const id = criarPedido(valores);
    clearTimeout(temporizadorRascunho);
    renderizarCabecalho();
    navegar('pedido/' + id + '?novo=1');
  }
  /**
   * Aguarda uma pausa na digitação para evitar gravar a cada tecla e não salva formulários já
   * removidos.
   */
  function agendarRascunho(formulario) {
    clearTimeout(temporizadorRascunho);
    temporizadorRascunho = setTimeout(() => {
      if (!formulario.isConnected) return;
      try {
        salvarRascunho(formulario);
      } catch (erro) {
        mostrarAviso(erro.message, true);
      }
    }, 250);
  }

  LuaKids.fechamento = {
    montarFechamento,
    atualizarAvisoEntrega,
    salvarRascunho,
    agendarRascunho,
    enviarFormulario,
  };
})();
