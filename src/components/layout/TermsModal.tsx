import { X, FileText } from 'lucide-react';
import { useEffect } from 'react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsModal({ isOpen, onClose }: TermsModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-6 pointer-events-none">
        <div className="bg-[#36393f] w-full max-w-4xl max-h-[90vh] rounded-xl shadow-elevated flex flex-col pointer-events-auto animate-slide-up border border-[#202225]">

          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[#202225] bg-[#2f3136] rounded-t-xl shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-discord-blurple/10 rounded-md">
                <FileText className="w-5 h-5 text-discord-blurple" />
              </div>
              <div>
                <h2 className="text-lg font-sans font-bold text-white tracking-tight">Uso de Contenido, Licencias y Responsabilidad</h2>
                <p className="text-xs font-sans text-discord-muted mt-0.5">Términos y condiciones del sistema</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-discord-muted hover:text-white hover:bg-[#202225] rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto font-sans text-sm text-discord-text space-y-4 custom-scrollbar leading-relaxed">
            
            <h2 className="text-white font-bold text-lg border-b border-[#202225] pb-2 mb-4">
              Derechos de Autor, Contenido de Terceros y Uso de la Plataforma
            </h2>

            <h3 className="text-white font-bold text-base mt-6">1. Naturaleza del Servicio</h3>
            <p>
              La Plataforma es una herramienta tecnológica destinada a la gestión, programación, automatización y reproducción de contenido de audio mediante calendarios, horarios, listas de reproducción, integraciones con servicios de terceros y demás funcionalidades relacionadas con la administración de audio.
            </p>
            <p>
              La Plataforma proporciona exclusivamente la infraestructura tecnológica necesaria para dichas funciones y no actúa como productora, editora, distribuidora, radiodifusora, titular de derechos o proveedora del contenido utilizado por los usuarios.
            </p>
            <p>
              La Plataforma no selecciona, crea, modifica, supervisa ni controla el contenido que los usuarios decidan almacenar, programar o reproducir mediante el servicio.
            </p>

            <h3 className="text-white font-bold text-base mt-6">2. Almacenamiento de Contenido por los Usuarios</h3>
            <p>
              La Plataforma podrá proporcionar espacio de almacenamiento para que los usuarios carguen y administren archivos de audio u otros contenidos permitidos por el servicio, con una capacidad máxima determinada por el plan contratado, incluyendo planes que otorguen hasta 1 GB de almacenamiento.
            </p>
            <p>
              Cada usuario es el único responsable de los archivos, grabaciones, audios, música, efectos sonoros, mensajes, programas o cualquier otro contenido que almacene, cargue, programe o reproduzca mediante la Plataforma.
            </p>
            <p>
              Al utilizar el servicio, el usuario declara y garantiza que posee todos los derechos, licencias, permisos y autorizaciones necesarios para utilizar dicho contenido, o que cuenta con autorización expresa de sus respectivos titulares.
            </p>
            <p>
              La Plataforma no realiza verificaciones previas sobre la titularidad de los derechos de autor o de propiedad intelectual asociados al contenido almacenado por los usuarios y, por lo tanto, no será responsable por infracciones a derechos de autor, derechos conexos, derechos de propiedad intelectual o cualquier otro derecho de terceros derivado del contenido cargado por los usuarios.
            </p>

            <h3 className="text-white font-bold text-base mt-6">3. Programación de Audio</h3>
            <p>
              La Plataforma permite a los usuarios programar la reproducción automática de contenido de audio mediante calendarios, horarios y reglas definidas por ellos mismos.
            </p>
            <p>
              La responsabilidad sobre el contenido programado, así como sobre su uso, reproducción, transmisión, comunicación pública o cualquier otra forma de explotación, corresponde exclusivamente al usuario que configure dicha programación.
            </p>
            <p>
              La Plataforma únicamente ejecuta las instrucciones establecidas por el usuario y no interviene en la selección o determinación del contenido reproducido.
            </p>

            <h3 className="text-white font-bold text-base mt-6">4. Integración con YouTube</h3>
            <p>
              La Plataforma podrá ofrecer funcionalidades que permitan reproducir contenido disponible públicamente en YouTube mediante el uso de reproductores embebidos, enlaces o mecanismos oficiales proporcionados por dicha plataforma.
            </p>
            <p>
              La integración con YouTube tiene como único propósito facilitar la reproducción del contenido mediante las herramientas oficiales autorizadas por YouTube.
            </p>
            <p>
              La Plataforma no descarga, extrae, almacena, convierte, copia, modifica, redistribuye ni aloja en sus servidores el contenido disponible en YouTube.
            </p>
            <p>
              Todo contenido reproducido mediante esta integración continúa siendo alojado y distribuido directamente por YouTube y permanece sujeto a los términos, condiciones, políticas y licencias establecidas por dicha plataforma y por los respectivos titulares de derechos.
            </p>
            <p>
              La Plataforma no asume responsabilidad alguna respecto de la disponibilidad, legalidad, licenciamiento o titularidad del contenido publicado en YouTube.
            </p>

            <h3 className="text-white font-bold text-base mt-6">5. Estaciones de Radio por Internet y Servicios de Terceros</h3>
            <p>
              La Plataforma podrá permitir la programación o reproducción de estaciones de radio en línea, transmisiones de audio en vivo, podcasts o cualquier otro contenido proporcionado por terceros mediante enlaces, integraciones o reproductores compatibles.
            </p>
            <p>
              La Plataforma no almacena, retransmite, modifica, redistribuye ni reclama titularidad sobre dichas transmisiones.
            </p>
            <p>
              Todos los derechos relacionados con la programación, contenido editorial, música, marcas, nombres comerciales y demás elementos asociados pertenecen exclusivamente a sus respectivos propietarios y operadores.
            </p>
            <p>
              La responsabilidad de verificar que el uso de dichos servicios cumple con las condiciones establecidas por sus respectivos proveedores corresponde exclusivamente al usuario.
            </p>

            <h3 className="text-white font-bold text-base mt-6">6. Derechos de Autor y Licencias</h3>
            <p>
              El usuario reconoce y acepta que es exclusivamente responsable de obtener y mantener vigentes todas las licencias, autorizaciones, permisos o derechos necesarios para utilizar cualquier contenido mediante la Plataforma.
            </p>
            <p>
              La utilización de la Plataforma no implica la concesión automática de derechos de reproducción, distribución, comunicación pública, sincronización, retransmisión o cualquier otro derecho relacionado con obras protegidas por la legislación aplicable en materia de propiedad intelectual y derechos de autor.
            </p>
            <p>
              La Plataforma no garantiza que el uso de determinado contenido musical, estación de radio, podcast o servicio de terceros otorgue al usuario los permisos legales necesarios para su explotación o comunicación pública.
            </p>

            <h3 className="text-white font-bold text-base mt-6">7. Contenido Prohibido</h3>
            <p>
              Queda estrictamente prohibido utilizar la Plataforma para:
            </p>
            <ul className="list-none space-y-2 pl-4">
              <li>a) Almacenar, reproducir o distribuir contenido que infrinja derechos de autor o derechos de propiedad intelectual de terceros.</li>
              <li>b) Utilizar contenido sin contar con las autorizaciones o licencias correspondientes.</li>
              <li>c) Realizar actividades que vulneren la legislación mexicana o tratados internacionales aplicables en materia de propiedad intelectual.</li>
              <li>d) Utilizar la Plataforma para actividades ilícitas o que afecten derechos de terceros.</li>
            </ul>
            <p>
              La Plataforma podrá suspender o cancelar cuentas, así como eliminar contenido, cuando existan indicios razonables de incumplimiento de estas disposiciones.
            </p>

            <h3 className="text-white font-bold text-base mt-6">8. Procedimiento de Notificación y Retiro de Contenido</h3>
            <p>
              Si cualquier persona considera que un contenido alojado, programado o utilizado mediante la Plataforma infringe sus derechos de autor o de propiedad intelectual, podrá presentar una notificación formal proporcionando información suficiente para identificar el contenido presuntamente infractor y acreditar la titularidad de los derechos correspondientes.
            </p>
            <p>
              Una vez recibida una notificación razonablemente fundamentada, la Plataforma podrá revisar el caso y, a su sola discreción, restringir temporalmente el acceso al contenido, eliminarlo o adoptar las medidas que considere necesarias para atender la reclamación.
            </p>
            <p>
              La recepción de una notificación no implica reconocimiento de responsabilidad por parte de la Plataforma.
            </p>

            <h3 className="text-white font-bold text-base mt-6">9. Limitación de Responsabilidad</h3>
            <p>
              La Plataforma actúa exclusivamente como proveedor de herramientas tecnológicas para la gestión, programación y reproducción de audio.
            </p>
            <p>
              En ningún caso la Plataforma, sus propietarios, administradores, empleados, desarrolladores o afiliados serán responsables por reclamaciones, demandas, procedimientos administrativos, sanciones, multas, pérdidas, daños o perjuicios derivados de:
            </p>
            <ul className="list-none space-y-2 pl-4">
              <li>a) El contenido almacenado, cargado o programado por los usuarios.</li>
              <li>b) El uso de música, grabaciones, programas, estaciones de radio, podcasts o cualquier otro contenido protegido por derechos de terceros.</li>
              <li>c) El incumplimiento por parte de los usuarios de obligaciones legales relacionadas con derechos de autor, propiedad intelectual o derechos conexos.</li>
              <li>d) La disponibilidad, suspensión, modificación o eliminación de contenido proporcionado por plataformas o servicios externos.</li>
              <li>e) Reclamaciones de terceros relacionadas con el contenido utilizado mediante la Plataforma.</li>
            </ul>

            <h3 className="text-white font-bold text-base mt-6">10. Indemnización</h3>
            <p>
              El usuario acepta defender, indemnizar y mantener libre de responsabilidad a la Plataforma, sus propietarios, administradores, empleados y colaboradores frente a cualquier reclamación, demanda, procedimiento, sanción, daño, pérdida, costo o gasto, incluyendo honorarios legales razonables, derivados del contenido que almacene, programe, reproduzca o utilice mediante el servicio, así como de cualquier incumplimiento de estos Términos y Condiciones o de la legislación aplicable.
            </p>

            {/* Espacio extra al final para que no quede pegado al borde */}
            <div className="h-4"></div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#202225] bg-[#2f3136] rounded-b-xl flex justify-end shrink-0">
            <button
              onClick={onClose}
              className="discord-button discord-button-primary px-6 py-2"
            >
              Entendido
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
