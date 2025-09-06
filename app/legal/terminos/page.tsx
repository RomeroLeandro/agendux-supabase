import { LegalPageLayout } from "@/components/layout/legal/legal-page-layout";
import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout
      title="Condiciones de Servicio"
      subtitle="Lea detenidamente los términos y condiciones que rigen el uso de nuestros servicios."
      lastUpdated="22 de Julio, 2025"
    >
      <p>
        Bienvenido a{" "}
        <strong className="text-primary font-bold">Agendux</strong>. Al
        utilizar nuestra aplicación y servicios, aceptas cumplir con los
        siguientes términos y condiciones. Si no estás de acuerdo con alguno de
        estos términos, te pedimos que no utilices la aplicación.
      </p>

      <h3 className="subtittle-privacity">1. Descripción del Servicio</h3>
      <p>
        Agendux es una plataforma web que permite a los usuarios gestionar
        agendas, citas, y otros aspectos relacionados con la planificación de
        tareas. El acceso a algunos servicios puede requerir autenticación
        mediante terceros, como Google.
      </p>

      <h3 className="subtittle-privacity">2. Uso Aceptable</h3>
      <p>Al utilizar Agendux, aceptas:</p>
      <ul>
        <li className="text-secondary-foreground">
          Proporcionar información precisa y actualizada.
        </li>
        <li className="text-secondary-foreground">
          No usar la plataforma con fines ilegales, fraudulentos o
          malintencionados.
        </li>
        <li className="text-secondary-foreground">
          No intentar acceder a áreas restringidas de la plataforma sin
          autorización.
        </li>
      </ul>

      <h3 className="subtittle-privacity">3. Cuentas de Usuario</h3>
      <p>
        Para acceder a ciertas funcionalidades, puedes iniciar sesión utilizando
        tu cuenta de Google. Al hacerlo, autorizas a Agendux a obtener tu
        nombre, correo electrónico y foto de perfil. Esta información se usa
        exclusivamente para identificarte dentro de la plataforma.
      </p>

      <h3 className="subtittle-privacity">4. Privacidad</h3>
      <p>
        La información que recopilamos está protegida por nuestra{" "}
        <Link href="/privacidad">Política de Privacidad</Link>. No compartimos
        tus datos con terceros sin tu consentimiento explícito.
      </p>

      <h3 className="subtittle-privacity">5. Responsabilidad</h3>
      <p>
        Agendux no se hace responsable por pérdidas, errores o interrupciones
        del servicio. Nos reservamos el derecho de modificar, suspender o
        finalizar el acceso a la plataforma en cualquier momento y sin previo
        aviso.
      </p>

      <h3 className="subtittle-privacity">6. Propiedad Intelectual</h3>
      <p>
        Todos los contenidos, marcas, logotipos y software relacionados con
        Agendux son propiedad exclusiva de sus respectivos titulares y están
        protegidos por las leyes de propiedad intelectual vigentes.
      </p>

      <h3 className="subtittle-privacity">7. Cambios en los Términos</h3>
      <p>
        Nos reservamos el derecho de actualizar estas condiciones en cualquier
        momento. Se notificará a los usuarios sobre cambios importantes a través
        del sitio web o correo electrónico.
      </p>

      <h3 className="subtittle-privacity">8. Contacto</h3>
      <p>
        Si tienes dudas sobre estas condiciones, puedes escribirnos a{" "}
        <a className="text-chart-5" href="mailto:agendux.com@gmail.com">
          agendux.com@gmail.com
        </a>
        .
      </p>
    </LegalPageLayout>
  );
}
