const express = require('express');
const router = express.Router();
const path = require('path');

const QRCode = require('qrcode');
const Token = require('../models/token');

router.post('/api/qrcode', async (req, res) => {
  try {
    const token = req.body.token;

    if (!token) return res.status(400).json({ error: 'Token is required' });

    if (!/^[a-f0-9]{32}$/.test(token)) {
      return res.status(400).json({ error: 'Invalid token format' });
    }

    const tokenData = await Token.findOne({ token: token });

    if (!tokenData) {
      return res.status(404).json({ error: 'Token not found' });
    }

    const qrCodeDataUrl = await QRCode.toDataURL(token);

    res.json({ qrCode: qrCodeDataUrl });
  } catch (error) {
    console.error('QR Code generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
