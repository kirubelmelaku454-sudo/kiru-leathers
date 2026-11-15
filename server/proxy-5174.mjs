import http from 'http';

const PROXY_TARGET_PORT = 5173;
const PROXY_LISTEN_PORT = 5174;

const server = http.createServer((req, res) => {
  const options = {
    hostname: '127.0.0.1',
    port: PROXY_TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: `127.0.0.1:${PROXY_TARGET_PORT}`
    }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    // Add anti-cache headers to kill any stale service workers
    const headers = { ...proxyRes.headers };
    res.writeHead(proxyRes.statusCode, headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Vite proxy connection error: ' + err.message);
  });

  req.pipe(proxyReq, { end: true });
});

// Forward WebSocket for Vite Hot Module Replacement (HMR)
server.on('upgrade', (req, socket, head) => {
  const proxyReq = http.request({
    hostname: '127.0.0.1',
    port: PROXY_TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: `127.0.0.1:${PROXY_TARGET_PORT}`
    }
  });

  proxyReq.on('upgrade', (proxyRes, proxySocket, proxyHead) => {
    const rawHeaders = Object.entries(proxyRes.headers)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\r\n');
    socket.write(`HTTP/1.1 101 Switching Protocols\r\n${rawHeaders}\r\n\r\n`);
    proxySocket.pipe(socket);
    socket.pipe(proxySocket);
  });

  proxyReq.on('error', () => {
    socket.destroy();
  });

  proxyReq.end();
});

server.listen(PROXY_LISTEN_PORT, '127.0.0.1', () => {
  console.log(`Port ${PROXY_LISTEN_PORT} is successfully mirroring Vite at http://localhost:${PROXY_TARGET_PORT}`);
});
