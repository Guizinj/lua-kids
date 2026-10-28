/**
 * Configurações compartilhadas. Nenhuma credencial secreta deve ser colocada aqui.
 */
window.LuaKids = {
  configuracao: Object.freeze({
    /**
     * A chave e a versão permanecem iguais para preservar os dados locais existentes.
     */
    CHAVE_ARMAZENAMENTO: 'lua-kids:prototype:v1',
    /**
     * Telefone provisório aprovado para atendimento; não é uma chave de integração.
     */
    WHATSAPP_LOJA: '5581981164812',
    ROTULOS_STATUS: Object.freeze({
      aguardando: 'Aguardando confirmação',
      confirmado: 'Confirmado',
      preparando: 'Em preparação',
      enviado: 'Enviado',
      entregue: 'Entregue',
      cancelado: 'Cancelado',
    }),
  }),
};
