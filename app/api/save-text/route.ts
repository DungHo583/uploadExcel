// pages/api/save-text.ts
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    let body = await request.json();

    try {
        const fileName = 'serial_data.txt';
        const filePath = path.join(process.cwd(), 'public', fileName);

        const fileExists = fs.existsSync(filePath);

        if (fileExists) {
            const prefix = fileExists ? '\n' : '';
            fs.appendFileSync(filePath, prefix + body.text, 'utf8');

            return Response.json({ fileName, data: "oke" });
        }

        // Save the text data to a file in the public directory
        fs.writeFileSync(filePath, body.text, 'utf8');

        return Response.json({ fileName, data: "oke" });
    } catch (error) {
        console.error('File saving error:', error);
        return new Response("Failed to save the file", { status: 500 });
    }
}
