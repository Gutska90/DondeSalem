import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/legal-page-shell";

export const metadata: Metadata = {
  title: "Privacidad — DondeSalem",
  description: "Tratamiento de datos personales en el sitio DondeSalem.",
};

export default function PrivacidadPage() {
  return (
    <LegalPageShell title="Política de privacidad">
      <p>
        <strong className="text-ds-ink">Documento base</strong> para cumplir con transparencia frente
        a usuarios y clientes. Debe adaptarse a la realidad del negocio y, si aplica, alinearse con la
        normativa chilena de protección de datos personales (Ley N.º 19.628 y normas complementarias).
      </p>
      <h2>Responsable</h2>
      <p>
        DondeSalem (datos de identificación y contacto a completar por el titular del sitio). Correo
        de contacto:{" "}
        <a href="mailto:hola@dondesalem.cl" className="text-ds-accent underline hover:text-ds-ink">
          hola@dondesalem.cl
        </a>
        .
      </p>
      <h2>Datos que podemos tratar</h2>
      <ul>
        <li>Identificación y contacto: nombre, correo electrónico, teléfono, dirección de envío.</li>
        <li>Datos de la cuenta y pedidos: historial de compras, preferencias indicadas en el sitio.</li>
        <li>Datos técnicos: dirección IP, tipo de navegador, cookies (si se implementan).</li>
      </ul>
      <h2>Finalidades</h2>
      <ul>
        <li>Gestionar pedidos, envíos, devoluciones y atención al cliente.</li>
        <li>Cumplir obligaciones legales y resolver reclamos.</li>
        <li>Mejorar el servicio y la seguridad del sitio.</li>
      </ul>
      <h2>Base legal y conservación</h2>
      <p>
        El tratamiento se fundamenta en la ejecución del contrato de compra, el consentimiento cuando
        corresponda y el interés legítimo o obligación legal según el caso. Los datos se conservan el
        tiempo necesario para esas finalidades y plazos legales.
      </p>
      <h2>Derechos</h2>
      <p>
        Podés solicitar acceso, rectificación, cancelación u oposición según corresponda, contactando
        al correo indicado. Si considerás que tus derechos no han sido respetados, podés acudir a las
        vías que establezca la ley.
      </p>
      <h2>Seguridad</h2>
      <p>
        Aplicamos medidas técnicas y organizativas razonables para proteger la información. Ningún
        sistema es 100&nbsp;% seguro; usá contraseñas fuertes y no compartas tu cuenta.
      </p>
    </LegalPageShell>
  );
}
