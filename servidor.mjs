// Servidor opcional de prévia local. Sem dependências e sem backend de pedidos.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// A raiz é a pasta deste arquivo; o servidor só escuta a própria máquina.
const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 5173);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.md': 'text/plain; charset=utf-8',
};
const server = http.createServer(async (request, response) => {
  // A prévia só entrega arquivos. Não recebe pedidos, uploads ou alterações de dados.
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end();
    return;
  }
  try {
    // Normaliza o caminho e bloqueia pastas ocultas e saídas da pasta do projeto.
    const requested = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (
      requested.includes('\0') ||
      requested.split(/[\\/]/).some((part) => part.startsWith('.') && part !== '')
    )
      throw new Error('Forbidden');
    const filename = path.resolve(root, '.' + (requested === '/' ? '/index.html' : requested));
    if (!filename.startsWith(root + path.sep)) throw new Error('Forbidden');
    // Extensões permitidas têm um tipo explícito, evitando interpretação indevida.
    const type = types[path.extname(filename).toLowerCase()];
    if (!type) throw new Error('Forbidden');
    const data = await readFile(filename);
    response.writeHead(200, {
      'Content-Type': type,
      'Content-Length': data.length,
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    response.end(request.method === 'HEAD' ? undefined : data);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Arquivo não encontrado.');
  }
});
server.on('error', (error) => {
  console.error('Não foi possível iniciar a prévia:', error.message);
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () =>
  console.log(
    `Lua Kids: http://127.0.0.1:${port}\nEncerre com Ctrl+C. Esta prévia usa dados locais de demonstração.`,
  ),
);
