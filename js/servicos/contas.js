/**
 * Perfis fictícios, favoritos, endereço e rascunho separados por cliente.
 * Isto organiza a demonstração: não autentica ninguém nem concede permissões reais.
 * favorites e checkoutDraft continuam como projeções do perfil ativo, permitindo
 * ler dados antigos enquanto os mapas por cliente guardam as listas independentes.
 */
(() => {
  'use strict';
  const { obterEstado, alterarEstado } = window.LuaKids.armazenamento;
  const CAMPOS_ENDERECO = [
    'cep',
    'city',
    'uf',
    'street',
    'number',
    'neighborhood',
    'complement',
  ];
  const UFS =
    'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(
      ' ',
    );

  /** Identifica o proprietário local. Visitantes não compartilham a lista de um cliente. */
  const chavePerfil = (estado = obterEstado()) => estado.profile.id || 'visitante';

  /** Copia apenas os campos de endereço previstos, sem incluir observações de outro pedido. */
  function extrairEndereco(valores) {
    return Object.fromEntries(
      CAMPOS_ENDERECO.map((campo) => [campo, String(valores[campo] || '').trim()]),
    );
  }

  /**
   * Recompõe as projeções após trocar de cliente. O endereço vem da conta, nunca do
   * pedido histórico; editar a conta não reescreve compras anteriores.
   */
  function projetarPerfil(estado, cliente) {
    const chave = cliente.id || 'visitante';
    estado.profile = {
      id: cliente.id || '',
      name: cliente.name || '',
      phone: cliente.phone || '',
      ...estado.addressesByCustomer[chave],
    };
    estado.favorites = [...(estado.favoritesByCustomer[chave] || [])];
    estado.checkoutDraft = { ...(estado.draftsByCustomer[chave] || {}) };
  }

  /** Salva um endereço único da conta ativa, mantendo intactos os pedidos já criados. */
  function salvarEndereco(valores) {
    alterarEstado((estado) => {
      const chave = chavePerfil(estado);
      const endereco = extrairEndereco(valores);
      estado.addressesByCustomer[chave] = endereco;
      // Um rascunho anterior não deve ocultar o endereço que acabou de ser editado.
      if (estado.draftsByCustomer[chave])
        Object.assign(estado.draftsByCustomer[chave], endereco);
      projetarPerfil(estado, estado.profile);
    });
  }

  window.LuaKids.contas = { chavePerfil, extrairEndereco, projetarPerfil, salvarEndereco, UFS };
})();
