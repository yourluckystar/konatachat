import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

import { fileURLToPath } from 'url';
import { pool } from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const save_files = async (files) => {
    const files_arr = Object.values(files);
    const file_path = path.join('files');
    const saved_paths = [];

    for (const file of files_arr) {
        let file_name;
        let full_path;

        do {
            const random = crypto.randomBytes(16).toString('hex');
            file_name = `${random}.${file.extension}`;
            full_path = path.join(file_path, file_name);
        } while (fs.existsSync(full_path));

        try {
            await fs.promises.writeFile(full_path, file.data);
            const relative_path = path.relative(__dirname, full_path);
            saved_paths.push(relative_path);
        } catch (err) {
            console.log('error writing file:', err);
        }
    }

    return saved_paths;
}

export const update_database = async (data) => {
    const attachments = data.files && data.files.length > 0;
    console.log(attachments);
    
    const [result] = await pool.promise().query('INSERT INTO messages (sender, content, attachments) VALUES (?, ?, ?)', [data.user, data.content, attachments]);
    const message = result.insertId;

    if (attachments) {
        for (const file_path of data.files) {
            await pool.promise().query('INSERT INTO message_files (message, url) VALUES (?, ?)', [message, file_path]);
        }
    }
};
