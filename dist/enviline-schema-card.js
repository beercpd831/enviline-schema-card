/*
 * EnviLine Schema Card
 * Live hydraulic and refrigerant diagram for a Nefit-Bosch EnviLine Tower
 * heat pump read through EMS-ESP. Entities are auto-detected from the
 * EMS-ESP names and can be overridden per item in the card config.
 */
const CARD_VERSION = "0.7.0";

// SVG coordinate system (viewBox 0 -25 1060 770). Label positions are given
// in SVG units and converted to percentages of the card.
const VB_X = 0, VB_Y = -25, VB_W = 1060, VB_H = 770;
const pctX = (x) => ((x - VB_X) / VB_W) * 100;
const pctY = (y) => ((y - VB_Y) / VB_H) * 100;

const C = {
  suction: "#4fc3f7",
  discharge: "#ff7043",
  liquid: "#ffb74d",
  flow: "#e53935",
  floor: "#e57373",
  ret: "#1e88e5",
  neutral: "#9e9e9e",
  air: "#90a4ae",
  amber: "#ffc107",
  room: "#66bb6a",
  idle: "#b0bec5",
};

// Saturation pressure fits ln(p / bar abs) = A - B / (T + C), T in °C,
// fitted to refrigerant tables from -30 to 60 °C (error below 0.5 %).
const REFRIGERANTS = {
  R410A: [10.5455, 2248.41, 265.5],
  R32: [10.6461, 2274.77, 266.0],
  R290: [9.6478, 2140.6, 264.5],
};

// key: [domain, EMS-ESP suffix used for auto-detection]
const ENTITY_DEFS = {
  outdoortemp: ["sensor", "outdoortemp"],
  hpmode: ["select", "hc1_hpmode"],
  hpactivity: ["sensor", "hpactivity"],
  hptl2: ["sensor", "hptl2"],
  hpta4: ["sensor", "hpta4"],
  hpea0: ["binary_sensor", "hpea0"],
  hppl1: ["sensor", "hppl1"],
  hptr5: ["sensor", "hptr5"],
  hpph1: ["sensor", "hpph1"],
  hptr6: ["sensor", "hptr6"],
  superheat_suction: ["sensor", null],
  superheat_discharge: ["sensor", null],
  hpcompspd: ["sensor", "hpcompspd"],
  hptr1: ["sensor", "hptr1"],
  hptr3: ["sensor", "hptr3"],
  hptr4: ["sensor", "hptr4"],
  hp4way: ["binary_sensor", "hp4way"],
  hptc3: ["sensor", "hptc3"],
  hptc1: ["sensor", "hptc1"],
  hptc0: ["sensor", "hptc0"],
  hppower: ["sensor", "hppower"],
  electric_power: ["sensor", null],
  cop: ["sensor", null],
  nrgsupptotal: ["sensor", "nrgsupptotal"],
  nrgconstotal: ["sensor", "nrgconstotal"],
  auxheaterstatus: ["sensor", "auxheaterstatus"],
  ww3wayvalve: ["binary_sensor", "ww3wayvalve"],
  wwcurtemp: ["sensor", "wwcurtemp"],
  hptw1: ["sensor", "hptw1"],
  heatingpump: ["binary_sensor", "heatingpump"],
  hpcircspd: ["sensor", "hpcircspd"],
  vc0valve: ["switch", "vc0valve"],
  curflowtemp: ["sensor", "curflowtemp"],
  targetflowtemp: ["sensor", "hc1_targetflowtemp"],
  headertemp: ["sensor", "headertemp"],
  pc1on: ["binary_sensor", "pc1on"],
  currtemp: ["sensor", "hc1_currtemp"],
  seltemp: ["number", "hc1_seltemp"],
  dampedoutdoortemp: ["sensor", "dampedoutdoortemp"],
};

