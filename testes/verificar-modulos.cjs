/**
 * Verificações locais sem navegador ou pacotes externos.
 * Confere a sintaxe, os arquivos referenciados pelo index, a leitura de um estado
 * salvo na primeira versão e o comportamento de reserva/cancelamento. Não testa
 * políticas de produção ou concorrência entre pessoas: isso dependerá do Supabase.
 * Execute: node testes/verificar-modulos.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const raiz = path.resolve(__dirname, '..');

/**
 * Percorre só a pasta de JavaScript da aplicação, retornando seus arquivos locais.
 */
function listarScripts(pasta) {
  return fs.readdirSync(pasta, { withFileTypes: true }).flatMap((entrada) => {
    const arquivo = path.join(pasta, entrada.name);
    return entrada.isDirectory()
      ? listarScripts(arquivo)
      : arquivo.endsWith('.js')
        ? [arquivo]
        : [];
  });
}

/**
 * Normaliza objetos de contextos VM para comparação, sem depender de protótipos
 * compartilhados.
 */
function copiar(valor) {
  return JSON.parse(JSON.stringify(valor));
}

const scripts = listarScripts(path.join(raiz, 'js'));
for (const arquivo of scripts) {
  new vm.Script(fs.readFileSync(arquivo, 'utf8'), { filename: arquivo });
}
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
for (const referencia of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  if (/^https?:/.test(referencia[1])) continue;
  assert.ok(fs.existsSync(path.join(raiz, referencia[1])), referencia[1]);
}
console.log(`OK: sintaxe dos ${scripts.length} módulos e recursos referenciados pelo index.`);

const legado = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'dados/estado-anterior.json'), 'utf8'),
);
const chave = 'lua-kids:prototype:v1';
const gravacoes = new Map([[chave, JSON.stringify(legado)]]);
let bloquearGravacao = false;

// Esta memória substitui o navegador apenas para testar o contrato do armazenamento.
const armazenamentoFalso = {
  getItem: (nome) => gravacoes.get(nome) ?? null,
  setItem: (nome, valor) => {
    if (bloquearGravacao) throw new Error('Limite de armazenamento simulado');
    gravacoes.set(nome, valor);
  },
};
const contexto = vm.createContext({ window: {}, localStorage: armazenamentoFalso });
for (const arquivo of [
  'configuracao',
  'utilitarios',
  'dados/demonstracao',
  'servicos/armazenamento',
  'servicos/sacola',
  'servicos/entrega',
  'servicos/pedidos',
]) {
  vm.runInContext(fs.readFileSync(path.join(raiz, 'js', arquivo + '.js'), 'utf8'), contexto);
}
const { armazenamento, sacola, pedidos, entrega } = contexto.window.LuaKids;
armazenamento.carregarEstado();
assert.deepEqual(copiar(armazenamento.obterEstado()), legado);
assert.equal(contexto.window.LuaKids.configuracao.CHAVE_ARMAZENAMENTO, chave);
console.log('OK: pedidos, anexo, favoritos, sacola e rascunho da versão anterior preservados.');

assert.deepEqual(copiar(sacola.calcularTotaisSacola()), { total: 15960, pieces: 4, grades: 1 });
assert.deepEqual(copiar(entrega.calcularEntrega({ city: ' Caruaru ', uf: 'PE' })), {
  type: 'local',
  fee: 0,
});
assert.equal(entrega.calcularEntrega({ city: 'Caruaru', uf: 'SP' }).fee, null);
assert.equal(entrega.calcularEntrega({ city: 'Recife', uf: 'PE' }).fee, null);
console.log('OK: totais por grade e regras de entrega preservados.');

const inicial = copiar(armazenamento.obterEstado());
pedidos.alterarStatusPedido('LK-DEMO-1003', 'confirmado');
assert.equal(
  armazenamento.obterEstado().stock['vestido-flor-de-lua'],
  inicial.stock['vestido-flor-de-lua'] - 2,
);
assert.throws(() => pedidos.alterarStatusPedido('LK-DEMO-1003', 'confirmado'));
pedidos.alterarStatusPedido('LK-DEMO-1003', 'cancelado');
assert.deepEqual(copiar(armazenamento.obterEstado().stock), inicial.stock);
assert.throws(() => pedidos.alterarStatusPedido('LK-DEMO-1003', 'cancelado'));
assert.deepEqual(copiar(armazenamento.obterEstado().stock), inicial.stock);
console.log('OK: confirmação e cancelamento movimentam a reserva uma única vez.');

// A segunda composição fica indisponível: a primeira não pode ser reservada parcialmente.
armazenamento.alterarEstado((copia) => {
  const pedido = copia.orders.find((item) => item.id === 'LK-DEMO-1003');
  pedido.status = 'aguardando';
  pedido.reserved = false;
  copia.stock['macacao-primeiros-passos'] = 0;
});
const antesDaFalha = copiar(armazenamento.obterEstado());
assert.throws(
  () => pedidos.alterarStatusPedido('LK-DEMO-1003', 'confirmado'),
  /Estoque insuficiente/,
);
assert.deepEqual(copiar(armazenamento.obterEstado()), antesDaFalha);

// Falha na gravação também deve manter intactos tanto o estado quanto os dados já salvos.
const gravadoAntes = gravacoes.get(chave);
bloquearGravacao = true;
assert.throws(
  () =>
    armazenamento.alterarEstado((copia) => {
      copia.cart = {};
    }),
  /salvar/,
);
assert.deepEqual(copiar(armazenamento.obterEstado()), antesDaFalha);
assert.equal(gravacoes.get(chave), gravadoAntes);
console.log('OK: erro de estoque ou de gravação descarta a alteração incompleta.');
