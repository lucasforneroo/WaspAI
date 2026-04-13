import 'dotenv/config'; // Esto carga el .env ANTES que cualquier otro import
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import chatRouter from './routes/chat.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(morgan('dev'));
app.use(cors({
  origin: '*', // Permitimos todo por ahora para que no te trabes
  methods: ['GET', 'POST'],
}));
app.use(express.json());

// Rutas
app.use('/api/chat', chatRouter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`[WaspAI] Server running on port ${PORT}`);
});
