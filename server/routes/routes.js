const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const crypto = require('crypto');

/**
 * Generate a unique token for QR code
 * @returns {string} Unique token
 */
function generateToken() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Validate token format and checksum
 * @param {string} token - Token to validate
 * @returns {boolean} True if valid
 */
function validateToken(token) {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // Check if token is valid hex string of correct length
  if (!/^[a-f0-9]{32}$/.test(token)) {
    return false;
  }
  
  return true;
}

/**
 * POST /api/qrcode/generate
 * Generate a new QR code
 * Request body: {
 *   data: string (optional) - Data to encode, will generate random token if not provided
 * }
 * Response: {
 *   success: boolean,
 *   token: string,
 *   qrcode: string (base64 data URL)
 * }
 */
router.post('/generate', async (req, res) => {
  try {
    const { data } = req.body;
    
    // Use provided data or generate a new token
    const tokenData = data || generateToken();
    
    // Validate data length
    if (tokenData.length > 2953) {
      return res.status(400).json({
        success: false,
        error: 'Data too long for QR code'
      });
    }
    
    // Generate QR code as data URL
    const qrcodeDataUrl = await QRCode.toDataURL(tokenData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 1,
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

/**
 * POST /api/qrcode/validate
 * Validate a QR code token
 * Request body: {
 *   token: string
 * }
 * Response: {
 *   success: boolean,
 *   valid: boolean,
 *   message: string
 * }
 */
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
      error: 'Failed to validate token'
    });
  }
});

/**
 * POST /api/qrcode/batch-generate
 * Generate multiple QR codes
 * Request body: {
 *   count: number (1-100),
 *   includeQrCode: boolean (optional, default: false)
 * }
 * Response: {
 *   success: boolean,
 *   tokens: string[],
 *   qrcodes: string[] (optional, if includeQrCode is true)
 * }
 */
router.post('/batch-generate', async (req, res) => {
  try {
    const { count = 10, includeQrCode = false } = req.body;
    
    // Validate count
    if (!Number.isInteger(count) || count < 1 || count > 100) {
      return res.status(400).json({
        success: false,
        error: 'Count must be between 1 and 100'
      });
    }
    
    const tokens = [];
    const qrcodes = [];
    
    for (let i = 0; i < count; i++) {
      const token = generateToken();
      tokens.push(token);
      
      if (includeQrCode) {
        const qrcodeDataUrl = await QRCode.toDataURL(token, {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          width: 300,
          margin: 1
        });
        qrcodes.push(qrcodeDataUrl);
      }
    }
    
    const response = {
      success: true,
      tokens
    };
    
    if (includeQrCode) {
      response.qrcodes = qrcodes;
    }
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Batch QR Code Generation Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate QR codes'
    });
  }
});

/**
 * GET /api/qrcode/generate/:data
 * Generate QR code from URL parameter
 * Returns PNG image
 */
router.get('/generate/:data', async (req, res) => {
  try {
    const { data } = req.params;
    
    // Decode URL-encoded data
    const decodedData = decodeURIComponent(data);
    
    if (decodedData.length > 2953) {
      return res.status(400).json({
        success: false,
        error: 'Data too long for QR code'
      });
    }
    
    // Generate QR code as PNG buffer
    const qrcodeBuffer = await QRCode.toBuffer(decodedData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 1
    });
    
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(qrcodeBuffer);
  } catch (error) {
    console.error('QR Code Generation Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate QR code'
    });
  }
});

/**
 * POST /api/qrcode/decode-check
 * Check if data can be encoded as QR code
 * Request body: {
 *   data: string
 * }
 * Response: {
 *   success: boolean,
 *   canEncode: boolean,
 *   dataLength: number,
 *   maxLength: number,
 *   message: string
 * }
 */
router.post('/decode-check', (req, res) => {
  try {
    const { data } = req.body;
    
    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'Data is required'
      });
    }
    
    const dataLength = data.length;
    const maxLength = 2953; // Max characters for QR code
    const canEncode = dataLength <= maxLength;
    
    res.status(200).json({
      success: true,
      canEncode,
      dataLength,
      maxLength,
      message: canEncode 
        ? 'Data can be encoded as QR code' 
        : `Data exceeds maximum length (${dataLength}/${maxLength})`
    });
  } catch (error) {
    console.error('Data Check Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check data'
    });
  }
});

module.exports = router;
