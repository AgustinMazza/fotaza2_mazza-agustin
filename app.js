import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import publicacionesRouter from './routes/publicaciones.js';
import authRouter from './routes/auth.js';
import { connectDatabase } from './models/index.js';

const app = express();
connectDatabase();

const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.static('public'));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json({ limit: '50mb' }));

// Sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'fotaza-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 horas
}));

app.use((req, res, next) => {
  res.locals.usuarioSesion = req.session.usuario || null;
  next();
});

// Motor de plantillas
app.set('view engine', 'pug');
app.set('views', './views');

// Bootstrap
app.use('/dist', express.static('node_modules/bootstrap/dist'));

// Rutas
app.use('/auth', authRouter);
app.use('/publicaciones', publicacionesRouter);

app.get('/', (req, res) => {
  res.render('index', { titulo: 'Fotaza 2 - Inicio' });
});

app.get('/fotos', (req, res) => {
  res.render('fotos');
});

// Servidor
app.listen(PORT, (err) => {
  if (err) {
    console.error('Error al iniciar servidor: ', err);
    return;
  }
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
