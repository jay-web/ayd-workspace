const { Client } = require("pg");

async function main() {
  const client = new Client({
    host: "localhost",
    port: 5432,
    database: "ayd_local",
    user: "ayd_user",
    password: "ayd_password",
    ssl: false,
  });

  await client.connect();
  const result = await client.query("select current_user, current_database()");
  console.log(result.rows);
  await client.end();
}

main().catch(console.error);