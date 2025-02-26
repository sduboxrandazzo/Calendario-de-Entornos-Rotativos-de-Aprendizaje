const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer  = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const secretKey = 'tu_clave_secreta';

// --- Endpoint de Login ---
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'test@example.com' && password === 'password') {
    const token = jwt.sign({ email }, secretKey, { expiresIn: '1h' });
    return res.json({ token });
  }
  res.status(401).json({ error: 'Credenciales inválidas' });
});


// --- Middleware de Autenticación ---
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// --- Endpoint Protegido ---
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({
    message: 'Accediste a la ruta protegida',
    user: req.user
  });
});

// --- Ruta de Prueba ---
app.get('/', (req, res) => {
  res.send('Servidor backend funcionando');
});

// ----------------- Gestión de Reservas -----------------
let reservations = [];
let nextReservationId = 1;

// Endpoint para crear una reserva (POST)
app.post('/api/reservations', authenticateToken, (req, res) => {
  // Agregamos day, time y entorno
  const { day, time, course, entorno } = req.body;
  // El docente lo tomamos del token
  const docente = req.user.email;

  // Validación básica de datos requeridos
  if (!day || !time || !course || !entorno) {
    return res.status(400).json({ error: 'Faltan datos requeridos: day, time, course, entorno.' });
  }

  // Crear la reserva
  const reservation = {
    id: nextReservationId++,
    docente,
    day,      // LUNES, MARTES, ...
    time,     // 8:15 a 8:55
    course,   // 1er año, etc.
    entorno,  // Robótica, Colaboratorio, etc.
    createdAt: new Date()
  };

  reservations.push(reservation);
  res.status(201).json({ message: 'Reserva creada exitosamente', reservation });
});


app.get('/api/reservations', authenticateToken, (req, res) => {
  const docente = req.user.email;
  const userReservations = reservations.filter(r => r.docente === docente);
  res.json(userReservations);
});

app.put('/api/reservations/:id', authenticateToken, (req, res) => {
  const docente = req.user.email;
  const reservationId = parseInt(req.params.id);
  const { entorno, materia, curso } = req.body;
  const reservation = reservations.find(r => r.id === reservationId && r.docente === docente);
  if (!reservation) {
    return res.status(404).json({ error: 'Reserva no encontrada o no autorizada' });
  }
  if (entorno) reservation.entorno = entorno;
  if (materia) reservation.materia = materia;
  if (curso) reservation.curso = curso;
  res.json({ message: 'Reserva actualizada', reservation });
});

app.delete('/api/reservations/:id', authenticateToken, (req, res) => {
  const docente = req.user.email;
  const reservationId = parseInt(req.params.id);
  const index = reservations.findIndex(r => r.id === reservationId && r.docente === docente);
  if (index === -1) {
    return res.status(404).json({ error: 'Reserva no encontrada o no autorizada' });
  }
  reservations.splice(index, 1);
  res.json({ message: 'Reserva eliminada' });
});

// ----------------- Importación del Horario -----------------
const upload = multer({ dest: 'uploads/' });
let scheduleData = [];

app.post('/api/schedule/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se ha subido ningún archivo' });
  }
  
  // Vaciar el array previo
  scheduleData = [];
  
  fs.createReadStream(req.file.path)
    .pipe(csvParser())
    .on('data', (row) => {
      // Verificar que la fila tenga un valor válido en "dia"
      if (row.dia && row.dia.trim() !== "") {
        scheduleData.push(row);
      } else {
        console.warn("Fila ignorada (sin 'dia'): ", row);
      }
    })
    .on('end', () => {
      // Borrar el archivo subido para liberar espacio
      fs.unlinkSync(req.file.path);
      res.json({ message: 'Horario importado exitosamente', data: scheduleData });
    })
    .on('error', (err) => {
      console.error("Error al procesar el archivo:", err);
      res.status(500).json({ error: 'Error al procesar el archivo', details: err });
    });
});


app.get('/api/schedule', (req, res) => {
  res.json(scheduleData);
});

// --- Iniciar el Servidor ---
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
