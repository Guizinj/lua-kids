/** Endereço único do perfil demonstrativo. Não é uma página de autenticação. */
(() => {
  'use strict';
  const { obterEstado } = window.LuaKids.armazenamento;
  const { montarCaminho, montarCampo } = window.LuaKids.componentes;
  const { chavePerfil, UFS } = window.LuaKids.contas;

  /** Usa a conta salva, sem inferir o endereço a partir de pedidos anteriores. */
  function montarEnderecoConta() {
    const estado = obterEstado();
    const endereco = estado.addressesByCustomer[chavePerfil()] || {};
    return `<div class="container bottom-space"><div class="page-heading">${montarCaminho([['Meus pedidos', '#/pedidos'], ['Meu endereço']])}<h1>Meu endereço</h1><p>Salve seu endereço para preencher os próximos pedidos. Nesta prévia, ele fica somente neste navegador.</p></div><form id="formulario-endereco" class="panel-card formulario-endereco"><p class="notice">Perfil de demonstração: ${window.LuaKids.utilitarios.escaparHTML(estado.profile.name || 'Visitante')}. Use dados fictícios.</p><div class="form-grid">${[
      ['cep', 'CEP', 'inputmode="numeric" maxlength="9" pattern="[0-9]{5}-?[0-9]{3}"'],
      ['city', 'Cidade', 'maxlength="100"'],
    ]
      .map(([nome, rotulo, attrs]) =>
        montarCampo(nome, rotulo, { value: endereco[nome], attrs }),
      )
      .join(
        '',
      )}<label class="field"><span>Estado</span><select name="uf" required><option value="">Selecione</option>${UFS.map((uf) => `<option ${endereco.uf === uf ? 'selected' : ''}>${uf}</option>`).join('')}</select></label>${[
      ['neighborhood', 'Bairro'],
      ['street', 'Rua / avenida'],
      ['number', 'Número'],
      ['complement', 'Complemento'],
    ]
      .map(([nome, rotulo]) =>
        montarCampo(nome, rotulo, {
          value: endereco[nome],
          optional: nome === 'complement',
          full: nome === 'street',
          attrs: `maxlength="${nome === 'number' ? 20 : 160}"`,
        }),
      )
      .join(
        '',
      )}</div><div class="acoes-endereco"><button class="button" type="submit">Salvar endereço</button><a class="button secondary" href="#/pedidos">Voltar para meus pedidos</a></div><p class="small-print">Alterações aqui serão usadas nas próximas compras. Endereços de pedidos anteriores permanecem como foram registrados.</p></form></div>`;
  }
  window.LuaKids.enderecoConta = { montarEnderecoConta };
})();
