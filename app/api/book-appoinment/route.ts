import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const {
      professional_id,
      service_id,
      patient_name,
      patient_phone,
      patient_email,
      appointment_date,
      appointment_time,
      notes,
    } = await request.json();

    const supabase = await createClient();

    // Crear paciente
    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .insert({
        user_id: professional_id,
        full_name: patient_name,
        phone: patient_phone,
        email: patient_email,
      })
      .select()
      .single();

    if (patientError) throw patientError;

    // Crear cita
    const appointmentDateTime = new Date(
      `${appointment_date}T${appointment_time}`
    );

    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .insert({
        user_id: professional_id,
        patient_id: patient.id,
        service_id: service_id,
        appointment_datetime: appointmentDateTime.toISOString(),
        notes: notes,
        status: "scheduled",
      })
      .select()
      .single();

    if (appointmentError) throw appointmentError;

    return NextResponse.json({
      success: true,
      appointment_id: appointment.id,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}
