const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const crypto = require('crypto');

function generateToken() {
  return crypto.randomBytes(16).toString('hex');
}

function validateToken(token) {
  if (!token || typeof token !== 'string') {
    return false;
  }
  if (!/^[a-f0-9]{32}$/. test(token)) {
    return false;
  }
  return true;
}

router.post('/generate', async (req, res) => {
  try {
    const { data } = req.body;
    const tokenData = data || generateToken();
    if (tokenData.length > 2953) {
      return res.status(400).json({
        success: false,
        error: 'Data too long for QR code'
      });
    }
    const qrcodeDataUrl = await QRCode.toDataURL(tokenData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin:  1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    res.status(200).json({
      success: true,
      token: tokenData,
      qrcode: qrcodeDataUrl
    });
  } catch (error) {
    console.error('QR Code Generation Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate QR code'
    });
  }
});

router.post('/validate', (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required'
      });
    }
    const isValid = validateToken(token);
    res.status(200).json({
      success: true,
      valid: isValid,
      message: isValid ? 'Token is valid' : 'Token is invalid'
    });
  } catch (error) {
    console.error('Token Validation Error:', error);
    res.status(500).json({
      success: false,
      error:  'Failed to validate token'
    });
  }
});

module.exports = router;