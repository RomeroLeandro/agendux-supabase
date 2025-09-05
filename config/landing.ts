import {
  AlertTriangle,
  BarChart2,
  BrainCircuit,
  Calendar,
  CalendarCheck,
  CheckSquare,
  CircleCheckBig,
  CircleDot,
  Clock,
  Cog,
  Link,
  Link2,
  MessageSquare,
  PackageCheck,
  RotateCw,
  Scissors,
  Settings2,
  Smartphone,
  Stethoscope,
  TrendingUp,
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

export const benefitsData = [
  {
    icon: TrendingUp,
    title: "Más ingresos y menos ausentismo",
    description:
      "Por cada cliente que olvida su cita pierdes tiempo y dinero. Agendux se encarga de confirmar y recordar tus citas.",
    colors:
      "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400",
  },
  {
    icon: Clock,
    title: "Ahorra tiempo automatizando mensajes",
    description:
      "¿Actualmente confirmas a tus clientes manualmente? ¿Los llamas o les escribes uno a uno? Deja que Agendux haga eso por ti.",
    colors:
      "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-400",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp: el canal más efectivo",
    description:
      "Los emails y SMS no son efectivos, y las llamadas son intrusivas. Agendux usa WhatsApp para garantizar que tus clientes vean el mensaje y confirmen la cita.",
    colors: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-400",
  },
  {
    icon: CalendarCheck,
    title: "Tu agenda siempre sincronizada",
    description:
      "Con la integración de Google Calendar, tu disponibilidad se actualiza en tiempo real, evitando que te agenden turnos cuando ya estás ocupado.",
    colors:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400",
  },
];

export const schedulingFeatures = [
  {
    icon: Link,
    title: "Link de Autoagenda",
    description:
      "Crea un link personalizado para que tus clientes elijan su cita de manera independiente, sin llamadas ni mensajes.",
    colors:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400",
  },
  {
    icon: Settings2,
    title: "Configuración a tu medida",
    description:
      "Define tu disponibilidad, servicios, duración y precios. Personaliza cada aspecto para adaptarlo a tu negocio.",
    colors:
      "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-400",
  },
  {
    icon: PackageCheck,
    title: "Todo integrado",
    description:
      "Autoagenda viene incluido en todos los planes de Agendux. Las citas se sincronizan automáticamente con tu calendario.",
    colors:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400",
  },
];
