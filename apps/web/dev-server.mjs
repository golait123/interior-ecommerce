import { createServer } from 'vite';

async function start() {
  const server = await createServer({
    server: {
      port: 5173,
      host: true
    }
  });
  await server.listen();
  server.printUrls();
}

start().catch(err => {
  console.error('Failed to start Vite server:', err);
  process.exit(1);
});
