import {
  AlertTriangle,
  BarChart2,
  BrainCircuit,
  Calendar,
  CheckSquare,
  CircleCheckBig,
  CircleDot,
  Cog,
  Link2,
  MessageSquare,
  RotateCw,
  Scissors,
  Smartphone,
  Stethoscope,
  Users,
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

export const featuresData = [
  {
    icon: MessageSquare,
    title: "Recordatorios por WhatsApp",
    description:
      "Envía recordatorios automáticos para que tus clientes no olviden su cita.",
    colors:
      "bg-color-green/50 dark:bg-color-green/50 text-color-green dark:text-color-green",
  },
  {
    icon: CheckSquare,
    title: "Confirmación Interactiva",
    description:
      "Tus clientes pueden confirmar o cancelar su turno directamente desde WhatsApp.",
    colors: "bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-400",
  },
  {
    icon: Calendar,
    title: "Integración con Google Calendar",
    description:
      "Sincroniza tu agenda de Agendux con tu calendario personal para evitar duplicados.",
    colors:
      "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400",
  },
  {
    icon: Link2,
    title: "Link de Autoagenda Personal",
    description:
      "Comparte un link único para que tus clientes agenden por sí mismos, 24/7.",
    colors:
      "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400",
  },
  {
    icon: RotateCw,
    title: "Reprogramación Fácil",
    description:
      "Tus clientes pueden cancelar o reprogramar sus citas fácilmente con un solo clic.",
    colors:
      "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400",
  },
  {
    icon: BarChart2,
    title: "Dashboard de Gestión",
    description:
      "Visualiza y gestiona todas tus citas en un calendario centralizado.",
    colors: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400",
  },
  {
    icon: Cog,
    title: "Configuración Flexible",
    description:
      "Define tus servicios, precios y horarios de trabajo con total libertad.",
    colors:
      "bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-400",
  },
  {
    icon: Users,
    title: "Gestión de Clientes",
    description:
      "Visualiza un historial de todos tus clientes y sus citas pasadas en un solo lugar.",
    colors: "bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-400",
  },
  {
    icon: Smartphone,
    title: "Diseño Responsivo",
    description:
      "Gestiona tu agenda desde cualquier dispositivo: móvil, tablet o computadora.",
    colors: "bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-400",
  },
];
