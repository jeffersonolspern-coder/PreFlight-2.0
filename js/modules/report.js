function isFiniteNumber(value) {
  return Number.isFinite(Number(value));
}

function asNumberOrNull(value) {
  return isFiniteNumber(value) ? Number(value) : null;
}

function toText(value) {
  return value === null || value === undefined || value === "" ? "—" : String(value);
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, "\"\"")}"`;
  }
  return text;
}

function formatDateTime(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return "—";
  return date.toLocaleString("pt-BR");
}

function parseDate(value) {
  if (!value) return null;
  if (value.toDate) return value.toDate();
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

function periodLabel(range = "30d") {
  if (range === "today") return "Hoje";
  if (range === "7d") return "7 dias";
  return "30 dias";
}

function resolvePeriodMetric(metrics = {}, keys = []) {
  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(metrics, key)) continue;
    const value = asNumberOrNull(metrics[key]);
    if (value !== null) return value;
  }
  return null;
}

function resolveBySimulado(metrics = {}, keys = [], simuladoKey = "") {
  for (const key of keys) {
    const source = metrics?.[key];
    if (!source || typeof source !== "object") continue;
    const value = asNumberOrNull(source?.[simuladoKey]);
    if (value !== null) return value;
  }
  return null;
}

function buildSimuladosRows(metrics = {}, simuladoLabels = []) {
  return simuladoLabels.map((item) => {
    const key = String(item?.key || "");
    return {
      simulado: item?.label || key || "Simulado",
      execucoes: resolveBySimulado(metrics, ["sessionsBySimulado", "executionsBySimulado"], key),
      conclusoes: resolveBySimulado(metrics, ["evaluationsBySimulado", "conclusionsBySimulado"], key),
      acertoMedio: resolveBySimulado(
        metrics,
        ["accuracyBySimulado", "averageAccuracyBySimulado", "avgAccuracyBySimulado"],
        key
      ),
      creditosConsumidos: resolveBySimulado(metrics, ["creditsConsumedBySimulado"], key)
    };
  });
}

function buildUsuariosRows(users = []) {
  return (Array.isArray(users) ? users : []).map((user) => {
    const lastAccess = parseDate(
      user?.lastAccessAt ??
      user?.lastSeenAt ??
      user?.lastLoginAt ??
      user?.lastActiveAt ??
      user?.updatedAt
    );
    return {
      nome: toText(user?.name || "Sem nome"),
      email: toText(user?.email),
      perfil: toText(user?.role),
      creditos: asNumberOrNull(user?.creditsBalance),
      treinos: asNumberOrNull(user?.trainingCount),
      avaliacoes: asNumberOrNull(user?.evaluationCount),
      ultimoAcesso: lastAccess ? formatDateTime(lastAccess) : "—"
    };
  });
}

function buildResumo(metrics = {}, users = []) {
  const usersTotal = resolvePeriodMetric(metrics, ["totalUsersCurrent"]) ?? (Array.isArray(users) ? users.length : 0);
  const novosCadastros = resolvePeriodMetric(metrics, ["newUsersPeriod", "newUsers", "newRegistrations"]);
  const usuariosAtivos = resolvePeriodMetric(metrics, ["activeUsersPeriod", "activeUsers", "activeUsers30d"]);
  const simuladosIniciados = resolvePeriodMetric(metrics, ["sessionsStarted", "sessionsTotal", "simuladosIniciados"]);
  const simuladosConcluidos = resolvePeriodMetric(metrics, ["sessionsCompleted", "evaluationsCompleted"]);
  const creditosComprados = resolvePeriodMetric(metrics, ["creditsPurchased", "creditsBought"]);
  const creditosConsumidos = resolvePeriodMetric(metrics, ["creditsConsumed", "creditsSpent"]);
  const saldoPeriodo =
    creditosComprados === null || creditosConsumidos === null
      ? null
      : creditosComprados - creditosConsumidos;

  return {
    usersTotal,
    novosCadastros,
    usuariosAtivos,
    simuladosIniciados,
    simuladosConcluidos,
    creditosComprados,
    creditosConsumidos,
    saldoPeriodo
  };
}

function buildQuestoesRows(metrics = {}) {
  const source = Array.isArray(metrics?.topWrongQuestions)
    ? metrics.topWrongQuestions
    : Array.isArray(metrics?.mostWrongQuestions)
      ? metrics.mostWrongQuestions
      : [];

  return source.map((item) => ({
    questao: toText(item?.question || item?.id || item?.label),
    simulado: toText(item?.simulado || item?.simuladoLabel || item?.simuladoId),
    erros: asNumberOrNull(item?.errors ?? item?.wrongCount),
    acerto: asNumberOrNull(item?.accuracy ?? item?.hitRate ?? item?.successRate)
  }));
}

