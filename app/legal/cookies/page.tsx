import { LegalPageLayout } from "@/components/layout/legal/legal-page-layout";
import Link from "next/link";

export default function CookiePolicyPage() {
  return (
    <LegalPageLayout
      title="Política de Cookies"
      subtitle="Información sobre cómo y por qué utilizamos cookies en nuestra plataforma."
      lastUpdated="22 de Julio, 2025"
    >
      <p>
        Esta Política de Cookies explica qué son las cookies y cómo las
        utilizamos en{" "}
        <strong className="text-chart-5 font-bold">Agendux</strong>. Debes leer
        esta política para entender qué tipo de cookies usamos, la información
        que recogemos y cómo se utiliza esa información.
      </p>

      <h3 className="subtittle-privacity">1. ¿Qué son las Cookies?</h3>
      <p>
        Las cookies son pequeños archivos de texto que se almacenan en tu
        navegador cuando visitas un sitio web. Funcionan como una “memoria” para
        el sitio, permitiéndole recordar información importante sobre tu visita,
        como tus preferencias o el estado de tu sesión.
      </p>

      <h3 className="subtittle-privacity">2. ¿Cómo Usamos las Cookies?</h3>
      <p>
        Utilizamos cookies para varios propósitos esenciales en nuestra
        plataforma:
      </p>
      <ul>
        <li className="text-secondary-foreground mt-4">
          <strong className=" text-chart-5">Cookies Esenciales:</strong> Son
          estrictamente necesarias para el funcionamiento del sitio. Por
          ejemplo, las usamos para mantener tu sesión iniciada de forma segura.
          Sin estas cookies, el servicio no puede funcionar correctamente.
        </li>
        <li className="text-secondary-foreground mt-4">
          <strong className=" text-chart-5">Cookies de Preferencias:</strong>{" "}
          Estas cookies nos permiten recordar tus preferencias y
          configuraciones, como el idioma o el tema (claro/oscuro), para que no
          tengas que configurarlas cada vez que nos visitas.
        </li>
        <li className="text-secondary-foreground mt-4">
          <strong className=" text-chart-5">
            Cookies de Rendimiento y Análisis:
          </strong>{" "}
          Utilizamos cookies de terceros (como Google Analytics) para entender
          cómo los usuarios interactúan con nuestra plataforma. Recopilamos
          datos anónimos sobre las páginas visitadas y el tiempo de permanencia
          para poder mejorar nuestro servicio.
        </li>
      </ul>

      <h3 className="subtittle-privacity">
        3. Tipos de Cookies que Utilizamos
      </h3>
      <p className="text-secondary-foreground mt-4">
        <strong className=" text-chart-5">Cookies de Sesión:</strong>{" "}
        Son temporales y se eliminan de tu dispositivo cuando cierras el
        navegador. Las usamos para gestionar el estado de tu autenticación.
      </p>
      <p className="text-secondary-foreground mt-4">
        <strong className=" text-chart-5">
          Cookies Persistentes:
        </strong>{" "}
        Permanecen en tu dispositivo durante un período de tiempo determinado o
        hasta que las eliminas manualmente. Las usamos para recordar tus
        preferencias a largo plazo.
      </p>

      <h3 className="subtittle-privacity">4. Control de Cookies</h3>
      <p>
        Tienes el control total sobre las cookies. La mayoría de los navegadores
        te permiten ver, gestionar, eliminar y bloquear las cookies de un sitio
        web. Puedes cambiar la configuración de tu navegador para rechazar todas
        las cookies o para que te avise cuando se envía una.
      </p>
      <p>
        Ten en cuenta que si bloqueas nuestras cookies esenciales, es posible
        que algunas partes de nuestra plataforma no funcionen correctamente.
      </p>

      <h3 className="subtittle-privacity">5. Cambios en esta Política</h3>
      <p>
        Podemos actualizar nuestra Política de Cookies de vez en cuando. Te
        notificaremos de cualquier cambio publicando la nueva política en esta
        página.
      </p>

      <h3 className="subtittle-privacity">6. Contacto</h3>
      <p>
        Si tienes alguna pregunta sobre nuestro uso de cookies, puedes
        contactarnos a través de nuestro
        <Link href="/#contacto" className="text-chart-5">
          {" "}
          formulario de contacto
        </Link>{" "}
        o escribiéndonos a{" "}
        <a className="text-chart-5" href="mailto:agendux.com@gmail.com">
          agendux.com@gmail.com
        </a>
        .
      </p>
    </LegalPageLayout>
  );
}
