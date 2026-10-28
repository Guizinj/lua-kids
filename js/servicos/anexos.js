/**
 * Leitura e persistência local de comprovantes. O limite evita exceder o localStorage.
 * Módulo encapsulado: só os métodos listados no final ficam disponíveis em LuaKids.
 * Os scripts tradicionais preservam a abertura direta pelo index.html, sem instalação.
 */
(() => {
  'use strict';
  const LuaKids = window.LuaKids;
  const { alterarEstado } = LuaKids.armazenamento;

  /**
   * Recebe o identificador e um File escolhido manualmente. Confere formato/tamanho, lê a
   * imagem
   * e só substitui o anexo após uma gravação bem-sucedida. A versão real exigirá validação
   * confiável.
   */
  async function anexarComprovante(id, arquivo) {
    if (!arquivo) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(arquivo.type))
      throw new Error('Use uma imagem JPG, PNG ou WebP.');
    if (arquivo.size > 1024 * 1024)
      throw new Error(
        'Nesta demonstração, a imagem deve ter até 1 MB para caber no armazenamento do navegador.',
      );
    const dados = await new Promise((resolver, rejeitar) => {
      const leitor = new FileReader();
      leitor.onload = () => resolver(leitor.result);
      leitor.onerror = () =>
        rejeitar(new Error('Não foi possível ler o arquivo. Tente novamente.'));
      leitor.readAsDataURL(arquivo);
    });
    alterarEstado((copia) => {
      const pedido = copia.orders.find((item) => item.id === id);
      if (!pedido) throw new Error('Pedido não encontrado.');
      pedido.attachment = { name: arquivo.name, data: dados, uploadedAt: new Date().toISOString() };
    });
  }
  /**
   * Remove somente o comprovante do pedido informado, mantendo histórico e estoque intactos.
   */
  function removerComprovante(id) {
    alterarEstado((copia) => {
      const pedido = copia.orders.find((item) => item.id === id);
      if (!pedido) throw new Error('Pedido não encontrado.');
      pedido.attachment = null;
    });
  }

  LuaKids.anexos = { anexarComprovante, removerComprovante };
})();