const I18N = {
  nl: {
    history: "klik voor sensor geschiedenis",
    outdoor_unit: "Buitenunit (monoblock)",
    tower: "EnviLine Tower",
    house: "Woning",
    evaporator: "Verdamper",
    drain_pan: "Afvoerbak",
    fourway: "4-wegklep",
    compressor: "Compressor",
    eev: "Expansieventiel",
    condenser: "Condensor",
    floor: "Vloerverwarming",
    buffer: "Buffervat",
    backup: "Bijverwarming",
    threeway: "3-wegklep",
    dhw: "Warm water",
    cop_calc: "COP (berekend uit warmte en elektrisch vermogen)",
    legend_p: "PL1 / PH1 = druksensor, omgerekend naar verzadigingstemperatuur",
    legend_p_ref: "PL1 / PH1 = druksensor: bar (abs., {r}) en verzadigingstemp.",
    pressure_note: "Druk absoluut, berekend uit de verzadigingstemperatuur voor {r}",
    legend_t: "TR5 / TR6 = gemeten gastemperatuur · Overv. = TR − P",
    d: {
      outdoortemp: ["Buiten ", "Buitentemperatuur (sensor warmtepomp)"],
      hpmode: ["", "Modus warmtepomp (instelling)"],
      hpactivity: ["WP ", "Compressoractiviteit"],
      hptl2: ["TL2 ", "TL2 - Temperatuur luchtinlaat"],
      hpta4: ["TA4 ", "TA4 - Temperatuur condensaat-afvoerbak"],
      hpea0: ["Verw. ", "EA0 - Verwarming afvoerbak"],
      hppl1: ["PL1 ", "PL1 - Lagedruksensor, omgerekend naar verzadigingstemperatuur (verdampingstemperatuur)"],
      hptr5: ["TR5 ", "TR5 - Gemeten zuiggastemperatuur (compressor in)"],
      hpph1: ["PH1 ", "PH1 - Hogedruksensor, omgerekend naar verzadigingstemperatuur (condensatietemperatuur)"],
      hptr6: ["TR6 ", "TR6 - Gemeten persgastemperatuur (compressor uit)"],
      superheat_suction: ["Overv. ", "Oververhitting zuiggas = TR5 - PL1 (normaal enkele K)"],
      superheat_discharge: ["Overv. ", "Oververhitting persgas = TR6 - PH1"],
      hpcompspd: ["Compressor ", "Snelheid compressor"],
      hptr1: ["TR1 ", "TR1 - Compressortemperatuur"],
      hptr3: ["TR3 ", "TR3 - Temperatuur koudemiddel vloeistofzijde"],
      hptr4: ["TR4 ", "TR4 - Verdamper ingangstemperatuur"],
      hp4way: ["", "VR4 - 4-wegklep (uit = verwarmen)"],
      hptc3: ["TC3 ", "TC3 - Aanvoer uit condensor (water, buitenunit)"],
      hptc1: ["TC1 ", "TC1 - Aanvoer in Tower (voor bijverwarming)"],
      hptc0: ["TC0 ", "TC0 - Retour naar warmtepomp (in Tower, na pomp)"],
      hppower: ["Warmte ", "Afgegeven warmtevermogen"],
      electric_power: ["Elektrisch ", "Elektrisch vermogen warmtepomp"],
      cop: ["COP ", "COP - warmte gedeeld door elektrisch vermogen"],
      scop: ["SCOP ", "Seizoens-COP sinds installatie: opgewekte energie gedeeld door energieverbruik (EMS-ESP-tellers, inclusief bijverwarming)"],
      nrgsupptotal: ["", "Totaal opgewekte energie (EMS-ESP)"],
      nrgconstotal: ["", "Totaal energieverbruik (EMS-ESP)"],
      auxheaterstatus: ["", "Status elektrische bijverwarming"],
      ww3wayvalve: ["", "3-wegklep warm water"],
      wwcurtemp: ["Boven ", "Warm water - interne temperatuur"],
      hptw1: ["TW1 ", "TW1 - Temperatuur warmwatervat (midden)"],
      heatingpump: ["", "Pomp warmtepomp-circuit (primair)"],
      hpcircspd: ["Pomp ", "Snelheid circulatiepomp warmtepomp-circuit"],
      vc0valve: ["VC0 ", "VC0 - Bypassklep (aan = bypass)"],
      curflowtemp: ["Buffer T0 ", "T0 - Aanvoertemperatuur, bovenin het buffervat (zelfde sensor als headertemp)"],
      targetflowtemp: ["Berekend ", "Berekende aanvoertemperatuur (stooklijn)"],
      headertemp: ["Buffer ", "Temperatuur buffervat / open verdeler (reserve voor T0, zelfde sensor)"],
      pc1on: ["", "Circulatiepomp vloerverwarming (PC1)"],
      currtemp: ["Kamer ", "Huidige kamertemperatuur"],
      seltemp: ["Setpoint ", "Thermostaat setpoint kamer"],
      dampedoutdoortemp: ["Gedempt buiten ", "Gedempte buitentemperatuur"],
    },
  },
  en: {
    history: "click for sensor history",
    outdoor_unit: "Outdoor unit (monobloc)",
    tower: "EnviLine Tower",
    house: "House",
    evaporator: "Evaporator",
    drain_pan: "Drain pan",
    fourway: "4-way valve",
    compressor: "Compressor",
    eev: "Expansion valve",
    condenser: "Condenser",
    floor: "Underfloor heating",
    buffer: "Buffer tank",
    backup: "Backup heater",
    threeway: "3-way valve",
    dhw: "Hot water",
    cop_calc: "COP (calculated from heat output and electrical power)",
    legend_p: "PL1 / PH1 = pressure sensor, shown as saturation temperature",
    legend_p_ref: "PL1 / PH1 = pressure sensor: bar (abs., {r}) and saturation temp.",
    pressure_note: "Absolute pressure, calculated from the saturation temperature for {r}",
    legend_t: "TR5 / TR6 = measured gas temperature · SH = TR − P",
    d: {
      outdoortemp: ["Outdoor ", "Outdoor temperature (heat pump sensor)"],
      hpmode: ["", "Heat pump mode (setting)"],
      hpactivity: ["HP ", "Compressor activity"],
      hptl2: ["TL2 ", "TL2 - Air inlet temperature"],
      hpta4: ["TA4 ", "TA4 - Drain pan temperature"],
      hpea0: ["Heat ", "EA0 - Drain pan heater"],
      hppl1: ["PL1 ", "PL1 - Low pressure sensor, shown as saturation temperature (evaporating temperature)"],
      hptr5: ["TR5 ", "TR5 - Measured suction gas temperature (compressor inlet)"],
      hpph1: ["PH1 ", "PH1 - High pressure sensor, shown as saturation temperature (condensing temperature)"],
      hptr6: ["TR6 ", "TR6 - Measured discharge gas temperature (compressor outlet)"],
      superheat_suction: ["SH ", "Suction superheat = TR5 - PL1 (normally a few K)"],
      superheat_discharge: ["SH ", "Discharge superheat = TR6 - PH1"],
      hpcompspd: ["Compressor ", "Compressor speed"],
      hptr1: ["TR1 ", "TR1 - Compressor temperature"],
      hptr3: ["TR3 ", "TR3 - Refrigerant liquid side temperature"],
      hptr4: ["TR4 ", "TR4 - Evaporator inlet temperature"],
      hp4way: ["", "VR4 - 4-way valve (off = heating)"],
      hptc3: ["TC3 ", "TC3 - Condenser water outlet (outdoor unit)"],
      hptc1: ["TC1 ", "TC1 - Flow in Tower (before backup heater)"],
      hptc0: ["TC0 ", "TC0 - Return to heat pump (in Tower, after pump)"],
      hppower: ["Heat ", "Heat output"],
      electric_power: ["Electric ", "Heat pump electrical power"],
      cop: ["COP ", "COP - heat output divided by electrical power"],
      scop: ["SCOP ", "Seasonal COP since installation: energy supplied divided by energy consumed (EMS-ESP counters, backup heater included)"],
      nrgsupptotal: ["", "Total energy supplied (EMS-ESP)"],
      nrgconstotal: ["", "Total energy consumed (EMS-ESP)"],
      auxheaterstatus: ["", "Electric backup heater status"],
      ww3wayvalve: ["", "Hot water 3-way valve"],
      wwcurtemp: ["Top ", "Hot water - internal temperature"],
      hptw1: ["TW1 ", "TW1 - Hot water tank temperature (middle)"],
      heatingpump: ["", "Heat pump circuit pump (primary)"],
      hpcircspd: ["Pump ", "Heat pump circuit pump speed"],
      vc0valve: ["VC0 ", "VC0 - Bypass valve (on = bypass)"],
      curflowtemp: ["Buffer T0 ", "T0 - Flow temperature, top of the buffer tank (same sensor as headertemp)"],
      targetflowtemp: ["Target ", "Calculated flow temperature (heating curve)"],
      headertemp: ["Buffer ", "Buffer tank / low-loss header temperature (fallback for T0, same sensor)"],
      pc1on: ["", "Underfloor heating pump (PC1)"],
      currtemp: ["Room ", "Current room temperature"],
      seltemp: ["Setpoint ", "Room setpoint"],
      dampedoutdoortemp: ["Damped outdoor ", "Damped outdoor temperature"],
    },
  },
};

