"use client";

import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card } from "@/components/ui/card";
import { TrendingUp, BarChart3 } from "lucide-react";
import type { RecordSession } from "@/types/patient";

interface ChartProps {
  records: RecordSession[];
}

export default function PatientCharts({ records }: ChartProps) {
  const data = useMemo(() => {
    // Sort records by date ascending
    const sorted = [...records].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return sorted.map((r) => {
      // Parse PA "120/80"
      let sys = 0;
      let dia = 0;
      if (typeof r.bloodPressure.value === "string" && r.bloodPressure.value.includes("/")) {
        const [sysStr, diaStr] = r.bloodPressure.value.split("/");
        sys = parseFloat(sysStr) || 0;
        dia = parseFloat(diaStr) || 0;
      } else {
        sys = parseFloat(String(r.bloodPressure.value)) || 0;
      }

      return {
        date: new Date(r.date).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
        }),
        timestamp: r.date,
        fc: parseFloat(String(r.heartRate.value)) || 0,
        temp: parseFloat(String(r.temperature.value)) || 0,
        spo2: parseFloat(String(r.oxygenSaturation.value)) || 0,
        pain: parseFloat(String(r.pain.value)) || 0,
        sys,
        dia,
      };
    });
  }, [records]);

  if (data.length === 0) {
    return (
      <Card className="overflow-hidden border-dashed">
        <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center min-h-[180px]">
          <div className="relative mb-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <BarChart3 size={24} className="text-primary" />
            </div>
            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-teal-500/20 flex items-center justify-center">
              <TrendingUp size={10} className="text-teal-600 dark:text-teal-400" />
            </div>
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">
            Gráficos indisponíveis
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Não há dados suficientes para gerar os gráficos neste período.
          </p>
        </div>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-3 rounded-xl shadow-lg">
          <p className="text-sm font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex flex-col mb-1 text-xs">
              <span className="font-bold flex items-center gap-1" style={{ color: entry.color }}>
                <span 
                  className="w-2 h-2 rounded-full inline-block" 
                  style={{ backgroundColor: entry.color }} 
                />
                {entry.name}: {entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Container Responsivo para desktop e mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Frequência Cardíaca */}
        <Card className="p-4 shadow-sm border border-border hover:shadow-md transition-shadow">
          <h3 className="text-sm font-bold text-muted-foreground mb-4 select-none">Frequência Cardíaca (bpm)</h3>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "var(--foreground)", opacity: 0.7 }} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "var(--foreground)", opacity: 0.7 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "currentColor", strokeWidth: 1, strokeDasharray: "3 3", opacity: 0.2 }} />
                <Line
                  type="monotone"
                  dataKey="fc"
                  name="FC"
                  stroke="#ef4444" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#ef4444", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Pressão Arterial */}
        <Card className="p-4 shadow-sm border border-border hover:shadow-md transition-shadow">
          <h3 className="text-sm font-bold text-muted-foreground mb-4 select-none">Pressão Arterial (mmHg)</h3>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "var(--foreground)", opacity: 0.7 }} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "var(--foreground)", opacity: 0.7 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "currentColor", strokeWidth: 1, strokeDasharray: "3 3", opacity: 0.2 }} />
                <Legend className="text-xs mt-2 opacity-80" iconType="circle" />
                <Area
                  type="monotone"
                  dataKey="sys"
                  name="Sistólica"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                  strokeWidth={2}
                  animationDuration={1000}
                />
                <Area
                  type="monotone"
                  dataKey="dia"
                  name="Diastólica"
                  stroke="#0ea5e9"
                  fill="#0ea5e9"
                  fillOpacity={0.1}
                  strokeWidth={2}
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Saturação de Oxigênio */}
        <Card className="p-4 shadow-sm border border-border hover:shadow-md transition-shadow">
          <h3 className="text-sm font-bold text-muted-foreground mb-4 select-none">Saturação de Oxigênio (%)</h3>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "var(--foreground)", opacity: 0.7 }} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis domain={['dataMin - 2', 100]} tick={{ fontSize: 12, fill: "var(--foreground)", opacity: 0.7 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "currentColor", strokeWidth: 1, strokeDasharray: "3 3", opacity: 0.2 }} />
                <Line
                  type="monotone"
                  dataKey="spo2"
                  name="SpO2"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Temperatura e Dor */}
        <Card className="p-4 shadow-sm border border-border hover:shadow-md transition-shadow">
          <h3 className="text-sm font-bold text-muted-foreground mb-4 select-none">Temperatura (°C) / Dor (0-10)</h3>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "var(--foreground)", opacity: 0.7 }} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 12, fill: "var(--foreground)", opacity: 0.7 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: "var(--foreground)", opacity: 0.7 }} axisLine={false} tickLine={false} domain={[0, 10]} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "currentColor", strokeWidth: 1, strokeDasharray: "3 3", opacity: 0.2 }} />
                <Legend className="text-xs mt-2 opacity-80" iconType="circle" />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="temp"
                  name="Temperatura"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#f59e0b", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
                  animationDuration={1000}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="pain"
                  name="Dor"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#8b5cf6", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>
    </div>
  );
}