function toCsv(headers = [], rows = []) {
  const headerLine = headers.map((h) => csvEscape(h)).join(",");
  const bodyLines = rows.map((row) =>
    headers.map((header) => csvEscape(row?.[header] ?? "")).join(",")
  );
  return [headerLine, ...bodyLines].join("\n");
}

function triggerDownload(filename, content) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function buildReportData({
  period = "30d",
  metrics = {},
  users = [],
  generatedAt = new Date(),
  simuladoLabels = []
} = {}) {
  const safeMetrics = metrics && typeof metrics === "object" ? metrics : {};
  const safeUsers = Array.isArray(users) ? users : [];
  const safeSimulados = Array.isArray(simuladoLabels) ? simuladoLabels : [];
  const periodIsTotal = safeMetrics?.rangeSupported === false;

  return {
    meta: {
      period,
      periodLabel: periodLabel(period),
      generatedAt,
      generatedAtText: formatDateTime(generatedAt),
      periodMode: periodIsTotal ? "total" : "period"
    },
    resumo: buildResumo(safeMetrics, safeUsers),
    tabelas: {
      simulados: buildSimuladosRows(safeMetrics, safeSimulados),
      usuarios: buildUsuariosRows(safeUsers),
      questoesMaisErradas: buildQuestoesRows(safeMetrics)
    }
  };
}

function downloadReportCsvFiles(reportData = {}) {
  const resumo = reportData?.resumo || {};
  const simulados = Array.isArray(reportData?.tabelas?.simulados) ? reportData.tabelas.simulados : [];
  const usuarios = Array.isArray(reportData?.tabelas?.usuarios) ? reportData.tabelas.usuarios : [];
  const questoes = Array.isArray(reportData?.tabelas?.questoesMaisErradas)
    ? reportData.tabelas.questoesMaisErradas
    : [];

  const resumoRows = [{
    periodo: reportData?.meta?.periodLabel || "—",
    geradoEm: reportData?.meta?.generatedAtText || "—",
    usuariosTotal: toText(resumo.usersTotal),
    novosCadastros: toText(resumo.novosCadastros),
    usuariosAtivos: toText(resumo.usuariosAtivos),
    simuladosIniciados: toText(resumo.simuladosIniciados),
    simuladosConcluidos: toText(resumo.simuladosConcluidos),
    creditosComprados: toText(resumo.creditosComprados),
    creditosConsumidos: toText(resumo.creditosConsumidos),
    saldoPeriodo: toText(resumo.saldoPeriodo)
  }];

  const resumoCsv = toCsv(
    [
      "periodo",
      "geradoEm",
      "usuariosTotal",
      "novosCadastros",
      "usuariosAtivos",
      "simuladosIniciados",
      "simuladosConcluidos",
      "creditosComprados",
      "creditosConsumidos",
      "saldoPeriodo"
    ],
    resumoRows
  );
  triggerDownload("resumo.csv", resumoCsv);

  const usuariosCsv = toCsv(
    ["nome", "email", "perfil", "creditos", "treinos", "avaliacoes", "ultimoAcesso"],
    usuarios.map((item) => ({
      nome: toText(item.nome),
      email: toText(item.email),
      perfil: toText(item.perfil),
      creditos: toText(item.creditos),
      treinos: toText(item.treinos),
      avaliacoes: toText(item.avaliacoes),
      ultimoAcesso: toText(item.ultimoAcesso)
    }))
  );
  triggerDownload("usuarios.csv", usuariosCsv);

  const simuladosCsv = toCsv(
    ["simulado", "execucoes", "conclusoes", "acertoMedio", "creditosConsumidos"],
    simulados.map((item) => ({
      simulado: toText(item.simulado),
      execucoes: toText(item.execucoes),
      conclusoes: toText(item.conclusoes),
      acertoMedio: item.acertoMedio === null ? "—" : `${Number(item.acertoMedio).toFixed(1)}%`,
      creditosConsumidos: toText(item.creditosConsumidos)
    }))
  );
  triggerDownload("simulados.csv", simuladosCsv);

  if (questoes.length) {
    const questoesCsv = toCsv(
      ["questao", "simulado", "erros", "acerto"],
      questoes.map((item) => ({
        questao: toText(item.questao),
        simulado: toText(item.simulado),
        erros: toText(item.erros),
        acerto: item.acerto === null ? "—" : `${Number(item.acerto).toFixed(1)}%`
      }))
    );
    triggerDownload("questoes_top_erradas.csv", questoesCsv);
  }
}

export {
  buildReportData,
  downloadReportCsvFiles
};
