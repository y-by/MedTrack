// STUB — not yet called by the app. src/lib/api.js currently uses the mock
// data layer (src/lib/mockData.js). When we connect the backend, this
// function's body is what getPatientMedications() in api.js will fetch from.
//
// import { neon } from '@netlify/neon'
//
// export default async (req) => {
//   const sql = neon() // reads NETLIFY_DATABASE_URL automatically
//   const url = new URL(req.url)
//   const patientId = url.searchParams.get('patientId')
//
//   const rows = await sql`
//     select m.*, d.id as dose_id, d.scheduled_for, d.taken_at, d.status
//     from medications m
//     left join lateral (
//       select * from dose_logs
//       where medication_id = m.id
//       order by scheduled_for asc
//       limit 1
//     ) d on true
//     where m.patient_id = ${patientId} and m.active = true
//   `
//
//   return new Response(JSON.stringify(rows), {
//     headers: { 'content-type': 'application/json' },
//   })
// }
