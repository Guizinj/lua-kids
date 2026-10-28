/**
 * Regra local da entrega: Caruaru/PE grátis; demais destinos a combinar.
 * Módulo encapsulado: só os métodos listados no final ficam disponíveis em LuaKids.
 * Os scripts tradicionais preservam a abertura direta pelo index.html, sem instalação.
 */
(() => {
  'use strict';
  const LuaKids = window.LuaKids;
  const { normalizarTexto } = LuaKids.utilitarios;

  /**
   * Identifica entrega gratuita somente para cidade Caruaru com UF PE. Para outros destinos
   * retorna taxa desconhecida (null), que significa a combinar, e não frete zero.
   */
  function calcularEntrega(customer) {
    return normalizarTexto(customer.city) === 'caruaru' &&
      String(customer.uf).toUpperCase() === 'PE'
      ? { type: 'local', fee: 0 }
      : { type: 'third-party', fee: null };
  }
  LuaKids.entrega = { calcularEntrega };
})();
