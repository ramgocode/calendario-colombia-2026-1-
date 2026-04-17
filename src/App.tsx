import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// --- TIPOS Y ENUMS ---
type EventType = 'festivo' | 'hoy' | 'oficio';

interface SpecialDate {
  txt: string;
  cls: EventType;
  desc?: string; // Descripción informativa para el tooltip
}

interface SpecialDatesMap {
  [key: string]: SpecialDate; // Formato "MM-DD"
}

// --- CONFIGURACIÓN DE COLORES ---
const COLOR_MAP: Record<EventType, { bg: string, text: string, overlay: string }> = {
  festivo: { bg: 'bg-editorial-navy', text: 'text-white', overlay: 'bg-editorial-navy/10' },
  oficio: { bg: 'bg-editorial-green', text: 'text-white', overlay: 'bg-editorial-green/10' },
  hoy: { bg: 'bg-transparent', text: 'text-editorial-navy', overlay: '' },
};

// --- FESTIVOS OFICIALES COLOMBIA 2026 ---
const FESTIVOS: SpecialDatesMap = {
  "01-01": { txt: "Año Nuevo", cls: "festivo", desc: "Celebración del inicio del año calendario." },
  "01-12": { txt: "Día de los Reyes Magos", cls: "festivo", desc: "Celebración de la Epifanía, trasladada al lunes por la Ley Emiliani." },
  "03-23": { txt: "Día de San José", cls: "festivo", desc: "Homenaje al patrono de los trabajadores, trasladado por la Ley Emiliani." },
  "04-02": { txt: "Jueves Santo", cls: "festivo", desc: "Día de la Última Cena y el lavatorio de los pies." },
  "04-03": { txt: "Viernes Santo", cls: "festivo", desc: "Conmemoración de la pasión y muerte de Jesús." },
  "05-01": { txt: "Día del Trabajo", cls: "festivo", desc: "Conmemoración de la lucha por los derechos laborales." },
  "05-18": { txt: "Día de la Ascensión", cls: "festivo", desc: "Celebración de la ascensión de Jesús al cielo." },
  "06-08": { txt: "Corpus Christi", cls: "festivo", desc: "Fiesta del Cuerpo y la Sangre de Cristo." },
  "06-15": { txt: "Sagrado Corazón de Jesús", cls: "festivo", desc: "Devoción al corazón de Jesús, trasladado al lunes." },
  "06-29": { txt: "San Pedro y San Pablo", cls: "festivo", desc: "Celebración de los apóstoles Pedro y Pablo." },
  "07-20": { txt: "Grito de Independencia", cls: "festivo", desc: "Conmemoración de la firma del Acta de Independencia de 1810." },
  "08-07": { txt: "Batalla de Boyacá", cls: "festivo", desc: "Victoria decisiva en la campaña libertadora de 1819." },
  "08-17": { txt: "Asunción de la Virgen", cls: "festivo", desc: "Celebración de la asunción de María al cielo." },
  "10-12": { txt: "Día de la Raza", cls: "festivo", desc: "Día del Respeto a la Diversidad Cultural." },
  "11-02": { txt: "Día de todos los Santos", cls: "festivo", desc: "Homenaje a todos los santos, trasladado al lunes." },
  "11-16": { txt: "Independencia de Cartagena", cls: "festivo", desc: "Conmemoración de la independencia de la ciudad heroica." },
  "12-08": { txt: "Inmaculada Concepción", cls: "festivo", desc: "Día de las Velitas, celebración de la pureza de María." },
  "12-25": { txt: "Navidad", cls: "festivo", desc: "Celebración del nacimiento de Jesucristo." },
};

