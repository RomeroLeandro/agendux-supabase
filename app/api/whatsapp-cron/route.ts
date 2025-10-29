

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// URL de nuestro "Worker" (Paso 5)
const SENDER_URL = `${process.env.NEXT_PUBLIC_SITE_URL}/api/whatsapp-sender`
// Llave maestra para llamar al "Worker"
const SENDER_AUTH_HEADER = `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
// Secreto para proteger ESTA ruta
const CRON_SECRET = process.env.CRON_SECRET

// Cliente Admin de Supabase
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Función helper para llamar a nuestra API Route "Worker" de forma segura
 */
async function callSender(appointment_id: number, message_type: string) {
  console.log(`Calling sender for appt [${appointment_id}], type [${message_type}]`)
  try {
    const res = await fetch(SENDER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': SENDER_AUTH_HEADER, // ¡Autenticación!
      },
      body: JSON.stringify({ appointment_id, message_type }),
    })
    
    if (!res.ok) {
      console.error(
        `Error calling sender for ${appointment_id}: ${res.status} ${res.statusText}`
      )
    }
  } catch (e) {
    console.error(`Fetch error calling sender for ${appointment_id}:`, (e as Error).message)
  }
}

// Los Cron Jobs de Vercel usan el método GET
export async function GET(request: Request) {
  // 1. Proteger la ruta del Cron
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const now = new Date().toISOString()
  console.log(`Running whatsapp-cron (Node.js) at ${now}`)

  try {
    // 2. BUSCAR RECORDATORIO 1
    const { data: r1Apps, error: r1Err } = await supabaseAdmin.rpc(
      'find_appointments_for_reminder_1',
      { now_time: now }
    )
    if (r1Err) console.error('Error rpc reminder_1:', r1Err.message)
    for (const app of r1Apps || []) {
      await callSender(app.id, 'reminder_1')
    }

    // 3. BUSCAR RECORDATORIO 2
    const { data: r2Apps, error: r2Err } = await supabaseAdmin.rpc(
      'find_appointments_for_reminder_2',
      { now_time: now }
    )
    if (r2Err) console.error('Error rpc reminder_2:', r2Err.message)
    for (const app of r2Apps || []) {
      await callSender(app.id, 'reminder_2')
    }

    // 4. BUSCAR POST-CITA
    const { data: postApps, error: postErr } = await supabaseAdmin.rpc(
      'find_appointments_for_post_appointment',
      { now_time: now }
    )
    if (postErr) console.error('Error rpc post_appointment:', postErr.message)
    for (const app of postApps || []) {
      await callSender(app.id, 'post_appointment')
    }

    return NextResponse.json(
      {
        message: 'Cron ejecutado (Node.js).',
        r1_found: (r1Apps || []).length,
        r2_found: (r2Apps || []).length,
        post_found: (postApps || []).length,
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}