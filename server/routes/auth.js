const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { usersDb } = require('../db');

// REGISTER (Cu Username)
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Verificăm dacă username-ul există deja
    const existingUser = await usersDb.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'Username deja folosit' });

    const hashedPassword = await bcrypt.hash(password, 10);
    // Salvăm doar username și parolă
    const user = await usersDb.insert({ username, password: hashedPassword });

    res.status(201).json({ message: 'Cont creat cu succes' });
  } catch (error) {
    res.status(500).json({ message: 'Eroare server' });
  }
});

// LOGIN (Cu Username)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Căutăm după username
    const user = await usersDb.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Username sau parolă incorectă' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Username sau parolă incorectă' });

    const token = jwt.sign({ id: user._id }, process.env.DB_SECRET, { expiresIn: '24h' });

    res.json({ token, userId: user._id, username: user.username });
  } catch (error) {
    res.status(500).json({ message: 'Eroare server' });
  }
});

module.exports = router;