// Labels: [key, x, y, primary?, border colour]
const LABELS = [
  ["outdoortemp", 80, 95, true, C.air],
  ["hpmode", 240, 128, true, C.amber],
  ["hpactivity", 370, 95, true, C.amber],
  ["hptl2", 80, 125, false, C.air],
  ["hpta4", 80, 585, false, C.air],
  ["hpea0", 80, 607, false, C.amber],
  ["hppl1", 155, 215, false, C.suction],
  ["hptr5", 155, 250, false, C.suction],
  ["superheat_suction", 155, 275, false, C.suction],
  ["hpph1", 328, 182, false, C.discharge],
  ["hptr6", 328, 217, false, C.discharge],
  ["superheat_discharge", 328, 242, false, C.discharge],
  ["hpcompspd", 240, 377, true, C.amber],
  ["hptr1", 240, 401, false, C.neutral],
  ["electric_power", 258, 464, true, C.amber],
  ["hppower", 258, 489, true, C.amber],
  ["cop", 258, 514, true, C.amber],
  ["scop", 258, 539, true, C.amber],
  ["hptr3", 320, 607, false, C.liquid],
  ["hptr4", 180, 607, false, C.liquid],
  ["hptc3", 435, 230, true, C.flow],
  ["hptc1", 585, 230, true, C.flow],
  ["hptc0", 580, 640, true, C.ret],
  ["auxheaterstatus", 580, 335, false, C.neutral],
  ["wwcurtemp", 610, 410, false, C.floor, true],
  ["hptw1", 610, 460, false, C.floor],
  ["hpcircspd", 610, 674, false, C.ret],
  ["vc0valve", 750, 648, false, C.neutral],
  ["curflowtemp", 885, 232, true, C.flow],
  ["targetflowtemp", 885, 204, true, C.discharge],
  ["currtemp", 920, 82, true, C.room],
  ["seltemp", 920, 107, true, C.room],
  ["dampedoutdoortemp", 920, 129, false, C.air],
];

// Flow arrows: [id, x, y, angle (0 = right), colour]
const ARROWS = [
  ["r_suc_h", 168, 128, 0, C.suction],
  ["r_dis_h", 335, 128, 0, C.discharge],
  ["r_suc_c", 168, 128, 180, C.discharge],
  ["r_dis_c", 335, 128, 180, C.suction],
  ["r_liq1_h", 345, 580, 180, C.liquid],
  ["r_liq2_h", 155, 580, 180, C.liquid],
  ["r_liq1_c", 345, 580, 0, C.liquid],
  ["r_liq2_c", 155, 580, 0, C.liquid],
  ["w_flow", 652, 295, 0, C.flow],
  ["w_ch", 728, 295, 0, C.flow],
  ["w_dhw", 690, 342, 90, C.flow],
  ["w_buf", 800, 295, 0, C.flow],
  ["w_ret", 792, 550, 90, C.ret],
  ["w_byp", 755, 480, 90, C.flow],
];

const arrowSvg = ([id, x, y, a, col]) =>
  `<polygon id="${id}" class="arrow" points="7,0 -6,-7 -6,7" fill="${col}" transform="translate(${x} ${y}) rotate(${a})"/>`;

