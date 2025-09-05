import {
  AlertTriangle,
  BrainCircuit,
  CircleCheckBig,
  CircleDot,
  MessageSquare,
  Scissors,
  Stethoscope,
  Wrench,
} from "lucide-react";

export const professionalsData = [
  {
    icon: Stethoscope,
    title: "Médicos y clínicas",
    description: "Gestiona pacientes con confirmaciones automáticas.",
    features: ["Confirmación automática", "Recordatorios personalizados"],
  },
  {
    icon: Scissors,
    title: "Estéticas y peluquerías",
    description: "Organiza tu agenda y envía recordatorios a tus clientes.",
    features: ["Confirmación automática", "Recordatorios personalizados"],
  },
  {
    icon: BrainCircuit,
    title: "Psicólogos y terapeutas",
    description: "Gestiona mejor e informa a tus pacientes.",
    features: ["Confirmación automática", "Recordatorios personalizados"],
  },
  {
    icon: Wrench,
    title: "Servicios y reparaciones",
    description: "Coordina visitas técnicas y confirma disponibilidad.",
    features: ["Confirmación automática", "Recordatorios personalizados"],
  },
];

export const howItWorksData = {
  tag: "CÓMO FUNCIONA",
  title: "La forma más simple de agendar y confirmar citas",
  subtitle:
    "Un proceso sencillo en dos pasos que automatiza la comunicación con tus clientes.",
  steps: [
    {
      stepNumber: 1,
      title: "Crea citas fácilmente",
      description:
        "Utiliza nuestro calendario integrado o sincroniza con Google Calendar. Crea citas desde cualquier dispositivo en segundos.",
      features: [
        {
          icon: CircleCheckBig,
          title: "Integración con Google Calendar",
          description: "Sincroniza automáticamente tus citas existentes.",
          iconColor: "text-accent",
        },
        {
          icon: CircleCheckBig,
          title: "Acceso desde cualquier dispositivo",
          description: "Gestiona tu agenda desde móvil, tablet o computadora.",
          iconColor: "text-accent",
        },
        {
          icon: CircleCheckBig,
          title: "Interfaz intuitiva",
          description:
            "Crea citas en segundos con nuestra interfaz fácil de usar.",
          iconColor: "text-accent",
        },
      ],
    },
    {
      stepNumber: 2,
      title: "Confirmación automática",
      description:
        "Agendux envía automáticamente mensajes de WhatsApp a tus clientes para confirmar sus citas y actualiza tu calendario en tiempo real.",
      features: [
        {
          icon: CircleDot,
          title: "Mensaje de confirmación enviado",
          description:
            "24 horas antes de la cita, enviamos automáticamente un mensaje personalizado.",
          iconColor: "text-chart-4",
        },
        {
          icon: CircleCheckBig,
          title: "Cita confirmada",
          description:
            "Tu cliente confirma con un simple clic y tu calendario se actualiza al instante.",
          iconColor: "text-accent",
        },
        {
          icon: AlertTriangle,
          title: "Cita cancelada",
          description:
            "Si el cliente cancela, liberas ese espacio para otra cita potencial.",
          iconColor: "text-destructive",
        },
        {
          icon: MessageSquare,
          title: "Mensajes personalizables según tu negocio",
          description: "Elige qué, cuándo y cómo comunicar cada paso.",
          iconColor: "text-primary",
        },
      ],
    },
  ],
};
