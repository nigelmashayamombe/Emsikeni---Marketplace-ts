import 'express-async-errors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/env';
import { apiRouter } from './modules/auth/auth.routes';
import { errorMiddleware } from './middlewares/error.middleware';
import { buildSwaggerSpec } from './modules/auth/auth.swagger';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', apiRouter);

const swaggerSpec = buildSwaggerSpec();
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: config.nodeEnv });
});

app.use(errorMiddleware);

export { app };