function buildSvg(t, ref) {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VB_X} ${VB_Y} ${VB_W} ${VB_H}" font-family="sans-serif">
  <defs>
    <marker id="ah" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" fill="#9e9e9e"/>
    </marker>
  </defs>
  <rect x="20" y="60" width="480" height="670" rx="16" fill="#9e9e9e" fill-opacity="0.07" stroke="#9e9e9e" stroke-opacity="0.5" stroke-width="2"/>
  <rect x="530" y="60" width="250" height="670" rx="16" fill="#9e9e9e" fill-opacity="0.07" stroke="#9e9e9e" stroke-opacity="0.5" stroke-width="2"/>
  <rect x="800" y="60" width="240" height="670" rx="16" fill="#9e9e9e" fill-opacity="0.07" stroke="#9e9e9e" stroke-opacity="0.5" stroke-width="2" stroke-dasharray="6 6"/>
  <g class="txt" font-size="15" font-weight="bold">
    <text x="36" y="44">${t.outdoor_unit}</text>
    <text x="538" y="44">${t.tower}</text>
    <text x="808" y="44">${t.house}</text>
  </g>
  <g stroke="#9e9e9e" stroke-width="2" marker-end="url(#ah)">
    <line x1="24" y1="260" x2="46" y2="260"/><line x1="24" y1="350" x2="46" y2="350"/><line x1="24" y1="440" x2="46" y2="440"/>
  </g>
  <rect x="50" y="170" width="60" height="360" rx="4" fill="#4fc3f7" fill-opacity="0.15" stroke="#4fc3f7" stroke-width="2"/>
  <g stroke="#4fc3f7" stroke-opacity="0.6" stroke-width="1.5">
    <line x1="50" y1="200" x2="110" y2="200"/><line x1="50" y1="230" x2="110" y2="230"/>
    <line x1="50" y1="260" x2="110" y2="260"/><line x1="50" y1="290" x2="110" y2="290"/>
    <line x1="50" y1="320" x2="110" y2="320"/><line x1="50" y1="350" x2="110" y2="350"/>
    <line x1="50" y1="380" x2="110" y2="380"/><line x1="50" y1="410" x2="110" y2="410"/>
    <line x1="50" y1="440" x2="110" y2="440"/><line x1="50" y1="470" x2="110" y2="470"/>
    <line x1="50" y1="500" x2="110" y2="500"/>
  </g>
  <g class="txt" font-size="12" text-anchor="middle">
    <text x="80" y="162">${t.evaporator}</text>
    <text x="80" y="632">${t.drain_pan}</text>
    <text x="240" y="104">${t.fourway}</text>
    <text x="312" y="350">${t.compressor}</text>
    <text x="240" y="544">${t.eev}</text>
    <text x="375" y="400" transform="rotate(-90 375 400)">${t.condenser}</text>
    <text x="845" y="540">${t.buffer}</text>
    <text x="594" y="264">${t.backup}</text>
    <text x="684" y="648">${t.threeway}</text>
    <text x="600" y="362">${t.dhw}</text>
    <text x="950" y="525" font-size="13">${t.floor}</text>
  </g>
  <path id="fw_a" d="M185 128 H150 V180 H110" fill="none" stroke="${C.idle}" stroke-width="4"/>
  <path id="fw_b" d="M295 128 H375 V290" fill="none" stroke="${C.idle}" stroke-width="4"/>
  <path d="M200 145 V320 H205" fill="none" stroke="#4fc3f7" stroke-width="4"/>
  <path d="M275 320 H280 V145" fill="none" stroke="#ff7043" stroke-width="4"/>
  <path d="M375 510 V580 H262" fill="none" stroke="#ffb74d" stroke-width="4"/>
  <path d="M218 580 H132 V520 H110" fill="none" stroke="#ffb74d" stroke-width="4"/>
  <path d="M38 538 L46 564 H114 L122 538" fill="#4fc3f7" fill-opacity="0.12" stroke="#9e9e9e" stroke-width="2" stroke-linejoin="round"/>
  <path d="M52 556 l5 -7 l5 7 l5 -7 l5 7 l5 -7 l5 7 l5 -7 l5 7 l5 -7 l5 7 l5 -7 l5 7" fill="none" stroke="#ffca28" stroke-width="2"/>
  <rect x="185" y="111" width="110" height="34" rx="5" fill="#9e9e9e" fill-opacity="0.15" stroke="#9e9e9e" stroke-width="2"/>
  <g class="click" data-key="hpcompspd">
    <circle cx="240" cy="320" r="35" fill="#9e9e9e" fill-opacity="0.12" stroke="#9e9e9e" stroke-width="3"/>
    <path d="M211 300 L268 311 M211 340 L268 329" fill="none" stroke="#9e9e9e" stroke-width="2.5"/>
  </g>
  <path d="M220 570 L240 580 L220 590 ZM260 570 L240 580 L260 590 Z" fill="none" stroke="#9e9e9e" stroke-width="1.8" stroke-linejoin="round"/>
  <line x1="224" y1="596" x2="254" y2="566" stroke="#9e9e9e" stroke-width="1.6"/>
  <path d="M258 562 L249 565 L255 571 Z" fill="#9e9e9e"/>
  <line x1="240" y1="580" x2="240" y2="568" stroke="#9e9e9e" stroke-width="1.6"/>
  <rect x="232" y="552" width="16" height="16" rx="2" fill="none" stroke="#9e9e9e" stroke-width="1.6"/>
  <text x="240" y="564.5" fill="#9e9e9e" font-size="11" font-weight="bold" text-anchor="middle">M</text>
  <rect x="350" y="290" width="50" height="220" rx="4" fill="#ff7043" fill-opacity="0.12" stroke="#ff7043" stroke-width="2"/>
  <g stroke="#ff7043" stroke-opacity="0.5" stroke-width="1.5">
    <line x1="350" y1="320" x2="400" y2="340"/><line x1="350" y1="360" x2="400" y2="380"/>
    <line x1="350" y1="400" x2="400" y2="420"/><line x1="350" y1="440" x2="400" y2="460"/>
    <line x1="350" y1="475" x2="400" y2="495"/>
  </g>
  <path d="M400 295 H558" fill="none" stroke="#e53935" stroke-width="5"/>
  <path d="M602 295 H820" fill="none" stroke="#e53935" stroke-width="5"/>
  <path d="M690 295 V370" fill="none" stroke="#e53935" stroke-width="5"/>
  <path d="M870 295 H904" fill="none" stroke="#e57373" stroke-width="4"/>
  <path d="M936 295 H1010 V325 H895 V355 H1010 V385 H895 V415 H1010 V445 H895 V475 H1010 V500 H870" fill="none" stroke="#e57373" stroke-width="4" stroke-linejoin="round"/>
  <path d="M820 500 H792 V600 H771" fill="none" stroke="#1e88e5" stroke-width="5"/>
  <path d="M739 600 H706" fill="none" stroke="#1e88e5" stroke-width="5"/>
  <path d="M674 600 H626" fill="none" stroke="#1e88e5" stroke-width="5"/>
  <path d="M594 600 H515 V485 H400" fill="none" stroke="#1e88e5" stroke-width="5"/>
  <rect x="820" y="260" width="50" height="260" rx="22" fill="#9e9e9e" fill-opacity="0.15" stroke="#9e9e9e" stroke-width="2"/>
  <rect x="822" y="262" width="46" height="120" rx="20" fill="#e53935" fill-opacity="0.15"/>
  <rect x="822" y="400" width="46" height="118" rx="20" fill="#1e88e5" fill-opacity="0.15"/>
  <path d="M690 550 V584" fill="none" stroke="#1e88e5" stroke-width="5"/>
  <path d="M755 295 V584" fill="none" stroke="#e53935" stroke-width="3" stroke-dasharray="7 4"/>
  <g class="click" data-key="vc0valve">
    <g fill="none" stroke="#9e9e9e" stroke-width="1.8" stroke-linejoin="round">
      <path class="port open" d="M739 590 L755 600 L739 610 Z"/>
      <path id="vc0_ab" class="port" d="M771 590 L755 600 L771 610 Z"/>
      <path id="vc0_byp" class="port" d="M745 584 L755 600 L765 584 Z"/>
    </g>
    <line x1="755" y1="600" x2="755" y2="612" stroke="#9e9e9e" stroke-width="1.8"/><circle cx="755" cy="618" r="6" fill="none" stroke="#9e9e9e" stroke-width="1.8"/>
  </g>
  <path d="M558 295 L580 273 L602 295 L580 317 Z" fill="#ffca28" fill-opacity="0.25" stroke="#ffca28" stroke-width="2" stroke-linejoin="round"/>
  <g fill="#ffca28"><path d="M574 279 L586 279 L580 289 Z"/><path d="M574 311 L586 311 L580 301 Z"/></g>
  <g class="click" data-key="ww3wayvalve">
    <g fill="none" stroke="#9e9e9e" stroke-width="1.8" stroke-linejoin="round">
      <path class="port open" d="M674 590 L690 600 L674 610 Z"/>
      <path id="w3_ch" class="port" d="M706 590 L690 600 L706 610 Z"/>
      <path id="w3_dhw" class="port" d="M680 584 L690 600 L700 584 Z"/>
    </g>
    <line x1="690" y1="600" x2="690" y2="612" stroke="#9e9e9e" stroke-width="1.8"/><circle cx="690" cy="618" r="6" fill="none" stroke="#9e9e9e" stroke-width="1.8"/>
  </g>
  <rect x="560" y="370" width="160" height="180" rx="30" fill="#e53935" fill-opacity="0.08" stroke="#9e9e9e" stroke-width="2"/>
  <path d="M690 370 V395 L660 407 L700 419 L660 431 L700 443 L660 455 L700 467 L660 479 L700 491 L660 503 L700 515 L690 525 V550" fill="none" stroke="#e57373" stroke-width="3" stroke-linejoin="round"/>
  <g class="click" data-key="heatingpump">
    <circle cx="610" cy="600" r="16" fill="#1e88e5" fill-opacity="0.2" stroke="#1e88e5" stroke-width="2"/>
    <polygon id="pump_hp" class="pump" points="10,0 -7,-10 -7,10" transform="translate(610 600) rotate(180)"/>
  </g>
  <g class="click" data-key="pc1on">
    <circle cx="920" cy="295" r="16" fill="#e53935" fill-opacity="0.2" stroke="#e53935" stroke-width="2"/>
    <polygon id="pump_pc1" class="pump" points="10,0 -7,-10 -7,10" transform="translate(920 295)"/>
  </g>
  <g class="dot">
    <line x1="185" y1="215" x2="200" y2="215" stroke="#4fc3f7"/><circle cx="200" cy="215" r="3.5" fill="#4fc3f7"/>
    <line x1="295" y1="182" x2="280" y2="182" stroke="#ff7043"/><circle cx="280" cy="182" r="3.5" fill="#ff7043"/>
    <line x1="320" y1="599" x2="320" y2="580" stroke="#ffb74d"/><circle cx="320" cy="580" r="3.5" fill="#ffb74d"/>
    <line x1="180" y1="599" x2="180" y2="580" stroke="#ffb74d"/><circle cx="180" cy="580" r="3.5" fill="#ffb74d"/>
    <line x1="435" y1="238" x2="435" y2="295" stroke="#e53935"/><circle cx="435" cy="295" r="3.5" fill="#e53935"/>
    <line x1="544" y1="242" x2="544" y2="295" stroke="#e53935"/><circle cx="544" cy="295" r="3.5" fill="#e53935"/>
    <line x1="580" y1="628" x2="580" y2="600" stroke="#1e88e5"/><circle cx="580" cy="600" r="3.5" fill="#1e88e5"/>
    <line x1="845" y1="243" x2="845" y2="320" stroke="#e53935"/><circle cx="845" cy="320" r="3.5" fill="#e53935"/>
  </g>
  <g class="txt" font-size="11" text-anchor="middle">
    <text x="300" y="639">${ref ? t.legend_p_ref.replace("{r}", ref) : t.legend_p}</text>
    <text x="300" y="653">${t.legend_t}</text>
  </g>
  ${ARROWS.map(arrowSvg).join("\n  ")}
