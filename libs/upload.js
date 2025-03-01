import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const save_files = async (files) => {
    const files_arr = Object.values(files);
    const file_path = path.join(__dirname, 'files');
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
            await fs.promises.writeFile(full_path, file.buffer);

            const relative_path = path.relative(__dirname, full_path);
            saved_paths.push(relative_path);
        } catch (err) {
            console.log('error writing file:', err);
        }
    }

    return saved_paths;
}
