import React, { useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  Activity,
  User,
  Gauge,
  Heart,
  Thermometer,
  Droplet,
  Weight,
  Frown,
  Calendar,
} from "lucide-react";
import { Card, Button, Input } from "../ui/Components";
import { cn } from "../../lib/utils";

// --- TYPES ---

type VitalStatus = "critical" | "warning" | "normal";

interface VitalValue {
  type: "PA" | "FC" | "Temp" | "SpO2" | "Peso" | "Dor";
  value: string;
  unit: string;
  status: VitalStatus;
}

interface RecordSession {
  id: string;
  time: string; // "14:30"
  date: string; // "Hoje" ou "04/12"
  vitals: VitalValue[];
}

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  avatar: string;
  phone: string;
  insurance: string; // Convênio
  lastRecord: RecordSession; // O registro mais recente (destaque)
  dailyHistory: RecordSession[]; // Outros registros do MESMO dia
}

// --- CONFIG & ICONS ---

const vitalIcons = {
  PA: Gauge,
  FC: Heart,
  Temp: Thermometer,
  SpO2: Droplet,
  Peso: Weight,
  Dor: Frown,
};

// --- MOCK DATA ---

const patientsData: Patient[] = [
  {
    id: "1",
    name: "Maria Garcia",
    age: 68,
    gender: "Feminino",
    avatar: "https://i.pravatar.cc/150?u=maria",
    phone: "(11) 99876-5432",
    insurance: "Unimed",
    lastRecord: {
      id: "r1",
      time: "16:45",
      date: "Hoje",
      vitals: [
        { type: "PA", value: "140/90", unit: "mmHg", status: "warning" },
        { type: "FC", value: "88", unit: "bpm", status: "normal" },
        { type: "Temp", value: "36.5", unit: "°C", status: "normal" },
        { type: "SpO2", value: "96", unit: "%", status: "normal" },
        { type: "Peso", value: "72.5", unit: "kg", status: "normal" },
        { type: "Dor", value: "2", unit: "/10", status: "normal" },
      ],
    },
    dailyHistory: [
      {
        id: "r2",
        time: "12:30",
        date: "Hoje",
        vitals: [
          { type: "PA", value: "150/95", unit: "mmHg", status: "warning" },
          { type: "FC", value: "92", unit: "bpm", status: "normal" },
          { type: "Temp", value: "36.8", unit: "°C", status: "normal" },
          { type: "SpO2", value: "97", unit: "%", status: "normal" },
          { type: "Peso", value: "72.5", unit: "kg", status: "normal" },
          { type: "Dor", value: "3", unit: "/10", status: "normal" },
        ],
      },
      {
        id: "r3",
        time: "08:15",
        date: "Hoje",
        vitals: [
          { type: "PA", value: "160/100", unit: "mmHg", status: "critical" },
          { type: "FC", value: "95", unit: "bpm", status: "normal" },
          { type: "Temp", value: "37.0", unit: "°C", status: "normal" },
          { type: "SpO2", value: "95", unit: "%", status: "normal" },
          { type: "Peso", value: "72.6", unit: "kg", status: "normal" },
          { type: "Dor", value: "6", unit: "/10", status: "warning" },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "Antonio Carlos",
    age: 74,
    gender: "Masculino",
    avatar: "https://i.pravatar.cc/150?u=antonio",
    phone: "(11) 98888-1111",
    insurance: "Bradesco Saúde",
    lastRecord: {
      id: "r4",
      time: "14:20",
      date: "Hoje",
      vitals: [
        { type: "PA", value: "120/80", unit: "mmHg", status: "normal" },
        { type: "FC", value: "72", unit: "bpm", status: "normal" },
        { type: "Temp", value: "36.2", unit: "°C", status: "normal" },
        { type: "SpO2", value: "98", unit: "%", status: "normal" },
        { type: "Peso", value: "78.5", unit: "kg", status: "normal" },
        { type: "Dor", value: "0", unit: "/10", status: "normal" },
      ],
    },
    dailyHistory: [
      {
        id: "r5",
        time: "09:00",
        date: "Hoje",
        vitals: [
          { type: "PA", value: "118/78", unit: "mmHg", status: "normal" },
          { type: "FC", value: "70", unit: "bpm", status: "normal" },
          { type: "Temp", value: "36.1", unit: "°C", status: "normal" },
          { type: "SpO2", value: "99", unit: "%", status: "normal" },
          { type: "Peso", value: "78.8", unit: "kg", status: "normal" },
          { type: "Dor", value: "0", unit: "/10", status: "normal" },
        ],
      },
    ],
  },
  {
    id: "3",
    name: "Fernanda Lima",
    age: 42,
    gender: "Feminino",
    avatar: "https://i.pravatar.cc/150?u=fernanda",
    phone: "(21) 97777-6666",
    insurance: "SulAmérica",
    lastRecord: {
      id: "r6",
      time: "10:15",
      date: "Ontem",
      vitals: [
        { type: "PA", value: "110/70", unit: "mmHg", status: "normal" },
        { type: "FC", value: "68", unit: "bpm", status: "normal" },
        { type: "Temp", value: "36.5", unit: "°C", status: "normal" },
        { type: "SpO2", value: "99", unit: "%", status: "normal" },
        { type: "Peso", value: "62.0", unit: "kg", status: "normal" },
        { type: "Dor", value: "0", unit: "/10", status: "normal" },
      ],
    },
    dailyHistory: [],
  },
];

// --- SUB-COMPONENTS ---

// Visualização compacta e vertical para a lista
const VitalDisplay: React.FC<{ data: VitalValue }> = ({ data }) => {
  const Icon = vitalIcons[data.type] || Activity;

  const statusColors = {
    critical:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
    warning:
      "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800",
    normal:
      "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-1.5 px-1 rounded-md border transition-all h-full min-w-[55px]",
        statusColors[data.status],
      )}
    >
      <div className="flex items-center gap-1 mb-0.5">
        <Icon size={10} className="opacity-70" />
        <span className="text-[9px] font-bold uppercase tracking-wider">
          {data.type}
        </span>
      </div>
      <div className="text-xs font-bold leading-none whitespace-nowrap">
        {data.value}
        <span className="text-[8px] font-normal ml-0.5 opacity-70">
          {data.unit}
        </span>
      </div>
    </div>
  );
};

// Versão horizontal minúscula para o histórico expandido
const VitalBadgeSmall: React.FC<{ data: VitalValue }> = ({ data }) => {
  const Icon = vitalIcons[data.type] || Activity;
  const colors = {
    critical: "bg-red-100 text-red-800 border-red-200",
    warning: "bg-orange-100 text-orange-800 border-orange-200",
    normal: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px]",
        colors[data.status],
      )}
    >
      <Icon size={10} />
      <span className="font-semibold">{data.type}:</span>
      <span className="font-bold">{data.value}</span>
    </div>
  );
};