// --- OFICIOS Y PROFESIONES (Basado en PDF) ---
const OFICIOS: SpecialDatesMap = {
  "01-26": { txt: "Día del Community Manager", cls: "oficio", desc: "Homenaje a quienes gestionan la voz y presencia de las marcas en el entorno digital." },
  "02-09": { txt: "Día del Periodista", cls: "oficio", desc: "Reconocimiento a la labor de informar y defender la libertad de expresión en Colombia." },
  "02-21": { txt: "Día del Guía de Turismo", cls: "oficio", desc: "Homenaje a los embajadores locales que enseñan nuestras riquezas a los visitantes." },
  "03-01": { txt: "Día del Contador Público", cls: "oficio", desc: "Celebración de los profesionales que garantizan la transparencia financiera." },
  "03-19": { txt: "Día del Hombre / Día del Carpintero", cls: "oficio", desc: "Homenaje a San José y reconocimiento a los artesanos de la madera." },
  "04-22": { txt: "Día de la Tierra", cls: "oficio", desc: "Jornada global para generar conciencia sobre la protección de nuestro planeta." },
  "04-26": { txt: "Día de la Secretaria", cls: "oficio", desc: "Reconocimiento a la labor administrativa esencial en toda organización." },
  "04-27": { txt: "Día del Diseñador Gráfico", cls: "oficio", desc: "Celebración de la creatividad visual que moldea nuestra comunicación diaria." },
  "05-01": { txt: "Día del Trabajo", cls: "oficio", desc: "Homenaje a la fuerza laboral y su impacto fundamental en la sociedad." },
  "05-10": { txt: "Día de la Madre / Día del Veterinario", cls: "oficio", desc: "Día de la Madre y reconocimiento a quienes cuidan la salud animal." },
  "05-12": { txt: "Día de la Enfermera", cls: "oficio", desc: "Homenaje a la vocación y cuidado incondicional en el sistema de salud." },
  "05-15": { txt: "Día del Maestro", cls: "oficio", desc: "Reconocimiento a quienes dedican su vida a la enseñanza y guía de nuevas generaciones." },
  "06-01": { txt: "Día del Campesino", cls: "oficio", desc: "Homenaje a los productores rurales que garantizan el sustento del país." },
  "06-08": { txt: "Día del Estudiante", cls: "oficio", desc: "Celebración del aprendizaje y el espíritu crítico de los jóvenes en formación." },
  "06-21": { txt: "Día del Padre", cls: "oficio", desc: "Homenaje a la figura paterna y su rol en la construcción de la familia." },
  "06-22": { txt: "Día del Abogado / Día del Zootecnista", cls: "oficio", desc: "Homenaje a los profesionales del derecho y la producción animal." },
  "07-03": { txt: "Día del Economista", cls: "oficio", desc: "Reconocimiento a los expertos en análisis de mercados y recursos sociales." },
  "07-16": { txt: "Día de la Virgen del Carmen (Transportadores)", cls: "oficio", desc: "Patrona de los transportadores, celebrando su protección en las vías." },
  "07-19": { txt: "Día del Héroe de la Nación", cls: "oficio", desc: "Homenaje a los miembros de las fuerzas armadas caídos en cumplimiento del deber." },
  "08-07": { txt: "Día del Ejército Nacional", cls: "oficio", desc: "Aniversario de la Batalla de Boyacá y reconocimiento a la institución militar." },
  "08-11": { txt: "Día del Nutricionista", cls: "oficio", desc: "Profesionales dedicados a promover la salud a través de la alimentación balanceada." },
  "08-13": { txt: "Día del Humorista", cls: "oficio", desc: "Homenaje a quienes nos regalan risas, inspirado por la memoria de Jaime Garzón." },
  "08-17": { txt: "Día del Ingeniero Colombiano", cls: "oficio", desc: "Reconocimiento a quienes aplican la ciencia para resolver problemas y construir país." },
  "08-25": { txt: "Día del Peluquero / Barbero", cls: "oficio", desc: "Celebración de los expertos en estética capilar y cuidado personal." },
  "08-26": { txt: "Día del Tendero", cls: "oficio", desc: "Reconocimiento a los pilares del comercio de barrio en Colombia." },
  "08-28": { txt: "Día del Abuelo", cls: "oficio", desc: "Día para honrar la sabiduría y el amor de nuestros ancestros." },
  "09-08": { txt: "Día del Periodista Internacional", cls: "oficio", desc: "Conmemoración del heroísmo informativo a nivel global." },
  "09-13": { txt: "Día del Programador", cls: "oficio", desc: "Celebración del oficio que escribe el código del mundo moderno (Día 256)." },
  "09-19": { txt: "Día del Amor y la Amistad", cls: "oficio", desc: "Fecha tradicional colombiana para compartir afecto con seres queridos." },
  "09-30": { txt: "Día del Traductor / Intérprete", cls: "oficio", desc: "Homenaje a quienes facilitan el entendimiento entre culturas y lenguajes." },
  "10-03": { txt: "Día del Odontólogo", cls: "oficio", desc: "Profesionales dedicados a cuidar la salud oral y las sonrisas." },
  "10-04": { txt: "Día del Poeta", cls: "oficio", desc: "Homenaje a los creadores de versos y la belleza escrita." },
  "10-16": { txt: "Día del Panadero", cls: "oficio", desc: "Reconocimiento al arte milenario de amasar el alimento diario." },
  "10-20": { txt: "Día del Chef / Cocinero", cls: "oficio", desc: "Celebración de quienes transforman ingredientes en experiencias culinarias." },
  "10-22": { txt: "Día del Trabajador Social", cls: "oficio", desc: "Vocación de servicio dedicada al bienestar y justicia social de las comunidades." },
  "10-24": { txt: "Día del Bibliotecario", cls: "oficio", desc: "Guardianes del conocimiento y promotores de la lectura en todo el país." },
  "10-27": { txt: "Día del Arquitecto", cls: "oficio", desc: "Creativos que sueñan y diseñan los espacios que habitamos." },
  "10-30": { txt: "Día del Diseñador Gráfico (Nacional)", cls: "oficio", desc: "Instancia nacional para celebrar la comunicación visual." },
  "10-31": { txt: "Día del Niño", cls: "oficio", desc: "Jornada centrada en el bienestar y la alegría de la infancia." },
  "11-04": { txt: "Día del Administrador de Empresas", cls: "oficio", desc: "Profesionales expertos en la gestión eficiente de organizaciones." },
  "11-05": { txt: "Día de la Policía Nacional", cls: "oficio", desc: "Aniversario de la creación de la institución de civilidad y orden." },
  "11-20": { txt: "Día del Psicólogo", cls: "oficio", desc: "Reconocimiento a quienes cuidan la salud mental de los colombianos." },
  "11-22": { txt: "Día del Músico", cls: "oficio", desc: "Homenaje a Santa Cecilia y a todos los que nos emocionan con notas musicales." },
  "11-27": { txt: "Día del Vigilante", cls: "oficio", desc: "Reconocimiento a la labor silenciosa de quienes cuidan nuestra seguridad." },
  "12-03": { txt: "Día del Médico", cls: "oficio", desc: "Homenaje a los héroes de bata blanca que protegen la vida de todos." },
  "12-08": { txt: "Día de las Velitas", cls: "oficio", desc: "Una de las tradiciones más hermosas donde se ilumina el cielo con deseos." },
};

