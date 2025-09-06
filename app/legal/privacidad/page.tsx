import { LegalPageLayout } from "@/components/layout/legal/legal-page-layout";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title="Política de Privacidad"
      subtitle="Información sobre cómo recopilamos, utilizamos y protegemos tus datos personales."
      lastUpdated="16 de May, 2025"
    >
      <p>
        En <strong className="text-primary font-bold">Agendux</strong>,
        respetamos tu privacidad y estamos comprometidos con la protección de
        tus datos personales. Esta política explica qué información recopilamos,
        cómo la usamos y cuáles son tus derechos.
      </p>
      <h3 className="subtittle-privacity">1. Información que recopilamos</h3>
      <p>
        Cuando utilizas nuestra aplicación, podemos recopilar la siguiente
        información:
      </p>
      <ul>
        <li className="text-secondary-foreground">
          Tu nombre completo
        </li>
        <li className="text-secondary-foreground">
          Dirección de correo electrónico
        </li>
        <li className="text-secondary-foreground">
          Imagen de perfil (si accedes con Google)
        </li>
        <li className="text-secondary-foreground">
          Información de uso dentro de la plataforma (agendas, fechas, tareas,
          etc.)
        </li>
      </ul>
      <p>
        <strong>Nota:</strong> Si inicias sesión con Google, solo accedemos a tu
        correo, nombre y foto de perfil, previa autorización.
      </p>
      <h3 className="subtittle-privacity">2. Uso de la información</h3>
      <p>Utilizamos tu información para:</p>
      <ul>
        <li className="text-secondary-foreground">
          Identificarte dentro de la plataforma
        </li>
        <li className="text-secondary-foreground">
          Personalizar tu experiencia de usuario
        </li>
        <li className="text-secondary-foreground">
          Garantizar el funcionamiento adecuado del sistema
        </li>
        <li className="text-secondary-foreground">
          Comunicarnos contigo si es necesario (por ejemplo, notificaciones de
          agenda)
        </li>
      </ul>
      <h3 className="subtittle-privacity">3. Almacenamiento y seguridad</h3>
      <p>
        Tu información se almacena en servidores seguros y se protege mediante
        medidas técnicas y organizativas adecuadas. No vendemos, compartimos ni
        transferimos tu información personal a terceros sin tu consentimiento
        explícito.
      </p>
      <h3 className="subtittle-privacity">4. Terceros</h3>
      <p>
        Usamos servicios de terceros (como Google OAuth) únicamente para
        autenticación. Estos servicios tienen sus propias políticas de
        privacidad.
      </p>
      <h3 className="subtittle-privacity">5. Derechos del usuario</h3>
      <p>Como usuario tienes derecho a:</p>
      <ul>
        <li className="text-secondary-foreground">
          Acceder a tus datos personales
        </li>
        <li className="text-secondary-foreground">
          Solicitar su corrección o eliminación
        </li>
        <li className="text-secondary-foreground">
          Revocar tu consentimiento en cualquier momento
        </li>
      </ul>
      <p>
        Puedes ejercer estos derechos escribiéndonos a{" "}
        <a href="mailto:agendux.com@gmail.com" className="text-chart-5">
          agendux.com@gmail.com
        </a>
        .
      </p>
      <h3 className="subtittle-privacity">6. Cambios en esta política</h3>
      <p>
        Nos reservamos el derecho de modificar esta política de privacidad. Los
        cambios se comunicarán en esta misma página con al menos 7 días de
        antelación.
      </p>
      <h3 className="subtittle-privacity">7. Contacto</h3>
      <p>Para cualquier pregunta sobre esta política, contáctanos en:</p>
      <ul>
        <li className="text-secondary-foreground">
          Correo:{" "}
          <a
            className="text-chart-5"
            href="mailto:agendux.com@gmail.com"
          >
            agendux.com@gmail.com
          </a>
        </li>
        <li className="text-secondary-foreground">
          Sitio web:{" "}
          <Link className="text-chart-5" href="/">
            agendux.com
          </Link>
        </li>
      </ul>
    </LegalPageLayout>
  );
}