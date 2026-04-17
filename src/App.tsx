import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// --- TIPOS Y ENUMS ---
type EventType = 'festivo' | 'profesion' | 'fiesta' | 'hoy';
type ViewMode = 'festivos' | 'profesiones' | 'fiestas';

interface SpecialDate {
  txt: string;
  cls: EventType;
  desc?: string;
}

interface SpecialDatesMap {
  [key: string]: SpecialDate[]; // Cambiado a array para soportar múltiples eventos por día
}

// --- CONFIGURACIÓN DE COLORES ---
const COLOR_MAP: Record<EventType, { bg: string, text: string, overlay: string }> = {
  festivo: { bg: 'bg-editorial-gold', text: 'text-editorial-ink', overlay: 'bg-editorial-gold/10' },
  profesion: { bg: 'bg-editorial-navy', text: 'text-white', overlay: 'bg-editorial-navy/10' },
  fiesta: { bg: 'bg-editorial-red', text: 'text-white', overlay: 'bg-editorial-red/10' },
  hoy: { bg: 'bg-transparent', text: 'text-editorial-navy', overlay: '' },
};

// --- HELPER PARA RANGOS DE FECHAS ---
const addRange = (map: SpecialDatesMap, start: string, end: string, txt: string, cls: EventType, desc?: string) => {
  const [sy, sm, sd] = start.split('-').map(Number);
  const [ey, em, ed] = end.split('-').map(Number);
  const startDate = new Date(sy, sm - 1, sd);
  const endDate = new Date(ey, em - 1, ed);
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const key = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!map[key]) map[key] = [];
    map[key].push({ txt, cls, desc });
  }
};

