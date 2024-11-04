import { Pool } from "pg";

let conn: Pool | undefined;

if (!conn) {
    conn = new Pool({
        user: process.env.NEXT_PUBLIC_PGSQL_USER,
        password: process.env.NEXT_PUBLIC_PGSQL_PASSWORD,
        host: process.env.NEXT_PUBLIC_PGSQL_HOST,
        port: Number(process.env.NEXT_PUBLIC_PGSQL_PORT),
        database: process.env.NEXT_PUBLIC_PGSQL_DATABASE,
    });
}

export default conn;