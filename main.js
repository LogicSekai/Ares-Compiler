const express = require('express');
const bodyParser = require('body-parser');
const {
    exec
} = require('child_process');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());

app.post('/upload', (req, res) => {
    const inoCode = req.body.inoCode;

    if (!inoCode) {
        return res.status(400).send('Kode .ino harus disediakan.');
    }

    const inoFilePath = 'temp.ino';
    const hexFilePath = `${inoFilePath}.hex`;

    fs.writeFileSync(inoFilePath, inoCode); // Tulis kode .ino ke file temp.ino

    exec(`arduino-cli compile --fqbn arduino:avr:uno ${inoFilePath}`, (error, stdout, stderr) => {
        fs.unlinkSync(inoFilePath); // Hapus file temp.ino setelah selesai

        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).send('Terjadi kesalahan saat mengompilasi.');
        } else if (stderr) {
            console.error(`Error: ${stderr}`);
            return res.status(500).send('Terjadi kesalahan saat mengompilasi.');
        }

        fs.renameSync(`${inoFilePath}.ino.hex`, hexFilePath);
        console.log(`File .ino berhasil dikompilasi menjadi file .hex.`);
        console.log(`File .hex tersimpan di: ${hexFilePath}`);

        return res.json({
            hexFile: hexFilePath
        });
    });
});

app.listen(3000, () => {
    console.log('Server berjalan di http://localhost:3000');
});