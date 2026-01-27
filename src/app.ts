import 'express-async-errors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/env';
import { apiRouter } from './modules/auth/auth.routes';
import { categoriesRouter } from './modules/categories/categories.routes';
import { productRouter } from './modules/products/products.routes';
import { inventoryRouter } from './modules/inventory/inventory.routes';
import { ordersRouter } from './modules/orders/orders.routes';
import { errorMiddleware } from './middlewares/error.middleware';
import { buildSwaggerSpec } from './swagger';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', apiRouter);
app.use('/api/v1', categoriesRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1', inventoryRouter);
app.use('/api/v1', ordersRouter);


const swaggerSpec = buildSwaggerSpec();
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: config.nodeEnv });
});

app.use(errorMiddleware);

export { app };