</svg>`;
}

const STYLE = `
  ha-card { overflow: hidden; }
  ha-card.bare { background: none; border: none; box-shadow: none; }
  .wrap { position: relative; width: 100%; margin: 0 auto; container-type: inline-size; }
  svg { display: block; width: 100%; height: auto; }
  .txt text { fill: var(--secondary-text-color, #9e9e9e); }
  .dot line { stroke-width: 1.2; stroke-dasharray: 3 2; opacity: 0.8; }
  .dot circle { stroke: var(--card-background-color, #1c1c1c); stroke-width: 1; }
  .port.open { fill: var(--primary-text-color, #e0e0e0); stroke: var(--primary-text-color, #e0e0e0); }
  .pump { fill: none; stroke: var(--disabled-text-color, #9e9e9e); stroke-width: 1.8; stroke-linejoin: round; }
  .pump.on { fill: var(--state-active-color, #ffc107); stroke: var(--state-active-color, #ffc107); }
  .arrow { display: none; pointer-events: none; }
  .arrow.show { display: inline; }
  .click { cursor: pointer; }
  .lbl {
    position: absolute; transform: translate(-50%, -50%); white-space: nowrap; cursor: pointer;
    border-radius: 999px; line-height: 1.35; padding: 0.05em 0.5em;
    background: color-mix(in srgb, var(--card-background-color, #1c1c1c) 85%, transparent);
    font-size: clamp(9px, 1.1cqw, 18px); font-weight: 400; color: var(--secondary-text-color);
  }
  .lbl.p { font-size: clamp(11px, 1.45cqw, 24px); font-weight: 600; color: var(--primary-text-color); padding: 0.05em 0.55em; }
  .lbl.b { font-weight: 600; color: var(--primary-text-color); }
  .lbl.two { white-space: pre; text-align: center; border-radius: 0.7em; }
  .lbl[hidden] { display: none; }
  .comp {
    position: absolute; transform: translate(-50%, -50%); line-height: 0; cursor: pointer;
    --mdc-icon-size: clamp(14px, 2.2cqw, 34px); color: var(--disabled-text-color, #9e9e9e);
  }
  .comp.on { color: ${C.amber}; }
`;

function autoDetect(hass, key) {
  const [domain, suffix] = ENTITY_DEFS[key] || [];
  if (!suffix || !hass) return undefined;
  const re = new RegExp(`^${domain}\\.(.*_)?${suffix}$`);
  const hits = Object.keys(hass.states).filter((id) => re.test(id));
  if (!hits.length) return undefined;
  // Prefer the EMS-ESP boiler/thermostat device when several match.
  hits.sort((a, b) => (/boiler|thermostat|ems/.test(b) ? 1 : 0) - (/boiler|thermostat|ems/.test(a) ? 1 : 0) || a.length - b.length);
  return hits[0];
}

// Labels without an entity of their own open this one's history on click.
const FALLBACK_ENTITY = { scop: "nrgsupptotal", superheat_suction: "hptr5", superheat_discharge: "hptr6", curflowtemp: "headertemp" };

// Calculated superheat: [gas temperature, saturation temperature from the pressure sensor]
const SUPERHEAT = { superheat_suction: ["hptr5", "hppl1"], superheat_discharge: ["hptr6", "hpph1"] };

class EnvilineSchemaCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement("enviline-schema-card-editor");
  }

  static getStubConfig() {
    return { auto_detect: true, entities: {} };
  }

  setConfig(config) {
    if (!config || typeof config !== "object") throw new Error("Invalid configuration");
    this._config = { auto_detect: true, transparent: false, hide: [], ...config, entities: { ...(config.entities || {}) } };
    this._built = false;
    if (this._hass) this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _maxWidth() {
    const w = this._config.max_width;
    if (w === undefined || w === null || w === "") return "none";
    if (typeof w === "number" || /^\d+(\.\d+)?$/.test(String(w).trim())) return `${Math.min(100, Math.max(20, Number(w)))}%`;
    return /^\d+(\.\d+)?(px|%|em|rem|vw)$/.test(String(w).trim()) ? String(w).trim() : "none";
  }

  getCardSize() {
    return 9;
  }

  getGridOptions() {
    return { columns: "full", min_columns: 6 };
  }

  _t() {
    const lang = (this._config.language || this._hass?.locale?.language || this._hass?.language || "en").slice(0, 2);
    return I18N[lang] || I18N.en;
  }

  _entity(key) {
    const configured = this._config.entities[key];
    if (configured) return configured;
    if (this._config.auto_detect === false) return undefined;
    this._detected = this._detected || {};
    if (!(key in this._detected)) this._detected[key] = autoDetect(this._hass, key);
    return this._detected[key];
  }

  _stateObj(key) {
    const id = this._entity(key);
    return id ? this._hass.states[id] : undefined;
  }

  _is(key, state) {
    return this._stateObj(key)?.state === state;
  }

  _num(key) {
    const v = parseFloat(this._stateObj(key)?.state);
    return Number.isFinite(v) ? v : undefined;
  }

  _refrigerant() {
    const ref = String(this._config.refrigerant || "").toUpperCase();
    return REFRIGERANTS[ref] ? ref : undefined;
  }

  _fmt1(v) {
    const lang = this._hass.locale?.language || this._hass.language || "en";
    return new Intl.NumberFormat(lang, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(v);
  }

  _format(stateObj) {
    if (this._hass.formatEntityState) return this._hass.formatEntityState(stateObj);
    const unit = stateObj.attributes.unit_of_measurement;
    return unit ? `${stateObj.state} ${unit}` : stateObj.state;
  }

  _build() {
    const t = this._t();
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    const labels = LABELS.map(([key, x, y, primary, border, bold]) => {
      const bw = primary ? "1.5px" : "1px";
      const bc = primary || bold ? border : `color-mix(in srgb, ${border} 60%, transparent)`;
      return `<div class="lbl${primary ? " p" : ""}${bold ? " b" : ""}" data-key="${key}" hidden
        style="left:${pctX(x).toFixed(2)}%;top:${pctY(y).toFixed(2)}%;border:${bw} solid ${bc}"></div>`;
    }).join("");
    this.shadowRoot.innerHTML = `
      <style>${STYLE}</style>
      <ha-card class="${this._config.transparent ? "bare" : ""}">
        <div class="wrap" style="max-width:${this._maxWidth()}">
          ${buildSvg(t, this._refrigerant())}
          ${labels}
          <div class="comp" data-key="hpcompspd" style="left:${pctX(240)}%;top:${pctY(320)}%"><ha-icon icon="mdi:heat-pump"></ha-icon></div>
        </div>
      </ha-card>`;
    this.shadowRoot.querySelectorAll("[data-key]").forEach((el) => {
      el.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const key = el.dataset.key;
        const entityId = this._entity(key) || this._entity(FALLBACK_ENTITY[key]);
        if (!entityId) return;
        this.dispatchEvent(new CustomEvent("hass-more-info", { bubbles: true, composed: true, detail: { entityId } }));
      });
    });
    this._built = true;
  }

  _render() {
    if (!this._config || !this._hass) return;
    if (!this._built) this._build();
    const root = this.shadowRoot;
    const t = this._t();
    const hide = this._config.hide || [];

    root.querySelectorAll(".lbl").forEach((el) => {
      const key = el.dataset.key;
      const [prefix, desc] = t.d[key];
      let text;
      let title = `${desc}\n${t.history}`;
      // T0 and headertemp are the same sensor in the buffer tank; either one fills the label.
      const so = this._stateObj(key) || (key === "curflowtemp" ? this._stateObj("headertemp") : undefined);
      if (so) {
        text = prefix + this._format(so);
        const ref = this._refrigerant();
        const sat = this._num(key);
        if (ref && (key === "hppl1" || key === "hpph1") && sat !== undefined) {
          const [a, b, c] = REFRIGERANTS[ref];
          text = `${prefix}${this._fmt1(Math.exp(a - b / (sat + c)))} bar\n${this._format(so)}`;
          title = `${desc}. ${t.pressure_note.replace("{r}", ref)}\n${t.history}`;
        }
      } else if (key === "cop") {
        const heat = this._num("hppower");
        const elec = this._num("electric_power");
        const unit = this._stateObj("electric_power")?.attributes.unit_of_measurement;
        if (heat !== undefined && elec && (this._num("hpcompspd") ?? 0) > 0) {
          const elecKw = unit === "W" ? elec / 1000 : elec;
          text = `${prefix}${(heat / elecKw).toFixed(2)}`;
          title = t.cop_calc;
        }
      }
      if (SUPERHEAT[key]) {
        // Only meaningful while the compressor runs; never show "unavailable".
        text = undefined;
        if ((this._num("hpcompspd") ?? 0) > 0 && this._num(key) !== undefined) text = prefix + this._format(so);
      }
      if (text === undefined && SUPERHEAT[key] && (this._num("hpcompspd") ?? 0) > 0) {
        const gas = this._num(SUPERHEAT[key][0]);
        const sat = this._num(SUPERHEAT[key][1]);
        if (gas !== undefined && sat !== undefined) text = `${prefix}${this._fmt1(gas - sat)} K`;
      }
      // SCOP from the EMS-ESP energy counters, as fallback when no live COP is possible.
      if (key === "scop" && !this._entity("electric_power") && !this._entity("cop")) {
        const supp = this._num("nrgsupptotal");
        const cons = this._num("nrgconstotal");
        if (supp !== undefined && cons > 0) text = `${prefix}${(supp / cons).toFixed(2)}`;
      }
      const show = text !== undefined && !hide.includes(key);
      el.hidden = !show;
      if (show) {
        el.classList.toggle("two", text.includes("\n"));
        if (el.textContent !== text) el.textContent = text;
        if (el.title !== title) el.title = title;
      }
    });

    // Stack the visible power labels from the top so hidden ones leave no gap.
    let row = 0;
    for (const key of ["electric_power", "hppower", "cop", "scop"]) {
      const el = root.querySelector(`.lbl[data-key="${key}"]`);
      if (!el.hidden) el.style.top = `${pctY(440 + 25 * row++).toFixed(2)}%`;
    }

    const running = (this._num("hpcompspd") ?? 0) > 0;
    const cooling = this._is("hp4way", "on");
    const pumpOn = this._is("heatingpump", "on");
    const dhw = this._is("ww3wayvalve", "on");
    const bypass = this._is("vc0valve", "on");

    const fwA = root.getElementById("fw_a");
    const fwB = root.getElementById("fw_b");
    fwA.setAttribute("stroke", running ? (cooling ? C.discharge : C.suction) : C.idle);
    fwB.setAttribute("stroke", running ? (cooling ? C.suction : C.discharge) : C.idle);

    const show = {
      r_suc_h: running && !cooling,
      r_dis_h: running && !cooling,
      r_liq1_h: running && !cooling,
      r_liq2_h: running && !cooling,
      r_suc_c: running && cooling,
      r_dis_c: running && cooling,
      r_liq1_c: running && cooling,
      r_liq2_c: running && cooling,
      w_flow: pumpOn,
      w_ch: pumpOn && !dhw,
      w_dhw: pumpOn && dhw,
      w_buf: pumpOn && !dhw && !bypass,
      w_ret: pumpOn && !dhw && !bypass,
      w_byp: pumpOn && !dhw && bypass,
    };
    for (const [id, on] of Object.entries(show)) root.getElementById(id).classList.toggle("show", on);

    root.getElementById("w3_ch").classList.toggle("open", !dhw);
    root.getElementById("w3_dhw").classList.toggle("open", dhw);
    root.getElementById("vc0_ab").classList.toggle("open", !bypass);
    root.getElementById("vc0_byp").classList.toggle("open", bypass);
    root.getElementById("pump_hp").classList.toggle("on", pumpOn);
    root.getElementById("pump_pc1").classList.toggle("on", this._is("pc1on", "on"));

    const comp = root.querySelector(".comp");
    comp.classList.toggle("on", running);
    comp.title = `${t.d.hpcompspd[1]}\n${t.history}`;
  }
}

const EDITOR_GROUPS = [
  ["refrigerant", ["hpcompspd", "hpactivity", "hp4way", "hppl1", "hptr5", "superheat_suction", "hpph1", "hptr6", "superheat_discharge", "hptr1", "hptr3", "hptr4"]],
  ["outdoor", ["outdoortemp", "hptl2", "hpta4", "hpea0", "hpmode"]],
  ["water", ["hptc3", "hptc1", "hptc0", "curflowtemp", "targetflowtemp", "heatingpump", "hpcircspd", "ww3wayvalve", "vc0valve", "auxheaterstatus", "headertemp", "pc1on"]],
  ["dhw", ["wwcurtemp", "hptw1"]],
  ["power", ["hppower", "electric_power", "cop", "nrgsupptotal", "nrgconstotal"]],
  ["room", ["currtemp", "seltemp", "dampedoutdoortemp"]],
];
const GROUP_TITLES = {
  nl: { refrigerant: "Koudemiddel en compressor", outdoor: "Buitenunit", water: "Watercircuit", dhw: "Warm water", power: "Vermogen", room: "Thermostaat", auto: "EMS-ESP-entiteiten automatisch zoeken", transparent: "Transparante achtergrond", max_width: "Maximale breedte (%)", language: "Taal (leeg = HA-taal)", refrigerant: "Koudemiddel (voor druk in bar, zie typeplaatje)" },
  en: { refrigerant: "Refrigerant and compressor", outdoor: "Outdoor unit", water: "Water circuit", dhw: "Hot water", power: "Power", room: "Thermostat", auto: "Auto-detect EMS-ESP entities", transparent: "Transparent background", max_width: "Maximum width (%)", language: "Language (empty = HA language)", refrigerant: "Refrigerant (for pressure in bar, see type plate)" },
};

class EnvilineSchemaCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
    this._update();
  }

  set hass(hass) {
    this._hass = hass;
    this._update();
  }

  _update() {
    if (!this._config || !this._hass) return;
    const lang = (this._hass.locale?.language || this._hass.language || "en").slice(0, 2);
    const g = GROUP_TITLES[lang] || GROUP_TITLES.en;
    const d = (I18N[lang] || I18N.en).d;
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const config = { ...ev.detail.value };
        const entities = {};
        for (const [k, v] of Object.entries(config.entities || {})) if (v) entities[k] = v;
        config.entities = entities;
        if (!config.language) delete config.language;
        if (!config.refrigerant) delete config.refrigerant;
        if (!config.max_width || config.max_width >= 100) delete config.max_width;
        this.dispatchEvent(new CustomEvent("config-changed", { bubbles: true, composed: true, detail: { config } }));
      });
      this.appendChild(this._form);
    }
    this._form.hass = this._hass;
    this._form.data = this._config;
    this._form.schema = [
      { name: "auto_detect", selector: { boolean: {} } },
      { name: "transparent", selector: { boolean: {} } },
      { name: "max_width", selector: { number: { min: 20, max: 100, step: 5, mode: "slider", unit_of_measurement: "%" } } },
      { name: "refrigerant", selector: { select: { mode: "dropdown", options: Object.keys(REFRIGERANTS) } } },
      { name: "language", selector: { select: { mode: "dropdown", options: [{ value: "nl", label: "Nederlands" }, { value: "en", label: "English" }] } } },
      ...EDITOR_GROUPS.map(([group, keys]) => ({
        type: "expandable",
        name: "entities",
        title: g[group],
        schema: keys.map((key) => ({ name: key, selector: { entity: { domain: ENTITY_DEFS[key][0] } } })),
      })),
    ];
    this._form.computeLabel = (s) => {
      if (s.name === "auto_detect") return g.auto;
      if (s.name === "transparent") return g.transparent;
      if (s.name === "max_width") return g.max_width;
      if (s.name === "language") return g.language;
      if (s.name === "refrigerant") return g.refrigerant;
      const def = d[s.name];
      if (!def) return s.name;
      const found = this._config.entities?.[s.name] ? "" : autoDetect(this._hass, s.name);
      return found && this._config.auto_detect !== false ? `${def[1]} (auto: ${found})` : def[1];
    };
  }
}

customElements.define("enviline-schema-card", EnvilineSchemaCard);
customElements.define("enviline-schema-card-editor", EnvilineSchemaCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "enviline-schema-card",
  name: "EnviLine Schema Card",
  description: "Live diagram of a Nefit-Bosch EnviLine heat pump via EMS-ESP",
  preview: false,
  documentationURL: "https://github.com/beercpd831/enviline-schema-card",
});

console.info(`%c ENVILINE-SCHEMA-CARD %c v${CARD_VERSION} `, "color:#fff;background:#e53935;font-weight:bold", "color:#e53935;background:#fff");