// --- FRASES INSPIRADORAS (Ciclo de 10 días según PDF) ---
const FRASES_CICLO = [
  { text: "La memoria del corazón elimina los malos recuerdos y magnifica los buenos.", author: "Gabriel García Márquez" },
  { text: "No llores porque se terminó, sonríe porque sucedió.", author: "Gabriel García Márquez" },
  { text: "El hombre que no ha sufrido no sabe nada.", author: "Porfirio Barba-Jacob" },
  { text: "Hay en el alma humana una fuerza que no se rinde.", author: "Jorge Isaacs" },
  { text: "La selva devora al hombre que no la comprende.", author: "José Eustasio Rivera" },
  { text: "La vida no es la que uno vivió, sino la que uno recuerda.", author: "Gabriel García Márquez" },
  { text: "Nada es tan peligroso como dejar que las cosas sucedan por sí solas.", author: "Mario Vargas Llosa" },
  { text: "La verdadera patria del escritor es su lengua.", author: "Carlos Fuentes" },
  { text: "La cultura es un acto de amor.", author: "Eduardo Galeano" },
  { text: "Somos lo que hacemos para cambiar lo que somos.", author: "Eduardo Galeano" },
];

const DAYS_BEFORE_MONTH = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

// --- COMPONENTE MES ---
interface MonthProps {
  monthIndex: number;
  year: number;
  today: Date;
  viewMode: 'festivos' | 'oficios'; // Nuevo prop para controlar la vista
  onDayClick: (info: string, day: number, month: number) => void;
  onHoverSpecial: (info: SpecialDate | null) => void;
}

