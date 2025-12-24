import express, { Request, Response } from 'express';
import { config } from './config/env';
import { app } from './app';

const port = config.port;

const server = app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}`);
});

const shutdown = () => {
  server.close(() => {
    // eslint-disable-next-line no-console
    console.log('Server closed gracefully');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

