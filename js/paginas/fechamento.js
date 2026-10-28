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
  const { montarCaminho, montarEstadoVazio, montarCampo, montarResumoItens } =
    LuaKids.componentes;
  const { montarIcone } = LuaKids.icones;
  const { calcularEntrega } = LuaKids.entrega;
  const { criarPedido } = LuaKids.pedidos;
  const { navegar } = LuaKids.navegacao;
  const { renderizarCabecalho } = LuaKids.estrutura;
  const { mostrarAviso } = LuaKids.avisos;

  let temporizadorRascunho;
  let destinosInformados = new Set();

  /** Cada entrada no fechamento inicia uma visita; avisos não abrem a cada tecla. */
  function iniciarAvisosEntrega() {
    destinosInformados = new Set();
    atualizarAvisoEntrega();
    mostrarAvisoEntrega();
  }

  /** Abre ao concluir cidade/UF, ao recuperar endereço ou pelo botão explícito. */
  function mostrarAvisoEntrega(forcar = false) {
    const formulario = selecionar('#checkout-form');
    if (!formulario) return;
    const city = formulario.elements.city.value.trim();
    const uf = formulario.elements.uf.value;
    if (city.length < 2 || !uf) return;
    const chave = LuaKids.utilitarios.normalizarTexto(city) + '/' + uf;
    if (!forcar && destinosInformados.has(chave)) return;
    destinosInformados.add(chave);
    const local = calcularEntrega({ city, uf }).type === 'local';
    LuaKids.dialogos.abrir({
      titulo: local ? 'Entrega grátis em Caruaru/PE' : 'Frete a combinar, por sua conta',
      texto: local
        ? 'O prazo será combinado com a loja.'
        : 'A loja organiza o despacho no loteiro ou transportadora combinado com você. O transporte é por sua conta e não está incluído no subtotal dos produtos.',
    });
  }
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
          >Preencha os dados para experimentar o fechamento. O pagamento será combinado
          diretamente com a loja pelo WhatsApp.</p
        ></div
      ><div class="form-layout"
        ><form id="checkout-form"
          ><details class="panel-card etapa-fechamento" id="etapa-comprador"
            ><summary
              ><span class="etapa-textos"
                ><span class="etapa-titulo">01 · Quem está comprando?</span
                ><span class="resumo-etapa" id="resumo-comprador"
                  >Confira nome e WhatsApp.</span
                ></span
              >${montarIcone('arrow')}</summary
            ><div class="conteudo-etapa"
              ><div class="notice" style="margin-bottom:23px"
                >Esta é uma demonstração sem login. Use dados fictícios. O acesso real dos
                clientes será definido na próxima etapa.</div
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
              ></div
            ></details
          ><details class="panel-card etapa-fechamento" id="etapa-endereco"
            ><summary
              ><span class="etapa-textos"
                ><span class="etapa-titulo">02 · Onde você quer receber?</span
                ><span class="resumo-etapa" id="resumo-endereco"
                  >Informe o endereço de entrega.</span
                ></span
              >${montarIcone('arrow')}</summary
            ><div class="conteudo-etapa"
              ><p class="small-print"
                >${profile.street
                  ? 'Seu endereço salvo já está preenchido. Você pode usar outro neste pedido.'
                  : 'Informe o endereço de entrega.'}
                <a class="text-link" href="#/endereco">Meu endereço</a></p
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
              ><div id="delivery-notice" style="margin-top:22px"></div></div></details
          ><details class="panel-card etapa-fechamento" id="etapa-transporte"
            ><summary
              ><span class="etapa-textos"
                ><span class="etapa-titulo">03 · Transporte e observações</span
                ><span class="resumo-etapa" id="resumo-transporte"
                  >Informações opcionais.</span
                ></span
              >${montarIcone('arrow')}</summary
            ><div class="conteudo-etapa"
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
                    ${draft.saveAddress === true ? 'checked' : ''}
                  />
                  Salvar ou atualizar este endereço na minha conta demonstrativa.</label
                ></div
              ></div
            ></details
          ></form
        ><aside class="panel-card order-summary"
          ><h2>Seu pedido</h2>${montarResumoItens(listarItensSacola(), { compacto: true })}<div
            class="summary-row"
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
          ><button class="text-link" data-action="cart-open"
            >Revisar minha sacola</button
          ></aside
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
    atualizarResumosEtapas(form);
    const city = form.elements.city.value.trim();
    const uf = form.elements.uf.value;
    const local = calcularEntrega({ city, uf }).type === 'local';
    const completo = city.length > 1 && Boolean(uf);
    selecionar('#delivery-notice').innerHTML = completo
      ? `<div class="notice ${local ? 'green' : ''}">${local ? 'Entrega grátis em Caruaru/PE.' : 'Frete a combinar, por sua conta.'} <button type="button" class="text-link" data-action="aviso-entrega">Ver condição de entrega</button></div>`
      : '<p class="small-print">Informe cidade e estado para consultar a entrega.</p>';
    selecionar('#delivery-summary').textContent = completo
      ? local
        ? 'Grátis · Caruaru/PE'
        : 'A combinar'
      : 'Informe o destino';
  }

  /**
   * Os resumos continuam visíveis com as etapas fechadas. Usa textContent porque
   * nome, endereço e preferência são preenchidos pelo cliente, não são HTML.
   * Validar o telefone no campo permite abrir a etapa e focalizar o erro ao enviar.
   */
  function atualizarResumosEtapas(formulario) {
    const campos = formulario.elements;
    const valor = (nome) => campos[nome].value.trim();
    const telefone = LuaKids.utilitarios.somenteDigitos(valor('phone'));
    campos.phone.setCustomValidity(
      telefone && !/^[1-9]\d{9,10}$/.test(telefone)
        ? 'Informe um WhatsApp com DDD e 10 ou 11 dígitos.'
        : '',
    );
    selecionar('#resumo-comprador').textContent = [
      valor('name') || 'Informe seu nome',
      valor('phone') || 'Informe seu WhatsApp',
    ].join(' · ');
    const rua = [valor('street'), valor('number')].filter(Boolean).join(', ');
    const cidade = [valor('city'), valor('uf')].filter(Boolean).join('/');
    const endereco = [rua, cidade].filter(Boolean).join(' · ');
    const completo = ['cep', 'city', 'uf', 'neighborhood', 'street', 'number'].every(
      (nome) => valor(nome) && campos[nome].validity.valid,
    );
    selecionar('#resumo-endereco').textContent = completo
      ? endereco
      : endereco
        ? `${endereco} · Complete o endereço de entrega.`
        : 'Informe o endereço de entrega.';
    selecionar('#resumo-transporte').textContent = [
      valor('preference') || 'Sem transporte de preferência',
      valor('notes') ? 'Com observações' : 'Sem observações',
    ].join(' · ');
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
      next.draftsByCustomer[LuaKids.contas.chavePerfil(next)] = { ...fields };
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
    // O hashchange não deve guardar novamente o formulário de um pedido concluído.
    formulario.dataset.enviado = 'true';
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
    iniciarAvisosEntrega,
    mostrarAvisoEntrega,
  };
})();
