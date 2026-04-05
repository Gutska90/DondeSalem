import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/legal-page-shell";

export const metadata: Metadata = {
  title: "Términos y condiciones — DondeSalem",
  description: "Condiciones generales de uso del sitio y compras en DondeSalem.",
};

export default function TerminosPage() {
  return (
    <LegalPageShell title="Términos y condiciones de uso">
      <p>
        Este texto es una <strong className="text-ds-ink">plantilla orientativa</strong> para el
        lanzamiento del sitio. Debe ser revisado y sustituido por el cliente junto con asesoría legal
        según el giro y la jurisdicción (Chile).
      </p>
      <h2>Uso del sitio</h2>
      <p>
        Al acceder y utilizar este sitio web, aceptás estos términos. Si no estás de acuerdo, no uses
        el sitio. El titular puede modificar las condiciones; la versión vigente será la publicada en
        esta página.
      </p>
      <h2>Productos y precios</h2>
      <p>
        Los precios, disponibilidad y descripciones se muestran con la información disponible en el
        momento de la compra. Los errores materiales pueden ser corregidos. El stock se confirma al
        procesar el pedido.
      </p>
      <h2>Pedidos y contratación</h2>
      <p>
        El pedido implica una oferta de compra. La tienda puede confirmar o rechazar el pedido por
        stock, datos incompletos o causas de fuerza mayor. Los medios de pago y plazos se comunican en
        el proceso de compra y en las comunicaciones posteriores.
      </p>
      <h2>Limitación de responsabilidad</h2>
      <p>
        En la medida permitida por la ley aplicable, el sitio se ofrece “tal cual” y no se garantiza
        disponibilidad ininterrumpida del servicio. No nos hacemos responsables por daños indirectos
        derivados del uso del sitio salvo disposición legal imperativa en contrario.
      </p>
      <h2>Contacto</h2>
      <p>
        Consultas sobre estos términos:{" "}
        <a href="mailto:hola@dondesalem.cl" className="text-ds-accent underline hover:text-ds-ink">
          hola@dondesalem.cl
        </a>
        .
      </p>
    </LegalPageShell>
  );
}
