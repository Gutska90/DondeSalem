import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/legal-page-shell";

export const metadata: Metadata = {
  title: "Envíos y devoluciones — DondeSalem",
  description: "Política de envíos, cambios y devoluciones en DondeSalem.",
};

export default function DevolucionesPage() {
  return (
    <LegalPageShell title="Envíos, cambios y devoluciones">
      <p>
        Texto <strong className="text-ds-ink">modelo</strong> para publicar políticas comerciales. El
        cliente debe ajustar plazos, costos de envío y exclusiones (productos sellados, preventas,
        etc.) según su operación y la Ley del Consumidor en Chile (Ley N.º 19.496).
      </p>
      <h2>Envíos</h2>
      <p>
        Los plazos y costos de despacho se informan en el checkout o por canales oficiales. Los
        tiempos son estimados y pueden variar por stock del proveedor, festivos o causas ajenas al
        control razonable de la tienda.
      </p>
      <h2>Recepción del pedido</h2>
      <p>
        Revisá el paquete al recibirlo. Los daños por transporte deben reportarse en el plazo que
        defina la tienda junto con fotos del embalaje y el producto.
      </p>
      <h2>Cambios y devoluciones</h2>
      <ul>
        <li>
          Productos con falla de fábrica o error en el envío: contacto dentro del plazo indicado por
          la tienda; se indicará reemplazo, nota de crédito o reembolso según corresponda.
        </li>
        <li>
          Productos sellados (sobres, decks, etc.): normalmente no admiten devolución salvo defecto
          o derecho legal aplicable.
        </li>
        <li>Preventas y reservas: pueden tener condiciones especiales publicadas en la ficha.</li>
      </ul>
      <h2>Procedimiento</h2>
      <p>
        Escribinos a{" "}
        <a href="mailto:hola@dondesalem.cl" className="text-ds-accent underline hover:text-ds-ink">
          hola@dondesalem.cl
        </a>{" "}
        o por el formulario de contacto con el número de pedido. Responderemos en un plazo razonable
        de días hábiles.
      </p>
    </LegalPageShell>
  );
}
