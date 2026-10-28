/**
 * Regressão funcional da demonstração, com Node.js e um navegador Chromium instalado.
 * Usa perfis temporários e dados fictícios; não acessa Supabase ou envia mensagens.
 * Execute da raiz: node testes/verificar-navegacao.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawn } = require('node:child_process');
/**
 * Pausa curta entre eventos, permitindo concluir navegação e gravações agendadas.
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// Localiza a aplicação a partir deste arquivo, mesmo ao executar o comando em outra pasta.
const root = path.resolve(__dirname, '..');
const KEY = 'lua-kids:prototype:v1';
let browser, server, socket, cdp;
const errors = [],
  badResponses = [];

(async () => {
  server = spawn(process.execPath, ['servidor.mjs'], {
    cwd: root,
    env: { ...process.env, PORT: '5188' },
    windowsHide: true,
    stdio: 'ignore',
  });
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch('http://127.0.0.1:5188')).status === 200) break;
    } catch {}
    await delay(100);
  }
  if ((await fetch('http://127.0.0.1:5188/.git/config')).status !== 404)
    throw new Error('Private file exposure');
  console.log('OK: servidor HTTP e bloqueio de arquivos internos');
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'lua-kids-prototype-'));
  // O navegador pertence ao teste, usa perfil isolado e fica oculto (headless).
  const executaveis = [
    process.env.NAVEGADOR_EXECUTAVEL,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ];
  const executavel = executaveis.find((arquivo) => arquivo && fs.existsSync(arquivo));
  if (!executavel)
    throw new Error('Informe NAVEGADOR_EXECUTAVEL com o caminho de um Chrome ou Edge instalado.');
  browser = spawn(
    executavel,
    [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--remote-debugging-port=9243',
      '--user-data-dir=' + profile,
      'about:blank',
    ],
    { windowsHide: true, stdio: 'ignore' },
  );
  let tabs;
  for (let i = 0; i < 80; i++) {
    try {
      tabs = await (await fetch('http://127.0.0.1:9243/json/list')).json();
      if (tabs.some((tab) => tab.type === 'page')) break;
    } catch {}
    await delay(100);
  }
  if (!tabs) throw new Error('Navegador indisponível');
  socket = new WebSocket(tabs.find((tab) => tab.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.onopen = resolve;
    socket.onerror = reject;
  });
  let sequence = 0;
  const pending = new Map();
  cdp = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++sequence;
      const timeout = setTimeout(() => {
        pending.delete(id);
        reject(new Error('CDP timeout: ' + method));
      }, 20000);
      pending.set(id, { resolve, reject, timeout });
      socket.send(JSON.stringify({ id, method, params }));
    });
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const item = pending.get(message.id);
      clearTimeout(item.timeout);
      pending.delete(message.id);
      message.error
        ? item.reject(new Error(JSON.stringify(message.error)))
        : item.resolve(message.result);
    }
    if (message.method === 'Page.javascriptDialogOpening')
      cdp('Page.handleJavaScriptDialog', { accept: true });
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails);
    if (message.method === 'Network.responseReceived' && message.params.response.status >= 400)
      badResponses.push(message.params.response.url);
  };
  /**
   * Executa uma expressão na página e transforma exceções do navegador em falhas do teste.
   */
  const evaluate = async (expression) => {
    const result = await cdp('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  /**
   * Cada condição deve ser verdadeira; a primeira falha encerra o teste com código diferente
   * de zero.
   */
  const check = async (expression, message) => {
    if (!(await evaluate(expression))) throw new Error(message);
    console.log('OK: ' + message);
  };
  const state = () => evaluate(`JSON.parse(localStorage.getItem('${KEY}'))`);
  const ready = async () => {
    for (let i = 0; i < 80; i++) {
      if (
        await evaluate(
          '!!document.querySelector(".hero") || !!document.querySelector(".page-heading")',
        )
      )
        return;
      await delay(100);
    }
    throw new Error('Página não carregou');
  };
  /**
   * Navega usando as mesmas rotas públicas acionadas pelos links da interface.
   */
  const route = async (value) => {
    await evaluate(`location.hash=${JSON.stringify('#/' + value)}`);
    await delay(120);
  };
  const click = async (selector) => {
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
    await delay(100);
  };
  const set = async (selector, value, event = 'change') => {
    await evaluate(
      `(()=>{const field=document.querySelector(${JSON.stringify(selector)});field.value=${JSON.stringify(value)};field.dispatchEvent(new Event(${JSON.stringify(event)},{bubbles:true}));})()`,
    );
    await delay(70);
  };
  /**
   * Guarda uma captura temporária para inspeção visual; não altera imagens do projeto.
   */
  const screenshot = async (name) => {
    await evaluate('window.scrollTo(0,0)');
    await delay(100);
    const result = await cdp('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
    });
    fs.writeFileSync(path.join(os.tmpdir(), name), Buffer.from(result.data, 'base64'));
  };
  /**
   * Simula a escolha manual de um arquivo no seletor de comprovantes.
   */
  const upload = async (filename) => {
    const doc = await cdp('DOM.getDocument');
    const node = await cdp('DOM.querySelector', {
      nodeId: doc.root.nodeId,
      selector: '#dispatch-file',
    });
    await cdp('DOM.setFileInputFiles', { nodeId: node.nodeId, files: [filename] });
    await delay(300);
  };
  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('Network.enable');
  await cdp('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1024,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await cdp('Page.navigate', { url: 'http://127.0.0.1:5188/' });
  await ready();
  await delay(400);
  await check(
    'document.querySelectorAll(".product-card").length===6',
    'home com seis modelos e imagens locais',
  );
  await check(
    'document.documentElement.scrollWidth<=innerWidth',
    'home desktop sem transbordamento',
  );
  await screenshot('lua-kids-home-desktop.png');

  // Catálogo: combinação de filtros, estados vazios, ordenação e busca global.
  await route('catalogo');
  await set('[data-filter="categoria"]', 'Vestidos');
  await check(
    'document.querySelectorAll("#catalog-grid .product-card").length===2',
    'filtro de categoria',
  );
  await click('[data-filter="premium"]');
  await check(
    'document.querySelectorAll("#catalog-grid .product-card").length===1',
    'filtros combinados com premium',
  );
  await set('#catalog-search', 'não existe', 'input');
  await check(
    'document.querySelectorAll("#catalog-grid .product-card").length===0 && !!document.querySelector("#catalog-grid .empty-state")',
    'busca sem resultados apresenta alternativa',
  );
  await click('[data-action="clear-filters"]');
  await set('[data-filter="tecido"]', 'Musseline');
  await check(
    'document.querySelectorAll("#catalog-grid .product-card").length===2',
    'filtro por tecido',
  );
  await set('[data-filter="pecas"]', '3');
  await check(
    'document.querySelectorAll("#catalog-grid .product-card").length===1',
    'filtro por quantidade de peças',
  );
  await click('[data-action="clear-filters"]');
  await set('[data-filter="preco"]', 'mais200');
  await check(
    'document.querySelectorAll("#catalog-grid .product-card").length===1',
    'filtro por valor da grade',
  );
  await click('[data-action="clear-filters"]');
  await set('[data-filter="ordem"]', 'maior');
  await check(
    'document.querySelector("#catalog-grid .product-title").textContent.includes("Essência")',
    'ordenação por maior preço',
  );
  await set('#search', 'Musseline', 'input');
  await evaluate('document.getElementById("header-search").requestSubmit()');
  await delay(150);
  await check(
    'document.querySelectorAll("#catalog-grid .product-card").length===2',
    'busca global do cabeçalho',
  );
  // Sacola: grades inteiras, mínimo de dez peças e persistência após recarregar.
  await route('produto/vestido-flor-de-lua');
  await check(
    'document.querySelectorAll(".size-box").length===4 && document.querySelector(".detail-copy").textContent.includes("grade completa")',
    'detalhe com composição e preço por grade',
  );
  await click('[data-action="add-detail"]');
  await click('[data-action="cart-open"]');
  await check(
    'document.querySelector("[data-action=checkout]").disabled',
    'quatro peças não liberam fechamento',
  );
  await click('[data-action="cart-quantity"][data-step="1"]');
  await check(
    'document.querySelector("[data-action=checkout]").disabled',
    'oito peças ainda não liberam fechamento',
  );
  await click('[data-action="cart-close"]');
  await route('');
  await click('[data-action="add"][data-id="macacao-primeiros-passos"]');
  await click('[data-action="favorite"][data-id="vestido-flor-de-lua"]');
  await cdp('Page.reload');
  await delay(300);
  await ready();
  await check(
    `(()=>{const s=JSON.parse(localStorage.getItem('${KEY}'));return s.cart['vestido-flor-de-lua']===2 && s.cart['macacao-primeiros-passos']===1 && s.favorites.includes('vestido-flor-de-lua')})()`,
    'sacola e favoritos persistem ao recarregar',
  );
  await click('[data-action="cart-open"]');
  await check(
    '!document.querySelector("[data-action=checkout]").disabled && document.querySelector(".dialog-heading p").textContent.includes("11 peças")',
    'onze peças em grades completas liberam fechamento',
  );
  await screenshot('lua-kids-sacola-desktop.png');
  await click('[data-action="checkout"]');
  // Fechamento: entrega por cidade/UF, validação do contato e recuperação do rascunho.
  await set('[name=city]', 'Caruaru');
  await set('[name=uf]', 'PE');
  await check(
    'document.getElementById("delivery-summary").textContent.includes("Grátis")',
    'Caruaru/PE tem entrega grátis',
  );
  await set('[name=uf]', 'SP');
  await check(
    'document.getElementById("delivery-summary").textContent==="A combinar"',
    'Caruaru com UF diferente não recebe frete grátis',
  );
  await set('[name=city]', 'Recife');
  await set('[name=uf]', 'PE');
  await check(
    'document.getElementById("delivery-summary").textContent==="A combinar"',
    'outro destino tem frete a combinar',
  );
  await set('[name=phone]', '123');
  await evaluate('document.getElementById("checkout-form").requestSubmit()');
  await delay(100);
  await check(
    'document.getElementById("toast").textContent.includes("DDD")',
    'WhatsApp inválido impede criar pedido',
  );
  for (const [key, value] of Object.entries({
    name: 'Cliente <Teste> & Cia',
    phone: '(81) 99999-8888',
    cep: '55000-000',
    city: 'Caruaru',
    uf: 'PE',
    street: 'Rua de Teste',
    number: '88',
    neighborhood: 'Centro',
    preference: '',
    notes: 'Somente demonstração',
  }))
    await set(`[name=${key}]`, value);
  await delay(300);
  await cdp('Page.reload');
  await delay(250);
  await ready();
  await check(
    'document.querySelector("[name=name]").value==="Cliente <Teste> & Cia"',
    'rascunho de fechamento recuperado',
  );
  const before = await state();
  await evaluate('document.getElementById("checkout-form").requestSubmit()');
  await delay(200);
  const created = (await state()).orders[0];
  if (created.pieces !== 11 || created.total !== 42390 || created.status !== 'aguardando')
    throw new Error('Pedido inválido');
  if ((await state()).stock['vestido-flor-de-lua'] !== before.stock['vestido-flor-de-lua'])
    throw new Error('Reserva antecipada');
  console.log('OK: pedido, subtotal, mínimo e ausência de reserva antecipada');
  await check(
    '!document.querySelector("img[src=x]") && document.querySelector(".order-heading").textContent.includes("Cliente <Teste> & Cia")',
    'dados do cliente renderizados como texto, sem HTML injetado',
  );
  // Painel: confirmação/reserva, anexos, status, cancelamento e estoque insuficiente.
  await route('painel/pedido/' + created.id);
  await click('[data-action=status][data-status=confirmado]');
  if ((await state()).stock['vestido-flor-de-lua'] !== before.stock['vestido-flor-de-lua'] - 2)
    throw new Error('Reserva não executada');
  console.log('OK: confirmação reserva exatamente as grades compradas');
  await check(
    '!document.querySelector("[data-status=confirmado]") && !!document.querySelector("[data-status=preparando]")',
    'pedido não pode ser confirmado duas vezes',
  );
  await upload(path.join(root, 'recursos/imagens/vestido.png'));
  await check(
    'document.getElementById("toast").textContent.includes("até 1 MB")',
    'anexo grande é rejeitado sem alterar pedido',
  );
  await upload(path.join(root, 'estilos/base.css'));
  await check(
    'document.getElementById("toast").textContent.includes("JPG")',
    'tipo de anexo inválido é rejeitado',
  );
  await upload(path.join(root, 'recursos/imagens/logo-original.jpg'));
  await check(
    '!!document.querySelector(".attachment-preview")',
    'imagem de comprovante anexada ao pedido',
  );
  await click('[data-action=status][data-status=preparando]');
  await click('[data-action=status][data-status=enviado]');
  await route('pedido/' + created.id);
  await check(
    '!!document.querySelector(".attachment-preview") && document.querySelector(".order-heading .status").textContent==="Enviado"',
    'cliente acompanha status e comprovante do despacho',
  );
  await click('[data-action=message]');
  await check(
    'document.getElementById("message-text").value.includes("DEMONSTRAÇÃO") && document.querySelector("#message-dialog a").href.includes("5581981164812")',
    'WhatsApp exige abertura manual e identifica demonstração',
  );
  await click('[data-action=message-close]');
  await route('painel/pedido/LK-DEMO-1003');
  const previous = (await state()).stock['vestido-flor-de-lua'];
  await click('[data-action=status][data-status=confirmado]');
  await click('[data-action=status][data-status=cancelado]');
  if ((await state()).stock['vestido-flor-de-lua'] !== previous)
    throw new Error('Cancelamento não devolveu reserva');
  console.log('OK: cancelamento devolve reserva ao estoque uma única vez');
  await check(
    '!document.querySelector("[data-action=status]")',
    'pedido cancelado não permite repetir movimentações',
  );
  await route('painel/pedido/LK-DEMO-1002');
  await evaluate(
    `(()=>{const s=JSON.parse(localStorage.getItem('${KEY}'));s.stock['vestido-flor-de-lua']=0;s.orders.find(o=>o.id==='LK-DEMO-1003').status='aguardando';s.orders.find(o=>o.id==='LK-DEMO-1003').reserved=false;localStorage.setItem('${KEY}',JSON.stringify(s))})()`,
  );
  await cdp('Page.reload');
  await delay(250);
  await ready();
  await route('painel/pedido/LK-DEMO-1003');
  const insufficientBefore = await state();
  await click('[data-action=status][data-status=confirmado]');
  const insufficientAfter = await state();
  if (
    JSON.stringify(insufficientBefore.stock) !== JSON.stringify(insufficientAfter.stock) ||
    insufficientAfter.orders.find((o) => o.id === 'LK-DEMO-1003').status !== 'aguardando'
  )
    throw new Error('Reserva parcial ou negativa');
  await check(
    'document.getElementById("toast").textContent.includes("Estoque insuficiente")',
    'estoque insuficiente bloqueia confirmação sem reserva parcial',
  );
  await route('painel');
  await screenshot('lua-kids-painel-desktop.png');
  await set('#admin-search', 'Beatriz', 'input');
  await check(
    'document.querySelectorAll(".orders-table tbody tr").length===1',
    'busca no histórico administrativo',
  );
  await set('#admin-search', '', 'input');
  await set('#admin-status', 'cancelado');
  await check(
    '!!document.querySelector("#admin-table .empty-state")',
    'estado vazio no filtro de pedidos',
  );

  // Layout: confere larguras pequenas e intermediárias nas páginas principais.
  for (const width of [320, 390, 768]) {
    await cdp('Emulation.setDeviceMetricsOverride', {
      width,
      height: 844,
      deviceScaleFactor: 1,
      mobile: width < 760,
    });
    for (const page of [
      '',
      'catalogo',
      'produto/vestido-flor-de-lua',
      'pedidos',
      'painel',
      'painel/pedido/' + created.id,
    ]) {
      await route(page);
      await check(
        'document.documentElement.scrollWidth<=innerWidth',
        `layout ${width}px sem transbordamento: ${page || 'início'}`,
      );
    }
    if (width === 390) {
      await route('');
      await screenshot('lua-kids-home-mobile.png');
      await route('catalogo');
      await screenshot('lua-kids-catalogo-mobile.png');
    }
  }
  await route('');
  await click('[data-action=reset]');
  await check(
    `(()=>{const s=JSON.parse(localStorage.getItem('${KEY}'));return s.orders.length===3 && Object.keys(s.cart).length===0 && s.favorites.length===0})()`,
    'reiniciar restaura somente os dados da demonstração',
  );
  const blocker = await cdp('Page.addScriptToEvaluateOnNewDocument', {
    source: `Object.defineProperty(window,'localStorage',{configurable:true,get(){throw new Error('blocked')}})`,
  });
  await cdp('Page.reload');
  await delay(250);
  await ready();
  await check(
    '!!document.querySelector(".storage-warning") && document.querySelectorAll(".product-card").length===6',
    'armazenamento bloqueado mantém navegação e mostra aviso',
  );
  await cdp('Page.removeScriptToEvaluateOnNewDocument', { identifier: blocker.identifier });
  await cdp('Page.navigate', {
    url: require('node:url').pathToFileURL(path.join(root, 'index.html')).href,
  });
  await delay(300);
  await ready();
  await check(
    'document.querySelectorAll(".product-card").length===6',
    'abertura direta por arquivo funciona',
  );
  if (errors.length) throw new Error('Erros de runtime: ' + JSON.stringify(errors));
  if (badResponses.length) throw new Error('Recursos faltando: ' + JSON.stringify(badResponses));
  console.log('OK: sem erros de JavaScript ou recursos ausentes');
  console.log('Screenshots: ' + os.tmpdir());
  await cdp('Browser.close');
  socket.close();
  server.kill();
  process.exit(0);
})().catch(async (error) => {
  console.error(error);
  if (errors.length) console.error(JSON.stringify(errors));
  if (cdp)
    try {
      await cdp('Browser.close');
    } catch {}
  socket?.close();
  server?.kill();
  browser?.kill();
  process.exit(1);
});
