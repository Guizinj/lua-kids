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
  const caminhoLocal = referencia[1].split(/[?#]/, 1)[0];
  assert.ok(fs.existsSync(path.join(raiz, caminhoLocal)), referencia[1]);
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
const contexto = vm.createContext({
  window: {},
  localStorage: armazenamentoFalso,
  document: { querySelector: () => true },
});
for (const arquivo of [
  'configuracao',
  'utilitarios',
  'dados/demonstracao',
  'servicos/armazenamento',
  'servicos/contas',
  'servicos/favoritos',
  'servicos/sacola',
  'servicos/entrega',
  'servicos/pedidos',
]) {
  vm.runInContext(fs.readFileSync(path.join(raiz, 'js', arquivo + '.js'), 'utf8'), contexto);
}
const { armazenamento, sacola, pedidos, entrega } = contexto.window.LuaKids;
armazenamento.carregarEstado();
// A migração adiciona mapas por cliente; todos os campos anteriores permanecem iguais.
for (const campo of Object.keys(legado))
  assert.deepEqual(copiar(armazenamento.obterEstado()[campo]), legado[campo]);
assert.equal(contexto.window.LuaKids.configuracao.CHAVE_ARMAZENAMENTO, chave);
console.log('OK: pedidos, anexo, favoritos, sacola e rascunho da versão anterior preservados.');

const migrado = copiar(armazenamento.obterEstado());
armazenamento.carregarEstado();
assert.deepEqual(copiar(armazenamento.obterEstado()), migrado);
pedidos.selecionarCliente('demo-beatriz');
assert.deepEqual(copiar(armazenamento.obterEstado().favorites), []);
assert.deepEqual(copiar(armazenamento.obterEstado().checkoutDraft), {});
assert.equal(armazenamento.obterEstado().profile.street, undefined);
contexto.window.LuaKids.favoritos.alternarFavorito('conjunto-brisa');
contexto.window.LuaKids.contas.salvarEndereco({
  city: 'Recife',
  uf: 'PE',
  street: 'Rua B',
  number: '2',
  cep: '50000-000',
  neighborhood: 'Centro',
});
pedidos.selecionarCliente('demo-ana');
assert.deepEqual(copiar(armazenamento.obterEstado().favorites), legado.favorites);
assert.equal(armazenamento.obterEstado().profile.street, legado.profile.street);
pedidos.selecionarCliente('demo-beatriz');
assert.deepEqual(copiar(armazenamento.obterEstado().favorites), ['conjunto-brisa']);
assert.equal(armazenamento.obterEstado().profile.city, 'Recife');
assert.deepEqual(copiar(armazenamento.obterEstado().orders), legado.orders);
// Retoma a amostra anterior para os testes de estoque abaixo.
gravacoes.set(chave, JSON.stringify(migrado));
armazenamento.carregarEstado();
console.log(
  'OK: migração idempotente e favoritos, rascunhos e endereços separados por cliente.',
);

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

bloquearGravacao = false;
gravacoes.set(chave, JSON.stringify(migrado));
armazenamento.carregarEstado();
armazenamento.alterarEstado((copia) => {
  copia.cart = { 'vestido-flor-de-lua': 3 };
});
const anterior = copiar(armazenamento.obterEstado().orders);
const novoId = pedidos.criarPedido({ ...legado.profile, saveAddress: false });
const novo = armazenamento.obterEstado().orders.find((pedido) => pedido.id === novoId);
assert.equal(novo.items[0].fabric, 'Tricoline');
assert.equal(novo.items[0].colors[0].name, 'Rosé');
assert.deepEqual(copiar(armazenamento.obterEstado().orders.slice(1)), anterior);
assert.equal(armazenamento.obterEstado().profile.street, legado.profile.street);
const produto = contexto.window.LuaKids.demonstracao.produtos[0];
produto.colors[0].name = 'Cor alterada depois';
assert.equal(novo.items[0].colors[0].name, 'Rosé');
console.log(
  'OK: novos pedidos preservam cores/tecido; endereço salvo e pedidos antigos permanecem intactos.',
);

// Mesmo sem espaço para gravar os mapas novos, os dados antigos recuperados não somem.
gravacoes.set(chave, JSON.stringify(legado));
bloquearGravacao = true;
armazenamento.carregarEstado();
for (const campo of Object.keys(legado))
  assert.deepEqual(copiar(armazenamento.obterEstado()[campo]), legado[campo]);
assert.equal(gravacoes.get(chave), JSON.stringify(legado));
console.log('OK: limite de armazenamento durante migração preserva os registros recuperados.');
