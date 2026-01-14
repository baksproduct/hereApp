const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { usersDb } = require('./db');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts'); // <-- Importăm rutele de postări

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Mărim limita de date primite, deoarece imaginile sunt mari (Base64)
app.use(express.json({ limit: '10mb' })); 
app.use(cors());

// Rute API
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes); // <-- Activăm rutele de postări

// Ruta Test
app.get('/', async (req, res) => {
  try {
    const count = await usersDb.count({});
    res.send(`Server funcțional. Utilizatori: ${count}`);
  } catch (error) {
    res.status(500).send('Eroare la baza de date');
  }
});

app.listen(PORT, () => {
  console.log(`Serverul rulează pe portul ${PORT}`);
});