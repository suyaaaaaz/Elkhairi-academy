require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { google } = require('googleapis');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve file HTML/CSS/JS statis dari folder public
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint Registrasi
app.post('/api/register', async (req, res) => {
  try {
    const { name, phone, program } = req.body;

    if (!name || !phone || !program) {
      return res.status(400).json({ success: false, message: 'Data tidak lengkap.' });
    }

    // 1. Simpan ke Google Sheets (Opsional jika credentials.json disiapkan)
    try {
      const auth = new google.auth.GoogleAuth({
        keyFile: path.join(__dirname, 'credentials.json'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      const sheets = google.sheets({ version: 'v4', auth });
      const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
      const sheetName = process.env.GOOGLE_SHEET_NAME || 'Sheet1';
      const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A:D`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values: [[timestamp, name, phone, program]] },
      });
    } catch (sheetErr) {
      console.warn('Peringatan Google Sheets (credentials.json belum ada/valid):', sheetErr.message);
    }

    // 2. Format tautan pesan WhatsApp Admin
    const adminNumber = process.env.ADMIN_WA_NUMBER || '6285602810366';
    const message = `Halo El Khairi Academy, saya ingin mendaftar:%0A` +
                    `• *Nama*: ${encodeURIComponent(name)}%0A` +
                    `• *No. WA*: ${encodeURIComponent(phone)}%0A` +
                    `• *Program*: ${encodeURIComponent(program)}%0A%0A` +
                    `Mohon informasi langkah pendaftaran berikutnya. Terima kasih!`;

    const waUrl = `https://wa.me/${adminNumber}?text=${message}`;

    return res.status(200).json({
      success: true,
      message: 'Pendaftaran berhasil diproses.',
      data: { name, phone, program, waUrl }
    });

  } catch (error) {
    console.error('Error server:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================`);
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  console.log(`=================================`);
});