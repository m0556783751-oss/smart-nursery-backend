import express from 'express';
import cors from 'cors';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { router } from './routes';
import { setupSwagger } from './utils/swagger';

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

setupSwagger(app);
app.use('/api', router);
app.use(errorHandler);

export { app };
