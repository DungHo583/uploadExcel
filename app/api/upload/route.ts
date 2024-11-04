import conn from "@/lib/db"
import cuid from 'cuid';

export async function POST(request: Request) {
    let body = await request.json();

    if (!body) {
        return Response.json({ message: "No file uploaded" }, { status: 400 });
    }

    try {
        const duplicate: { serial: string, fileName: string }[] = [];
        for (let i = 0; i < body.data.length; i++) {
            const query = `SELECT * FROM "Serials" as s where s."serial" = '${body.data[i].serial}';`
            const find = await conn?.query(query)

            if (find?.rows.length == 0) {
                const insert = `INSERT INTO "Serials" ("id", "serial", "fileName") VALUES (
                '${cuid()}', '${body.data[i].serial}', '${body.data[i].fileName}');`
                await conn?.query(insert)
            }
            if (find?.rows.length != 0) {
                duplicate.push({ serial: body.data[i].serial, fileName: body.data[i].fileName })
                continue
            }
        }

        if (duplicate.length != 0) {
            return Response.json({ data: duplicate, check: "The file has duplicates" });
        } else {
            return Response.json({ data: [], check: "No duplicate files" });
        }


    } catch (error) {
        console.error('File saving error:', error);
        return new Response("Failed to save the file", { status: 500 });
    }
}