const MonthCard: React.FC<MonthProps> = ({ monthIndex, year, today, viewMode, onDayClick, onHoverSpecial }) => {
  const monthName = new Intl.DateTimeFormat('es-CO', { month: 'long' }).format(new Date(year, monthIndex));
  
  // Calcular días del mes
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, monthIndex, 1).getDay(); // 0 (Dom) a 6 (Sab)

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  // Determinar qué mapa de fechas usar según el modo de vista
  const activeMap = viewMode === 'festivos' ? FESTIVOS : OFICIOS;

  return (
    <div className="flex flex-col group">
      <h3 className="text-base font-serif italic border-b border-editorial-border pb-1 mb-2 text-editorial-ink capitalize">
        {monthName}
      </h3>
      
      <div className="grid grid-cols-7 text-center font-mono">
        {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => (
          <span key={i} className="text-[9px] font-bold text-gray-400 pb-1">{d}</span>
        ))}
        
        {blanks.map(b => <div key={`b-${b}`} className="h-5" />)}
        
        {days.map(day => {
          const dateKey = `${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const especial = activeMap[dateKey]; // Solo busca en el mapa activo
          const isToday = today.getDate() === day && today.getMonth() === monthIndex && today.getFullYear() === year;
          
          let cellClass = "h-5 flex items-center justify-center text-[11px] cursor-pointer transition-all duration-300 relative ";
          
          if (especial) {
            cellClass += `${COLOR_MAP[especial.cls].bg} ${COLOR_MAP[especial.cls].text} font-bold rounded-[2px] shadow-sm z-10`;
          } else if (isToday) {
            cellClass += "outline-1 outline-editorial-navy text-editorial-navy font-bold rounded-[2px]";
          } else {
            cellClass += "text-editorial-ink hover:bg-editorial-gray/60";
          }

          return (
            <div
              key={day}
              className={cellClass}
              onClick={(e) => {
                e.stopPropagation(); // Evita que el clic cierre la selección al propagarse al contenedor principal
                let info = "";
                if (especial) info = `${day} de ${monthName}: ${especial.txt}`;
                else if (isToday) info = `Hoy es ${day} de ${monthName}, ¡día actual!`;
                else info = `${day} de ${monthName}`;
                onDayClick(info, day, monthIndex);
              }}
              onMouseEnter={() => especial && onHoverSpecial(especial)}
              onMouseLeave={() => onHoverSpecial(null)}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function App() {
  const year = 2026;
  const today = new Date();

  // Estados
  const [selection, setSelection] = useState<{ info: string, phrase: string, author: string } | null>(null);
  const [hoveredSpecial, setHoveredSpecial] = useState<SpecialDate | null>(null);
  const [viewMode, setViewMode] = useState<'festivos' | 'oficios'>('festivos');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const hoverCls = hoveredSpecial?.cls || null;

  const months = Array.from({ length: 12 }, (_, i) => i);

  const handleDayClick = (info: string, day: number, month: number) => {
    const dayOfYear = DAYS_BEFORE_MONTH[month] + day;
    const phraseIndex = (dayOfYear - 1) % 10;
    const phraseData = FRASES_CICLO[phraseIndex] || FRASES_CICLO[0];
    setSelection({
      info,
      phrase: phraseData.text,
      author: phraseData.author
    });
  };

  return (
    /* Contenedor principal con detección de clics externos para quitar la selección */
    <div 
      onClick={() => setSelection(null)}
      className="min-h-screen bg-editorial-bg text-editorial-ink font-sans relative overflow-x-hidden p-6 md:p-10 flex flex-col"
    >
      
      {/* Imagen de fondo difuminada (ALA.png personalizada) */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <img 
          src="/ALA.png" 
          alt=""
          className="w-full h-full object-cover opacity-[0.20] contrast-125 grayscale-[0.2]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-editorial-bg/30"></div>
      </div>

      {/* Overlay Dinámico de Fondo que reacciona al hover de fechas especiales */}
      <div 
        className={`fixed inset-0 pointer-events-none transition-opacity duration-700 z-0 ${hoverCls ? COLOR_MAP[hoverCls].overlay : 'opacity-0'}`} 
      />

      {/* Contenedor de la aplicación (Detiene la propagación de clics para no cerrar la selección accidentalmente) */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 max-w-[1200px] mx-auto w-full flex-grow flex flex-col"
      >
        
        {/* Cabecera estilo Editorial */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-editorial-ink pb-4 mb-8">
          <div className="title-group flex-1">
            <h1 className="text-4xl md:text-6xl font-serif font-black uppercase tracking-tighter leading-[0.9]">
              Colombia
            </h1>
            <p className="text-[10px] md:text-[11px] uppercase tracking-[2px] mt-2 opacity-70">
              Guía Editorial de Festividades y Fechas Especiales
            </p>
          </div>
          
          {/* Toggle "Oficios" */}
          <div className="flex flex-col items-center md:items-end gap-2 my-4 md:my-0">
            <span className="text-[10px] uppercase tracking-widest font-bold text-editorial-navy">Modo de Vista</span>
            <button 
              onClick={() => {
                setViewMode(viewMode === 'festivos' ? 'oficios' : 'festivos');
                setSelection(null); // Limpiar selección al cambiar de modo
              }}
              className="group relative flex items-center justify-between w-32 h-8 bg-editorial-gray border border-editorial-ink/30 rounded-full px-1 transition-all duration-300 hover:border-editorial-navy overflow-hidden"
            >
              <div 
                className={`absolute inset-y-1 w-[calc(50%-4px)] bg-editorial-navy rounded-full transition-transform duration-300 ease-in-out shadow-md ${viewMode === 'oficios' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'}`}
              />
              <span className={`flex-1 text-[9px] uppercase font-bold tracking-tighter z-10 transition-colors duration-300 ${viewMode === 'festivos' ? 'text-white' : 'text-editorial-ink'}`}>Festivos</span>
              <span className={`flex-1 text-[9px] uppercase font-bold tracking-tighter z-10 transition-colors duration-300 ${viewMode === 'oficios' ? 'text-white' : 'text-editorial-ink'}`}>Oficios</span>
            </button>
          </div>

          <div className="year-display font-serif text-6xl md:text-[82px] font-light leading-[0.7] text-editorial-navy mt-4 md:mt-0 ml-0 md:ml-8">
            {year}
          </div>
        </header>

        {/* Área Visual Dinámica: Muestra la fecha seleccionada y la frase del día */}
        <div className="min-h-[140px] flex flex-col items-center justify-center mb-8 gap-4 px-4 text-center">
          {selection ? (
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-2xl">
              <div className="bg-editorial-gray border border-editorial-border py-2 px-6 rounded-sm self-center">
                <p className="text-xs uppercase tracking-widest font-bold opacity-60 mb-1">
                  {viewMode === 'oficios' ? 'Día de Profesión' : 'Fecha & Evento'}
                </p>
                <p className="text-sm md:text-base font-serif italic text-editorial-ink">
                  {selection.info}
                </p>
              </div>
              
              <div className="relative p-4 md:p-6 border-l-4 border-editorial-gold bg-white shadow-sm ring-1 ring-editorial-border/50">
                <p className="text-base md:text-lg font-serif italic leading-relaxed text-editorial-ink mb-2">
                  "{selection.phrase}"
                </p>
                <p className="text-xs uppercase tracking-[2px] font-bold text-editorial-navy text-right">
                   — {selection.author}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 opacity-30">
              <p className="text-[10px] uppercase tracking-[3px]">
                {viewMode === 'oficios' ? 'Descubre los oficios del día' : 'Seleccione una fecha'}
              </p>
              <div className="w-12 h-[1px] bg-editorial-ink"></div>
            </div>
          )}
        </div>

        {/* Grilla de los 12 meses del año */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-10 flex-grow">
          {months.map(m => (
            <MonthCard 
              key={m}
              monthIndex={m}
              year={year}
              today={today}
              viewMode={viewMode}
              onDayClick={handleDayClick}
              onHoverSpecial={(info) => setHoveredSpecial(info)}
            />
          ))}
        </div>

        {/* Tooltip Interactivo */}
        <AnimatePresence>
          {hoveredSpecial && hoveredSpecial.desc && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{
                position: 'fixed',
                left: mousePos.x + 15,
                top: mousePos.y + 15,
                zIndex: 100,
                pointerEvents: 'none'
              }}
              className="max-w-[240px] bg-white border border-editorial-ink shadow-xl p-3 rounded-sm"
            >
              <p className="text-[10px] uppercase tracking-widest font-bold text-editorial-navy mb-1">
                {hoveredSpecial.txt}
              </p>
              <div className="w-full h-[1px] bg-editorial-border mb-2"></div>
              <p className="text-xs font-serif leading-relaxed text-editorial-ink italic">
                {hoveredSpecial.desc}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sección de créditos y leyenda */}
        <footer className="mt-12 flex flex-col lg:flex-row justify-between items-center gap-6 border-t border-editorial-border pt-6 text-[10px] uppercase tracking-[1px] text-editorial-ink">
          <div className="flex flex-wrap justify-center gap-4">
            {viewMode === 'festivos' ? (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-editorial-navy"></span> Día Festivo Oficial
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-editorial-green"></span> Celebración de Oficio
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-transparent border border-editorial-navy"></span> Día Actual
            </div>
          </div>

          <div className="hidden xl:block bg-editorial-gray px-4 py-2 rounded-[4px] italic text-[#555] lowercase first-letter:uppercase">
            Próximo evento: 20 de Julio — Independencia de Colombia
          </div>

          <div className="text-center lg:text-right">
            © {year} Guía Editorial • Bogotá
          </div>
        </footer>

        {/* Nueva sección: Sobre este calendario (Footer detallado) */}
        <section className="mt-20 border-t border-editorial-ink pt-10 mb-10 max-w-4xl">
          <h2 className="text-xl md:text-2xl font-serif font-bold italic mb-6">Sobre este calendario</h2>
          <p className="text-sm md:text-base leading-relaxed text-editorial-ink font-serif mb-6 opacity-80 decoration-editorial-border underline-offset-4">
            Este calendario es un proyecto independiente que estamos construyendo poco a poco, con el objetivo de reunir las principales festividades y fechas especiales de Colombia para el año 2026. Aún está en proceso de mejora, por lo que la información puede actualizarse o ajustarse con el tiempo. Te recomendamos visitar esta página de vez en cuando para mantenerte al día.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-6 h-[1px] bg-editorial-gold"></div>
            <p className="text-sm md:text-base font-serif italic text-editorial-navy font-bold">
              <span className="text-editorial-green">Gracias, su merced </span> ☕
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}


