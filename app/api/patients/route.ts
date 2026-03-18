import { getAuthContext } from "@/lib/casl/utils/getUserPermission";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  resolveHeartRate,
  resolveO2Saturation,
  resolveTemperature,
  resolveSystolicPressure,
  resolvePain,
  resolveGeneric,
} from "@/lib/utils/vitals";
import type { Patient, RecordSession } from "@/types/patient";

export async function GET(req: Request) {
  const authContext = await getAuthContext();

  if (!authContext) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { user, cannot } = authContext;

  // Exemplo de verificação CASL para listagem
  if (
    (cannot("get", {
      kind: "User",
      id: "ANY",
    }) &&
      user.role !== "admin") ||
    user.doctorId == null
  ) {
    // Basic protection (allowing only admin to view patients list or patients detail here unless specified by casl)
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  try {
    // Filtro por Médico
    // Se o doctorId já vem no contexto (via proxy), usamos direto!

    // const doctorId = user.doctorId;

    if (false) {
      // Se não for um médico (não tem doctorProfile), não vê ninguém na lista de gestão
      return NextResponse.json([]);
    }

    console.time("patients:query");
    // Buscar todos os usuários que têm patientProfile, junto com seu último vitalRecord
    const users = await prisma.user.findMany({
      where: {
        patientProfile: {
          doctorId: user.doctorId,
        },
      },
      take: 50,
      relationLoadStrategy: "join",
      select: {
        id: true,
        name: true,
        image: true,
        patientProfile: {
          select: {
            phone: true,
            birthDate: true,
            diseaseType: true,
            cid: true,
            ecog: true,
            diagnosis: true,
            createdAt: true,
          },
        },
        vitalRecords: {
          orderBy: { recordedAt: "desc" },
          take: 1, // Pegamos apenas o mais recente para a lista
          select: {
            recordedAt: true,
            heartRate: true,
            systolic: true,
            diastolic: true,
            oxygenSaturation: true,
            temperature: true,
            weight: true,
            painLevel: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
    console.timeEnd("patients:query");

    const mapRecordToSession = (record: any): RecordSession => {
      return {
        date: record.recordedAt.toISOString(),
        heartRate: {
          label: "FC",
          value: record.heartRate ?? "-",
          unit: "bpm",
          status: resolveHeartRate(record.heartRate),
        },
        bloodPressure: {
          label: "PA",
          value:
            record.systolic && record.diastolic
              ? `${record.systolic}/${record.diastolic}`
              : "-",
          unit: "mmHg",
          status: resolveSystolicPressure(record.systolic),
        },
        oxygenSaturation: {
          label: "SpO2",
          value: record.oxygenSaturation ?? "-",
          unit: "%",
          status: resolveO2Saturation(record.oxygenSaturation),
        },
        temperature: {
          label: "Temp",
          value: record.temperature ?? "-",
          unit: "°C",
          status: resolveTemperature(record.temperature),
        },
        weight: {
          label: "Peso",
          value: record.weight ?? "-",
          unit: "kg",
          status: resolveGeneric(record.weight),
        },
        pain: {
          label: "Dor",
          value: record.painLevel ?? "-",
          unit: "/10",
          status: resolvePain(record.painLevel),
        },
      };
    };

    const defaultSession: RecordSession = {
      date: new Date().toISOString(),
      heartRate: { label: "FC", value: "-", unit: "bpm", status: "normal" },
      bloodPressure: {
        label: "PA",
        value: "-",
        unit: "mmHg",
        status: "normal",
      },
      oxygenSaturation: {
        label: "SpO2",
        value: "-",
        unit: "%",
        status: "normal",
      },
      temperature: { label: "Temp", value: "-", unit: "°C", status: "normal" },
      weight: { label: "Peso", value: "-", unit: "kg", status: "normal" },
      pain: { label: "Dor", value: "-", unit: "/10", status: "normal" },
    };

    console.time("patients:mapping");
    const patientsList: Patient[] = users.map((u) => {
      const profile = u.patientProfile!;
      const vitalRecords = u.vitalRecords;

      // Calcular idade
      let age = 0;
      if (profile.birthDate) {
        const ageDifMs = Date.now() - profile.birthDate.getTime();
        const ageDate = new Date(ageDifMs);
        age = Math.abs(ageDate.getUTCFullYear() - 1970);
      }

      const lastRecord =
        vitalRecords.length > 0
          ? mapRecordToSession(vitalRecords[0])
          : defaultSession;

      return {
        id: u.id,
        name: u.name,
        age,
        phone: profile.phone ?? "Não informado",
        avatarUrl: u.image ?? null,
        dateOfBirth: profile.birthDate
          ? profile.birthDate.toISOString()
          : new Date().toISOString(),
        admissionDate: profile.createdAt.toISOString(),
        diseaseType: profile.diseaseType ?? "Não informado",
        cid: profile.cid ?? "Não informado",
        ecog: (profile.ecog ?? 0) as any,
        diagnosis: profile.diagnosis ?? "Não informado",
        lastRecord,
        dailyHistory: [], // Na lista não precisamos do histórico completo, apenas do lastRecord
      };
    });
    console.timeEnd("patients:mapping");

    return NextResponse.json(patientsList);
  } catch (error) {
    console.error("Erro ao buscar pacientes:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