const addSingle = (map: SpecialDatesMap, date: string, txt: string, cls: EventType, desc?: string) => {
  const [m, d] = date.split('-').map(Number);
  const key = `${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  if (!map[key]) map[key] = [];
  map[key].push({ txt, cls, desc });
};

// --- FESTIVOS OFICIALES COLOMBIA 2026 ---
const FESTIVOS: SpecialDatesMap = {};
[
  ["01-01", "Año Nuevo", "Celebración del inicio del año calendario."],
  ["01-12", "Día de los Reyes Magos", "Celebración de la Epifanía."],
  ["03-23", "Día de San José", "Homenaje al patrono de los trabajadores."],
  ["04-02", "Jueves Santo", "Día de la Última Cena."],
  ["04-03", "Viernes Santo", "Pasión y muerte de Jesús."],
  ["05-01", "Día del Trabajo", "Derechos laborales."],
  ["05-18", "Día de la Ascensión", "Ascenso de Jesús al cielo."],
  ["06-08", "Corpus Christi", "Fiesta del Cuerpo y la Sangre de Cristo."],
  ["06-15", "Sagrado Corazón de Jesús", "Devoción al corazón de Jesús."],
  ["06-29", "San Pedro y San Pablo", "Celebración de los apóstoles."],
  ["07-20", "Grito de Independencia", "Firma del Acta de Independencia de 1810."],
  ["08-07", "Batalla de Boyacá", "Victoria decisiva de 1819."],
  ["08-17", "Asunción de la Virgen", "Asunción de María al cielo."],
  ["10-12", "Día de la Raza", "Diversidad Cultural."],
  ["11-02", "Día de todos los Santos", "Homenaje a los santos."],
  ["11-16", "Independencia de Cartagena", "Independencia de la ciudad heroica."],
  ["12-08", "Inmaculada Concepción", "Día de las Velitas."],
  ["12-25", "Navidad", "Nacimiento de Jesucristo."],
].forEach(([d, t, de]) => addSingle(FESTIVOS, d, t, 'festivo', de));

// --- PROFESIONES ---
const PROFESIONES: SpecialDatesMap = {};
[
  ["01-26", "Día del CM", "Community Managers."],
  ["02-09", "Día del Periodista", "Libertad de expresión."],
  ["02-21", "Guía de Turismo", "Embajadores locales."],
  ["03-01", "Contador Público", "Transparencia financiera."],
  ["03-19", "Hombre / Carpintero", "Homenaje a San José."],
  ["04-22", "Día de la Tierra", "Protección del planeta."],
  ["04-26", "Secretaria", "Labor administrativa."],
  ["04-27", "Diseñador Gráfico", "Creatividad visual."],
  ["05-12", "Enfermera", "Cuidado incondicional."],
  ["05-15", "Maestro", "Vocación educativa."],
  ["06-22", "Abogado / Zootecnista", "Derecho y producción animal."],
  ["07-03", "Economista", "Expertos en recursos."],
  ["08-11", "Nutricionista", "Salud alimenticia."],
  ["08-17", "Ingeniero", "Construcción de país."],
  ["09-13", "Programador", "Código del mundo."],
  ["10-03", "Odontólogo", "Salud oral."],
  ["10-27", "Arquitecto", "Diseño de espacios."],
  ["11-20", "Psicólogo", "Salud mental."],
  ["12-03", "Médico", "Protección de la vida."],
].forEach(([d, t, de]) => addSingle(PROFESIONES, d, t, 'profesion', de));

// --- FIESTAS Y EVENTOS (Basado en PDF) ---
const FIESTAS: SpecialDatesMap = {};
addRange(FIESTAS, "2026-01-02", "2026-01-07", "Carnaval de Negros y Blancos", 'fiesta', "Pasto: Patrimonio de la Humanidad.");
addRange(FIESTAS, "2026-01-05", "2026-01-11", "Feria de Manizales", 'fiesta', "La mejor feria de América.");
addRange(FIESTAS, "2026-01-29", "2026-02-01", "Hay Festival Cartagena", 'fiesta', "Encuentro literario y cultural.");
addRange(FIESTAS, "2026-02-14", "2026-02-17", "Carnaval de Barranquilla", 'fiesta', "¡Quien lo vive, es quien lo goza!");
addRange(FIESTAS, "2026-03-27", "2026-04-12", "Festival Iberoamericano de Teatro", 'fiesta', "Bogotá: El escenario del mundo.");
addRange(FIESTAS, "2026-03-29", "2026-04-05", "Semana Santa", 'fiesta', "Tradición y fe en varias ciudades.");
addRange(FIESTAS, "2026-04-29", "2026-05-03", "Festival de la Leyenda Vallenata", 'fiesta', "Valledupar: Tierra de acordeones.");
addRange(FIESTAS, "2026-06-14", "2026-06-30", "Festival del Bambuco", 'fiesta', "Neiva: Tradición opita.");
addRange(FIESTAS, "2026-06-21", "2026-06-30", "Fiestas de San Pedro", 'fiesta', "Folclor y alegría en el Huila.");
addRange(FIESTAS, "2026-07-15", "2026-07-20", "Festival Internacional de la Cultura", 'fiesta', "Boyacá: Arte y cultura.");
addRange(FIESTAS, "2026-08-01", "2026-08-10", "Feria de las Flores", 'fiesta', "Medellín: Desfile de Silleteros.");
addRange(FIESTAS, "2026-08-01", "2026-08-31", "Festival de Verano", 'fiesta', "Bogotá: Parques y recreación.");
addRange(FIESTAS, "2026-08-10", "2026-08-17", "Festival Petronio Álvarez", 'fiesta', "Cali: El Pacífico se siente.");
addRange(FIESTAS, "2026-08-15", "2026-08-17", "Festival del Viento y las Cometas", 'fiesta', "Villa de Leyva: Cielo de colores.");
addRange(FIESTAS, "2026-09-10", "2026-09-13", "Festival de Jazz de Mompox", 'fiesta', "Musica a orillas del Magdalena.");
addSingle(FIESTAS, "09-19", "Amor y Amistad", 'fiesta', "Día para celebrar con seres queridos.");
addSingle(FIESTAS, "10-31", "Halloween", 'fiesta', "Día de disfraces y dulces.");
addSingle(FIESTAS, "11-11", "Fiestas Independencia Cartagena", 'fiesta', "La heroica celebra su libertad.");
addRange(FIESTAS, "2026-11-11", "2026-11-16", "Reinado Nacional de la Belleza", 'fiesta', "Concurso de belleza en Cartagena.");
addRange(FIESTAS, "2026-11-14", "2026-11-16", "Rock al Parque", 'fiesta', "Bogotá: El festival gratuito más grande.");
addRange(FIESTAS, "2026-12-01", "2026-12-31", "Alumbrados Navideños", 'fiesta', "Medellín: Magia de luces.");
addRange(FIESTAS, "2026-12-25", "2026-12-30", "Feria de Cali", 'fiesta', "¡Salsa y alegría en la capital del Valle!");
addSingle(FIESTAS, "12-25", "Navidad", 'fiesta', "Celebración del nacimiento de Jesús.");

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
  viewMode: ViewMode;
  onDayClick: (info: string, day: number, month: number) => void;
  onHoverSpecial: (info: SpecialDate | null) => void;
}

const MonthCard: React.FC<MonthProps> = ({ monthIndex, year, today, viewMode, onDayClick, onHoverSpecial }) => {
  const monthName = new Intl.DateTimeFormat('es-CO', { month: 'long' }).format(new Date(year, monthIndex));
  
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, monthIndex, 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  const activeMap = viewMode === 'festivos' ? FESTIVOS : viewMode === 'profesiones' ? PROFESIONES : FIESTAS;

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
          const eventos = activeMap[dateKey] || [];
          const isToday = today.getDate() === day && today.getMonth() === monthIndex && today.getFullYear() === year;
          
          let cellClass = "h-5 flex items-center justify-center text-[11px] cursor-pointer transition-all duration-300 relative ";
          
          if (eventos.length > 0) {
            cellClass += `${COLOR_MAP[eventos[0].cls].bg} ${COLOR_MAP[eventos[0].cls].text} font-bold rounded-[2px] shadow-sm z-10`;
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
                e.stopPropagation();
                let info = "";
                if (eventos.length > 0) {
                  info = `${day} de ${monthName}: ${eventos.map(ev => ev.txt).join(' & ')}`;
                } else if (isToday) {
                  info = `Hoy es ${day} de ${monthName}, ¡día actual!`;
                } else {
                  info = `${day} de ${monthName}`;
                }
                onDayClick(info, day, monthIndex);
              }}
              onMouseEnter={() => eventos.length > 0 && onHoverSpecial(eventos[0])}
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
  const [viewMode, setViewMode] = useState<ViewMode>('festivos');
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

  // --- LÓGICA DE CONTADORES DINÁMICOS ---
  const holidayStats = useMemo(() => {
    const listH = Object.entries(FESTIVOS).flatMap(([key, items]) => {
      const [m, d] = key.split('-').map(Number);
      return items.map(val => ({ date: new Date(year, m - 1, d), ...val }));
    }).sort((a, b) => a.date.getTime() - b.date.getTime());

    const listF = Object.entries(FIESTAS).flatMap(([key, items]) => {
      const [m, d] = key.split('-').map(Number);
      return items.map(val => ({ date: new Date(year, m - 1, d), ...val }));
    }).sort((a, b) => a.date.getTime() - b.date.getTime());

    const futureH = listH.filter(h => h.date > today);
    const futureF = listF.filter(f => f.date > today);

    const getDaysDiff = (target: Date) => Math.ceil((target.getTime() - today.getTime()) / 86400000);

    const nextH = futureH[0];
    const nextF = futureF[0];
    
    // Conteo mensual de fiestas
    const currentMonthFiestas = listF.filter(f => f.date.getMonth() === today.getMonth() && f.date.getFullYear() === year);
    // Eliminar duplicados para el conteo por día si es el mismo evento
    const uniqueFestivalsThisMonth = new Set(currentMonthFiestas.map(f => f.txt)).size;

    return {
      nextDays: nextH ? getDaysDiff(nextH.date) : 0,
      remainingH: futureH.length,
      puenteDays: futureH.find(h => [1, 5].includes(h.date.getDay())) ? getDaysDiff(futureH.find(h => [1, 5].includes(h.date.getDay()))!.date) : 0,
      nextHName: nextH?.txt || "",
      puenteName: futureH.find(h => [1, 5].includes(h.date.getDay()))?.txt || "",
      fiestasMonth: uniqueFestivalsThisMonth,
      nextFName: nextF?.txt || "",
      nextFDays: nextF ? getDaysDiff(nextF.date) : 0
    };
  }, [today, year]);

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
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-editorial-ink pb-4 mb-4">
          <div className="title-group flex-1">
            <h1 className="text-4xl md:text-6xl font-serif font-black uppercase tracking-tighter leading-[0.9]">
              Colombia
            </h1>
            <p className="text-[10px] md:text-[11px] uppercase tracking-[2px] mt-2 opacity-70">
              Guía Editorial de Festividades y Fechas Especiales
            </p>
          </div>
          
          {/* Sistema de 3 Toggles */}
          <div className="flex flex-col items-center md:items-end gap-3 my-6 md:my-0 lg:mx-8">
            <span className="text-[10px] uppercase tracking-widest font-bold text-editorial-navy">Categorías</span>
            <div className="flex bg-editorial-gray rounded-full p-1 border border-editorial-ink/20 shadow-inner">
              {[
                { id: 'festivos', label: 'Festivos', color: 'bg-editorial-gold', text: 'text-editorial-ink' },
                { id: 'profesiones', label: 'Profesiones', color: 'bg-editorial-navy', text: 'text-white' },
                { id: 'fiestas', label: 'Fiestas', color: 'bg-editorial-red', text: 'text-white' }
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => {
                    setViewMode(btn.id as ViewMode);
                    setSelection(null);
                  }}
                  className={`px-4 py-1.5 rounded-full text-[9px] uppercase font-black tracking-tighter transition-all duration-300 ${viewMode === btn.id ? `${btn.color} ${btn.text} shadow-md scale-105` : 'text-editorial-ink/50 hover:text-editorial-ink'}`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          <div className="year-display font-serif text-6xl md:text-[82px] font-light leading-[0.7] text-editorial-navy mt-4 md:mt-0">
            {year}
          </div>
        </header>

        {/* Contadores Dinámicos */}
        {viewMode === 'festivos' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 h-auto animate-in fade-in duration-700">
            <div className="bg-editorial-gold/10 border-l-2 border-editorial-gold p-3">
              <p className="text-[9px] uppercase tracking-widest font-bold text-editorial-gold opacity-80">Próximo Festivo</p>
              <p className="text-xl font-serif italic text-editorial-ink leading-tight">Faltan <span className="font-bold">{holidayStats.nextDays}</span> días</p>
              <p className="text-[10px] opacity-70 mt-1">— {holidayStats.nextHName}</p>
            </div>
            <div className="bg-editorial-gold/10 border-l-2 border-editorial-gold p-3">
              <p className="text-[9px] uppercase tracking-widest font-bold text-editorial-gold opacity-80">Balance Anual</p>
              <p className="text-xl font-serif italic text-editorial-ink leading-tight">Quedan <span className="font-bold">{holidayStats.remainingH}</span> festivos</p>
              <p className="text-[10px] opacity-70 mt-1">en todo el {year}</p>
            </div>
            <div className="bg-editorial-gold/10 border-l-2 border-editorial-gold p-3">
              <p className="text-[9px] uppercase tracking-widest font-bold text-editorial-gold opacity-80">Próximo Puente</p>
              <p className="text-xl font-serif italic text-editorial-ink leading-tight">En <span className="font-bold">{holidayStats.puenteDays}</span> días</p>
              <p className="text-[10px] opacity-70 mt-1">— {holidayStats.puenteName}</p>
            </div>
          </div>
        )}

        {viewMode === 'fiestas' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 h-auto animate-in fade-in duration-700">
            <div className="bg-editorial-red/10 border-l-2 border-editorial-red p-3">
              <p className="text-[9px] uppercase tracking-widest font-bold text-editorial-red opacity-80">Temporada de Fiestas</p>
              <p className="text-xl font-serif italic text-editorial-ink leading-tight">Este mes hay <span className="font-bold">{holidayStats.fiestasMonth}</span> eventos</p>
              <p className="text-[10px] opacity-70 mt-1">¡Colombia está de fiesta!</p>
            </div>
            <div className="bg-editorial-red/10 border-l-2 border-editorial-red p-3 text-center md:text-left">
              <p className="text-[9px] uppercase tracking-widest font-bold text-editorial-red opacity-80">Próxima gran fiesta</p>
              <p className="text-xl font-serif italic text-editorial-ink leading-tight">{holidayStats.nextFName}</p>
              <p className="text-[10px] opacity-70 mt-1">en <span className="font-bold">{holidayStats.nextFDays}</span> días</p>
            </div>
            <div className="bg-editorial-red/10 border-l-2 border-editorial-red p-3">
              <p className="text-[9px] uppercase tracking-widest font-bold text-editorial-red opacity-80">Recomendación</p>
              <p className="text-xl font-serif italic text-editorial-ink leading-tight">Temporada alta de festivales</p>
              <p className="text-[10px] opacity-70 mt-1">¡Prepara tu viaje!</p>
            </div>
          </div>
        )}

        {/* Área Visual Dinámica */}
        <div className="min-h-[140px] flex flex-col items-center justify-center mb-8 gap-4 px-4 text-center">
          {selection ? (
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-2xl w-full">
              <div className="bg-editorial-gray border border-editorial-border py-2 px-6 rounded-sm self-center">
                <p className="text-[10px] uppercase tracking-widest font-bold opacity-60 mb-1">
                  Evento Detectado
                </p>
                <p className="text-sm md:text-lg font-serif italic text-editorial-ink">
                  {selection.info}
                </p>
              </div>
              
              <div className={`relative p-4 md:p-6 border-l-4 bg-white shadow-sm ring-1 ring-editorial-border/50 ${viewMode === 'fiestas' ? 'border-editorial-red' : viewMode === 'profesiones' ? 'border-editorial-navy' : 'border-editorial-gold'}`}>
                <p className="text-base md:text-xl font-serif italic leading-relaxed text-editorial-ink mb-2">
                  "{selection.phrase}"
                </p>
                <p className="text-[10px] uppercase tracking-[2px] font-bold text-editorial-navy text-right">
                   — {selection.author}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 opacity-30">
              <p className="text-[10px] uppercase tracking-[3px]">
                {viewMode === 'fiestas' ? 'Explora las ferias y carnavales' : viewMode === 'profesiones' ? 'Tributo a los oficios de Colombia' : 'Seleccione un festivo oficial'}
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
            <div className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${COLOR_MAP.festivo.bg}`}></span> Festivos (Amarillo)
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${COLOR_MAP.profesion.bg}`}></span> Profesiones (Azul)
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${COLOR_MAP.fiesta.bg}`}></span> Fiestas (Rojo)
            </div>
            <div className="flex items-center gap-1.5 opacity-50">
              <span className="w-2.5 h-2.5 rounded-full bg-transparent border border-editorial-navy"></span> Día Actual
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
            {viewMode === 'fiestas' ? (
              "Este calendario de festividades se encuentra en mejora continua. Colombia cuenta con una gran diversidad de celebraciones, por lo que seguimos agregando más eventos progresivamente."
            ) : (
              "Este calendario es un proyecto independiente que estamos construyendo poco a poco, con el objetivo de reunir las principales festividades y fechas especiales de Colombia para el año 2026. Aún está en proceso de mejora, por lo que la información puede actualizarse o ajustarse con el tiempo. Te recomendamos visitar esta página de vez en cuando para mantenerte al día."
            )}
          </p>
          <div className="flex items-center gap-2">
            <div className="w-6 h-[1px] bg-editorial-gold"></div>
            <p className="text-sm md:text-base font-serif italic text-editorial-navy font-bold">
              <span className="text-editorial-green">
                {viewMode === 'fiestas' ? "¡Bacano, gracias! " : "Gracias, su merced "}
              </span> 
              {viewMode === 'fiestas' ? "👍" : "☕"}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}


