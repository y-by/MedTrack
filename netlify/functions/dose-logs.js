// STUB — not yet called by the app. Mirrors markDoseTaken() in
// src/lib/api.js. Requires the caller to be authenticated (verify the
// Netlify Identity JWT via context.clientContext.user once auth is
// connected) and to own the dose being marked, before writing.
//
// import { neon } from '@netlify/neon'
//
// export default async (req) => {
//   const sql = neon()
//   const { doseId } = await req.json()
//
//   const [dose] = await sql`
//     update dose_logs
//     set status = 'taken', taken_at = now()
//     where id = ${doseId}
//     returning *
//   `
//
//   return new Response(JSON.stringify(dose), {
//     headers: { 'content-type': 'application/json' },
//   })
// }
