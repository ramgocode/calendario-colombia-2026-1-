import React, { useState } from 'react';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// --- TIPOS Y ENUMS ---
type EventType = 'festivo' | 'independencia' | 'semanasanta' | 'valentin' | 'hoy';

interface SpecialDate {
  txt: string;
  cls: EventType;
}

interface SpecialDatesMap {
  [key: string]: SpecialDate; // Formato "MM-DD"
}

// --- CONFIGURACIÓN DE COLORES ---
// Usando variables de tema definidas en index.css
const COLOR_MAP: Record<EventType, { bg: string, text: string, overlay: string }> = {
  festivo: { bg: 'bg-editorial-navy', text: 'text-white', overlay: 'bg-editorial-navy/10' },
  independencia: { bg: 'bg-editorial-gold', text: 'text-editorial-ink', overlay: 'bg-editorial-gold/10' },
  semanasanta: { bg: 'bg-editorial-purple', text: 'text-white', overlay: 'bg-editorial-purple/10' },
  valentin: { bg: 'bg-[#E91E63]', text: 'text-white', overlay: 'bg-[#E91E63]/10' },
  hoy: { bg: 'bg-transparent', text: 'text-editorial-navy', overlay: '' },
};

// --- DATOS ESPECIALES (Calendario Colombia 2026) ---
const ESPECIALES: SpecialDatesMap = {
  // Enero
  "01-01": { txt: "Año Nuevo", cls: "festivo" },
  "01-12": { txt: "Día de los Reyes Magos", cls: "festivo" },
  // Febrero
  "02-14": { txt: "San Valentín", cls: "valentin" },
  // Marzo
  "03-23": { txt: "Día de San José", cls: "festivo" },
  "03-29": { txt: "Domingo de Ramos", cls: "semanasanta" },
  "03-30": { txt: "Lunes Santo", cls: "semanasanta" },
  "03-31": { txt: "Martes Santo", cls: "semanasanta" },
  // Abril
  "04-01": { txt: "Miércoles Santo", cls: "semanasanta" },
  "04-02": { txt: "Jueves Santo", cls: "festivo" },
  "04-03": { txt: "Viernes Santo", cls: "festivo" },
  "04-04": { txt: "Sábado de Gloria", cls: "semanasanta" },
  "04-05": { txt: "Domingo de Resurrección", cls: "semanasanta" },
  // Mayo
  "05-01": { txt: "Día del Trabajo", cls: "festivo" },
  "05-18": { txt: "Día de la Ascensión", cls: "festivo" },
  // Junio
  "06-08": { txt: "Corpus Christi", cls: "festivo" },
  "06-15": { txt: "Sagrado Corazón", cls: "festivo" },
  "06-29": { txt: "San Pedro y San Pablo", cls: "festivo" },
  // Julio
  "07-20": { txt: "Independencia de Colombia", cls: "independencia" },
  // Agosto
  "08-07": { txt: "Batalla de Boyacá", cls: "independencia" },
  "08-17": { txt: "Asunción de la Virgen", cls: "festivo" },
  // Octubre
  "10-12": { txt: "Día de la Raza", cls: "festivo" },
  "10-31": { txt: "Halloween", cls: "valentin" },
  // Noviembre
  "11-02": { txt: "Día de todos los Santos", cls: "festivo" },
  "11-16": { txt: "Independencia de Cartagena", cls: "festivo" },
  // Diciembre
  "12-08": { txt: "Inmaculada Concepción", cls: "festivo" },
  "12-25": { txt: "Navidad", cls: "festivo" },
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
  onDayClick: (info: string, day: number, month: number) => void;
  onHoverSpecial: (cls: EventType | null) => void;
}

const MonthCard: React.FC<MonthProps> = ({ monthIndex, year, today, onDayClick, onHoverSpecial }) => {
  const monthName = new Intl.DateTimeFormat('es-CO', { month: 'long' }).format(new Date(year, monthIndex));
  
  // Calcular días del mes
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, monthIndex, 1).getDay(); // 0 (Dom) a 6 (Sab)

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfWeek }, (_, i) => i);

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
          const especial = ESPECIALES[dateKey];
          const isToday = today.getDate() === day && today.getMonth() === monthIndex && today.getFullYear() === year;
          
          let cellClass = "h-5 flex items-center justify-center text-[11px] cursor-pointer transition-colors duration-200 relative ";
          
          if (especial) {
            cellClass += `${COLOR_MAP[especial.cls].bg} ${COLOR_MAP[especial.cls].text} font-bold rounded-[2px]`;
          } else if (isToday) {
            cellClass += "outline-1 outline-editorial-navy text-editorial-navy font-bold rounded-[2px]";
          } else {
            cellClass += "text-editorial-ink hover:bg-editorial-gray";
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
              onMouseEnter={() => especial && onHoverSpecial(especial.cls)}
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
  const [hoverCls, setHoverCls] = useState<EventType | null>(null);

  const months = Array.from({ length: 12 }, (_, i) => i);

  const handleDayClick = (info: string, day: number, month: number) => {
    const dayOfYear = DAYS_BEFORE_MONTH[month] + day;
    const phraseIndex = (dayOfYear - 1) % 10;
    const phraseData = FRASES_CICLO[phraseIndex];
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
          <div className="title-group">
            <h1 className="text-4xl md:text-6xl font-serif font-black uppercase tracking-tighter leading-[0.9]">
              Colombia
            </h1>
            <p className="text-[10px] md:text-[11px] uppercase tracking-[2px] mt-2 opacity-70">
              Guía Editorial de Festividades y Fechas Especiales
            </p>
          </div>
          <div className="year-display font-serif text-6xl md:text-[82px] font-light leading-[0.7] text-editorial-navy mt-4 md:mt-0">
            {year}
          </div>
        </header>

        {/* Área Visual Dinámica: Muestra la fecha seleccionada y la frase del día */}
        <div className="min-h-[140px] flex flex-col items-center justify-center mb-8 gap-4 px-4 text-center">
          {selection ? (
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-2xl">
              <div className="bg-editorial-gray border border-editorial-border py-2 px-6 rounded-sm self-center">
                <p className="text-xs uppercase tracking-widest font-bold opacity-60 mb-1">Fecha & Evento</p>
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
              <p className="text-[10px] uppercase tracking-[3px]">Seleccione una fecha</p>
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
              onDayClick={handleDayClick}
              onHoverSpecial={(cls) => setHoverCls(cls)}
            />
          ))}
        </div>

        {/* Sección de créditos y leyenda */}
        <footer className="mt-12 flex flex-col lg:flex-row justify-between items-center gap-6 border-t border-editorial-border pt-6 text-[10px] uppercase tracking-[1px] text-editorial-ink">
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-editorial-navy"></span> Festivo
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-editorial-gold"></span> Histórico
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-transparent border border-editorial-navy"></span> Hoy
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