const PatientCard: React.FC<{ patient: Patient }> = ({ patient }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="overflow-hidden border-slate-200 dark:border-slate-800 transition-all hover:shadow-md">
      <div className="p-3 bg-white dark:bg-slate-900 flex flex-col lg:flex-row lg:items-center gap-4">
        {/* 1. Patient Info (Left, Fixed Width on Desktop) */}
        <div className="flex items-center gap-3 lg:w-[280px] shrink-0">
          <div className="relative">
            <img
              src={patient.avatar}
              alt={patient.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 dark:border-slate-800"
            />
            <div
              className={cn(
                "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900",
                patient.lastRecord.vitals.some((v) => v.status === "critical")
                  ? "bg-red-500 animate-pulse"
                  : patient.lastRecord.vitals.some(
                        (v) => v.status === "warning",
                      )
                    ? "bg-orange-500"
                    : "bg-emerald-500",
              )}
            ></div>
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
              {patient.name}
            </h3>
            <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span>{patient.age} anos</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span>{patient.insurance}</span>
            </div>
          </div>
        </div>

        {/* 2. Latest Record (Middle, Flexible Grid) */}
        <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2 border border-slate-100 dark:border-slate-800/50">
          {/* Mobile Label */}
          <div className="lg:hidden flex items-center gap-1 mb-2 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
            <Clock size={10} /> {patient.lastRecord.date},{" "}
            {patient.lastRecord.time}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {patient.lastRecord.vitals.map((v, idx) => (
              <VitalDisplay key={idx} data={v} />
            ))}
          </div>
        </div>

        {/* 3. Actions (Right, Aligned) */}
        <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-2 lg:w-[140px] shrink-0">
          {/* Desktop Timestamp */}
          <div className="hidden lg:flex items-center gap-1 text-[10px] text-slate-400 font-medium mb-1">
            <Clock size={10} /> {patient.lastRecord.date},{" "}
            {patient.lastRecord.time}
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
            <Button
              size="sm"
              className="h-8 text-xs px-3 bg-teal-600 hover:bg-teal-700 text-white shadow-sm w-full lg:w-auto"
            >
              <FileText size={14} className="mr-1.5" />
              Prontuário
            </Button>

            {/* Expand Button (Always rendered to maintain spacing, invisible if disabled) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                patient.dailyHistory.length > 0 && setExpanded(!expanded)
              }
              disabled={patient.dailyHistory.length === 0}
              className={cn(
                "h-8 w-8 shrink-0 transition-opacity",
                patient.dailyHistory.length === 0
                  ? "invisible pointer-events-none"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200",
              )}
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>
          </div>
        </div>
      </div>

      {/* EXPANDED HISTORY */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out bg-slate-50 dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-800",
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="p-3 pl-8 md:pl-20 relative">
            <div className="absolute left-6 md:left-[4.5rem] top-3 bottom-3 w-px bg-slate-200 dark:bg-slate-800 border-l border-dashed border-slate-300 dark:border-slate-700"></div>

            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Calendar size={10} /> Outros registros de{" "}
              {patient.lastRecord.date}
            </h4>

            <div className="space-y-2">
              {patient.dailyHistory.map((record, idx) => (
                <div
                  key={idx}
                  className="relative flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 animate-in fade-in slide-in-from-left-2 duration-300"
                >
                  <div className="z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm w-fit">
                    {record.time}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {record.vitals.map((v, vIdx) => (
                      <VitalBadgeSmall key={vIdx} data={v} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

const PatientList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "critical" | "warning">(
    "all",
  );

  const filteredPatients = patientsData.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm);
    if (filterType === "all") return matchesSearch;
    const hasStatus = p.lastRecord.vitals.some((v) => v.status === filterType);
    return matchesSearch && hasStatus;
  });

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="text-teal-600" />
          Gestão de Pacientes
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Localize prontuários e visualize o estado clínico em tempo real.
        </p>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-20 z-30">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
          <Input
            placeholder="Buscar por nome, CPF ou telefone..."
            className="pl-10 h-11 text-base bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-teal-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <Button
            variant={filterType === "all" ? "default" : "outline"}
            onClick={() => setFilterType("all")}
            className="h-11"
          >
            Todos
          </Button>
          <Button
            variant={filterType === "critical" ? "danger" : "outline"}
            onClick={() => setFilterType("critical")}
            className={cn(
              "h-11 gap-2",
              filterType !== "critical" &&
                "text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20",
            )}
          >
            <Activity size={16} /> Críticos
          </Button>
          <Button
            variant={filterType === "warning" ? "secondary" : "outline"}
            onClick={() => setFilterType("warning")}
            className={cn(
              "h-11 gap-2",
              filterType === "warning"
                ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                : "text-orange-600 border-orange-200 hover:bg-orange-50 dark:border-orange-900/50 dark:hover:bg-orange-900/20",
            )}
          >
            <Activity size={16} /> Atenção
          </Button>
        </div>
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))
        ) : (
          <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">
              Nenhum paciente encontrado
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Tente ajustar os filtros ou busque por outro nome.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientList;
