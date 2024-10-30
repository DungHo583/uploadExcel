// pages/api/get-serials.ts
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {   
    try {
        const filePath = path.join(process.cwd(), 'public', 'serial_data.txt');

        if (!fs.existsSync(filePath)) {
            return new Response("not found", { status: 404 });
        }

        const data = fs.readFileSync(filePath, 'utf8');
        return Response.json({ data })
    } catch (error) {
        console.error('Error reading serial data:', error);
        return new Response("Failed to read serial data", { status: 500 });
    }
}
