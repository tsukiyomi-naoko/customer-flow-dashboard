import React, { useMemo, useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Calendar as CalendarIcon, Download, RefreshCw, Clock3, Pencil } from "lucide-react";

// -------------------------------
// Helpers: mock data + utilities
// -------------------------------
const HOURS = Array.from({ length: 24 }, (_, h) => h);
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]; // legacy (kept)
const dayNamesMap = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  fr: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
};

// Lightweight i18n
const messages = {
  en: {
    dashboardTitle: "Customer Flow Dashboard",
    view: "View",
    day: "Day",
    week: "Week",
    daily: "Daily",
    weekly: "Weekly",
    flowRate: "Flow Rate",
    mockData: "Mock data",
    exportCsv: "Export CSV",
    dayCount: "Day Count",
    sevenDayTotal: "7-Day Total",
    todaysProfile: "Today’s Profile",
    recommended: "Recommended:",
    notes: "Notes",
    notePlaceholder: "Add a quick note…",
    tip: "Tip: lower index hours are typically quieter.",
    planShopping: "Plan Your Shopping",
    calendar: "Calendar",
    bestHours: "Best Hours",
    settings: "Settings",
    devicePreset: "Device Preset",
    devices: "Devices",
    currentDevice: "Store/Device",
    manageDevices: "Manage",
    addDevice: "Add store/device",
    deviceName: "Name",
    preset: "Preset",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    defaultDeviceName: "Default store",
    autoResponsive: "Auto (responsive)",
    desktop: "Desktop",
    tablet: "Tablet",
    weekStarts: "Week Starts",
    sunday: "Sunday",
    mondayIso: "Monday (ISO)",
    dataSource: "Data Source",
    mock: "Mock Data",
    apiComing: "API (coming)",
    csvComing: "CSV Upload (coming)",
    footerMock: "Mock data only. Replace with your analytics feed when ready.",
    footerResp: "Responsive: desktop & tablet friendly",
    customers: "Customers",
    avgPerDay: "Avg / day",
    index: "Index",
    language: "Language",
    english: "English",
    french: "Français",
    hourlySelected: "Hourly (selected day)",
    editTitle: "Edit title…",
    // CSV header labels
    dateLabel: "Date",
    weekdayLabel: "Weekday",
    weekLabel: "Week",
    hourLabel: "Hour",
    totalLabel: "Total",
    trailingWeek: "Current week",
  },
  fr: {
    dashboardTitle: "Tableau de fréquentation",
    view: "Vue",
    day: "Jour",
    week: "Semaine",
    daily: "Quotidien",
    weekly: "Hebdomadaire",
    flowRate: "Taux de fréquentation",
    mockData: "Données fictives",
    exportCsv: "Exporter CSV",
    dayCount: "Total du jour",
    sevenDayTotal: "Total 7 jours",
    todaysProfile: "Profil du jour",
    recommended: "Recommandé :",
    notes: "Notes",
    notePlaceholder: "Ajouter une note…",
    tip: "Astuce : les heures avec un indice plus bas sont généralement plus calmes.",
    planShopping: "Planifier vos achats",
    calendar: "Calendrier",
    bestHours: "Meilleures heures",
    settings: "Paramètres",
    devicePreset: "Préréglage d’appareil",
    devices: "Appareils",
    currentDevice: "Magasin/Appareil",
    manageDevices: "Gérer",
    addDevice: "Ajouter magasin/appareil",
    deviceName: "Nom",
    preset: "Préréglage",
    delete: "Supprimer",
    save: "Enregistrer",
    cancel: "Annuler",
    defaultDeviceName: "Magasin par défaut",
    autoResponsive: "Auto (responsive)",
    desktop: "Ordinateur",
    tablet: "Tablette",
    weekStarts: "Début de semaine",
    sunday: "Dimanche",
    mondayIso: "Lundi (ISO)",
    dataSource: "Source de données",
    mock: "Données fictives",
    apiComing: "API (bientôt)",
    csvComing: "Import CSV (bientôt)",
    footerMock: "Données fictives. Remplacez par votre source analytique au besoin.",
    footerResp: "Responsive : ordinateur et tablette",
    customers: "Clients",
    avgPerDay: "Moyenne / jour",
    index: "Indice",
    language: "Langue",
    english: "Anglais",
    french: "Français",
    hourlySelected: "Horaire (jour sélectionné)",
    editTitle: "Modifier le titre…",
    // CSV header labels
    dateLabel: "Date",
    weekdayLabel: "Jour",
    weekLabel: "Semaine",
    hourLabel: "Heure",
    totalLabel: "Total",
    trailingWeek: "Semaine en cours",
  }
};
const t = (k, lang) => (messages[lang] && messages[lang][k]) || k;

function seededRand(seed) {
  // simple xorshift for reproducible mock data
  let x = seed | 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return Math.abs(x) / 0x7fffffff;
  };
}

function makeMockSeries(days = 60, seed = 1337) {
  const rnd = seededRand(seed);
  const today = new Date();
  const arr = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    // Baseline by weekday (busier Fri/Sat/Sun)
    const weekday = d.getDay();
    const base = [0.8, 0.9, 0.95, 1.0, 1.2, 1.35, 1.15][weekday];
    const trend = 0.9 + (i / days) * 0.2; // gentle trend across window
    const noise = 0.85 + rnd() * 0.3; // random jitter
    const customers = Math.round(140 * base * trend * noise);
    arr.push({
      date: d,
      dateKey: d.toISOString().slice(0, 10),
      weekday,
      customers,
    });
  }
  return arr;
}

function groupByWeek(data) {
  // ISO weeks for a quick weekly aggregation
  const byWeek = new Map();
  for (const row of data) {
    const d = row.date;
    const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = tmp.getUTCDay() || 7; // 1..7
    tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((tmp - yearStart) / 86400000 + 1) / 7);
    const key = `${tmp.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
    if (!byWeek.has(key)) byWeek.set(key, { key, total: 0, days: 0 });
    const bucket = byWeek.get(key);
    bucket.total += row.customers;
    bucket.days += 1;
  }
  return Array.from(byWeek.values()).map((w) => ({ ...w, avg: Math.round(w.total / w.days) }));
}

function makeHourlyProfile(seed = 42, weekday = 3) {
  const rnd = seededRand(seed + weekday * 97);
  // Shape: quiet early morning, ramp to 12-14h, dip, then 16-19h busy, taper
  return HOURS.map((h) => {
    const morning = Math.max(0, 1 - Math.abs(h - 12) / 6);
    const evening = Math.max(0, 1 - Math.abs(h - 17.5) / 4);
    const weekendBoost = weekday === 5 || weekday === 6 ? 1.2 : 1.0;
    const val = (morning * 0.8 + evening * 1.0) * weekendBoost * (0.8 + rnd() * 0.4);
    return Math.round(val * 100);
  });
}

function recommendedHours(hourly, take = 6) {
  // return the N lowest-traffic hour indices as recommendations
  const pairs = hourly.map((v, h) => ({ h, v }));
  pairs.sort((a, b) => a.v - b.v);
  return pairs.slice(0, take).map((p) => p.h).sort((a, b) => a - b);
}

function fmtDateShort(d) {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// CSV helpers
function toCSV(rows, headers) {
  const esc = (v) =>
    typeof v === "string" ? '"' + v.replace(/"/g, '""') + '"' : v ?? "";
  return [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n");
}
function downloadCSV(filename, text) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Same as toCSV but allows localized header labels while keeping stable data keys
function toCSVWithHeaders(rows, keys, headerLabels) {
  const esc = (v) => (typeof v === "string" ? '"' + v.replace(/"/g, '""') + '"' : v ?? "");
  const header = headerLabels.join(",");
  const lines = rows.map((r) => keys.map((k) => esc(r[k])).join(","));
  return [header, ...lines].join("\n");
}

// -------------------------------
// Tiny runtime tests (dev only) — won’t throw, just logs
// -------------------------------
function runDevTests() {
  try {
    // toCSV quoting & newline
    const rows = [
      { a: 'plain', b: 1 },
      { a: 'with,comma', b: 2 },
      { a: 'with "quote"', b: 3 },
    ];
    const csv = toCSV(rows, ['a', 'b']);
    console.assert(csv.split('\n').length === 4, 'CSV should have header + 3 rows');
    console.assert(csv.includes('"with,comma"'), 'CSV should quote values containing commas');
    console.assert(csv.includes('"with ""quote"""'), 'CSV should escape quotes');

    // recommendedHours returns sorted hours of requested length
    const rh = recommendedHours([10, 5, 7, 1, 9], 2);
    console.assert(Array.isArray(rh) && rh.length === 2, 'recommendedHours length');
    console.assert(rh[0] <= rh[1], 'recommendedHours sorted asc');

    // groupByWeek averages for a simple one-week sample
    const base = new Date('2025-01-06'); // Monday
    const sample = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(base.getFullYear(), base.getMonth(), base.getDate() + i),
      dateKey: 'n/a',
      weekday: 0,
      customers: i + 1, // 1..7 => total 28, avg 4
    }));
    const weekly = groupByWeek(sample);
    console.assert(weekly[0].total === 28 && weekly[0].avg === 4, 'groupByWeek avg');

    // CSV localization smoke tests
    const sampleRows = [
      { date: '2025-01-01', weekday: 'Wed', customers: 10 },
    ];
    const enHeader = toCSVWithHeaders(
      sampleRows,
      ['date','weekday','customers'],
      [t('dateLabel','en'), t('weekdayLabel','en'), t('customers','en')]
    ).split('\n')[0];
    const frHeader = toCSVWithHeaders(
      sampleRows,
      ['date','weekday','customers'],
      [t('dateLabel','fr'), t('weekdayLabel','fr'), t('customers','fr')]
    ).split('\n')[0];
    console.assert(enHeader === 'Date,Weekday,Customers', 'EN CSV header labels');
    console.assert(frHeader === 'Date,Jour,Clients', 'FR CSV header labels');

    // i18n: trailing week label
    console.assert(t('trailingWeek','en') === 'Current week', 'EN trailingWeek label');
    console.assert(t('trailingWeek','fr') === 'Semaine en cours', 'FR trailingWeek label');

    // Extra tests: ensure toCSVWithHeaders returns correct line count
    const twoLines = toCSVWithHeaders([{hour: 9, index: 42}], ['hour','index'], ['Hour','Index']);
    console.assert(twoLines.split('\n').length === 2, 'CSV should be header + 1 row');
  } catch (e) {
    console.warn('Dev tests skipped/failed:', e);
  }
}
if (typeof window !== 'undefined' && !(window).__CFD_TESTED__) {
  (window).__CFD_TESTED__ = true;
  runDevTests();
}

// -------------------------------
// UI
// -------------------------------
export default function CustomerFlowDashboard() {
  const [seed, setSeed] = useState(1337);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState("day"); // "day" | "week"
  const [lang, setLang] = useState("en"); // "en" | "fr"

  // Title editing with per-language persistence
  const storageKeyForLang = (lng) => `cfd.title.${lng}`;
  const loadTitle = (lng) => (typeof window !== 'undefined' ? localStorage.getItem(storageKeyForLang(lng)) : null);
  const saveTitle = (lng, title) => {
    try {
      if (title && title.trim()) localStorage.setItem(storageKeyForLang(lng), title.trim());
      else localStorage.removeItem(storageKeyForLang(lng));
    } catch {}
  };
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [customTitle, setCustomTitle] = useState(null);
  useEffect(() => {
    const saved = loadTitle(lang);
    setCustomTitle(saved);
    setTitleInput(saved ?? "");
  }, [lang]);
  const displayTitle = customTitle ?? t('dashboardTitle', lang);
  const startEdit = () => { setTitleInput(displayTitle); setEditingTitle(true); };
  const commitEdit = () => {
    const val = (titleInput || "").trim();
    if (!val || val === t('dashboardTitle', lang)) {
      setCustomTitle(null); // fall back to i18n default
      saveTitle(lang, "");
    } else {
      setCustomTitle(val);
      saveTitle(lang, val);
    }
    setEditingTitle(false);
  };
  const cancelEdit = () => { setEditingTitle(false); setTitleInput(displayTitle); };

  // ---------------- Devices / Stores management ----------------
  const DEVICES_KEY = 'cfd.devices';
  const CURRENT_DEVICE_KEY = 'cfd.currentDevice';
  const makeId = () => `dev-${Date.now()}-${Math.floor(Math.random()*1e6)}`;
  const loadDevices = () => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(DEVICES_KEY) : null;
      if (raw) return JSON.parse(raw);
    } catch {}
    return [{ id: 'dev-1', name: t('defaultDeviceName', lang), preset: 'auto' }];
  };
  const saveDevices = (list) => { try { localStorage.setItem(DEVICES_KEY, JSON.stringify(list)); } catch {} };
  const loadCurrentDevice = (list) => {
    try {
      const id = typeof window !== 'undefined' ? localStorage.getItem(CURRENT_DEVICE_KEY) : null;
      if (id && list.some(d => d.id === id)) return id;
    } catch {}
    return list[0]?.id;
  };

  const [devices, setDevices] = useState(() => loadDevices());
  const [currentDeviceId, setCurrentDeviceId] = useState(() => loadCurrentDevice(loadDevices()));
  const [managingDevices, setManagingDevices] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState("");
  const [newDevicePreset, setNewDevicePreset] = useState("auto");

  useEffect(() => { saveDevices(devices); }, [devices]);
  useEffect(() => { try { localStorage.setItem(CURRENT_DEVICE_KEY, currentDeviceId || ''); } catch {} }, [currentDeviceId]);

  const currentDevice = devices.find(d => d.id === currentDeviceId) || devices[0];
  const updateCurrentPreset = (preset) => {
    setDevices(prev => prev.map(d => d.id === currentDevice.id ? { ...d, preset } : d));
  };
  const addDevice = () => {
    const name = (newDeviceName || '').trim() || `${t('defaultDeviceName', lang)} ${devices.length+1}`;
    const dev = { id: makeId(), name, preset: newDevicePreset };
    setDevices(prev => [...prev, dev]);
    setCurrentDeviceId(dev.id);
    setNewDeviceName("");
    setNewDevicePreset("auto");
  };
  const removeDevice = (id) => {
    setDevices(prev => {
      const list = prev.filter(d => d.id !== id);
      if (id === currentDeviceId && list.length) setCurrentDeviceId(list[0].id);
      return list.length ? list : [{ id: 'dev-1', name: t('defaultDeviceName', lang), preset: 'auto' }];
    });
  };

  const series = useMemo(() => makeMockSeries(90, seed), [seed]);
  const weekly = useMemo(() => groupByWeek(series), [series]);

  const dayData = useMemo(
    () =>
      series.map((r) => ({ name: fmtDateShort(r.date), customers: r.customers, weekday: r.weekday, date: r.date })),
    [series]
  );

  const todayKey = selectedDate.toISOString().slice(0, 10);
  const todayRow = series.find((r) => r.dateKey === todayKey) ?? series.at(-1);
  const hourly = useMemo(() => makeHourlyProfile(99, todayRow?.weekday ?? 3), [todayRow]);
  const recHours = useMemo(() => recommendedHours(hourly, 6), [hourly]);

  const handleExport = () => {
    const dailyRows = series.map((r) => ({
      date: r.dateKey,
      weekday: dayNamesMap[lang][r.weekday],
      customers: r.customers,
    }));
    const weeklyRows = weekly.map((w) => ({
      week: w.key,
      avg_per_day: w.avg,
      total: w.total,
    }));
    const hourlyRows = HOURS.map((h) => ({ hour: h, index: hourly[h] }));

    const dailyKeys = ["date", "weekday", "customers"];
    const weeklyKeys = ["week", "avg_per_day", "total"];
    const hourlyKeys = ["hour", "index"];

    const dailyLabels = [t('dateLabel', lang), t('weekdayLabel', lang), t('customers', lang)];
    const weeklyLabels = [t('weekLabel', lang), t('avgPerDay', lang), t('totalLabel', lang)];
    const hourlyLabels = [t('hourLabel', lang), t('index', lang)];

    const csv = [
      `# ${t('daily', lang)}`,
      toCSVWithHeaders(dailyRows, dailyKeys, dailyLabels),
      "",
      `# ${t('weekly', lang)}`,
      toCSVWithHeaders(weeklyRows, weeklyKeys, weeklyLabels),
      "",
      `# ${t('hourlySelected', lang)}`,
      toCSVWithHeaders(hourlyRows, hourlyKeys, hourlyLabels),
    ].join("\n");

    downloadCSV(`customer-flow-${todayKey}.csv`, csv);
  };

  const dayCount = todayRow?.customers ?? 0;
  const last7 = series.slice(-7).reduce((sum, r) => sum + r.customers, 0);
  const weekCount = last7;

  const recHourBadges = recHours.map((h) => (
    <Badge key={h} variant="secondary" className="text-xs">
      {String(h).padStart(2, "0")}:00–{String((h + 1) % 24).padStart(2, "0")}
    </Badge>
  ));

  return (
    <div className="min-h-screen w-full bg-[rgb(248,249,252)] text-[rgb(18,20,24)]">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2 relative group">
            <CalendarIcon className="w-5 h-5" />
            {editingTitle ? (
              <Input
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') cancelEdit(); }}
                placeholder={t('editTitle', lang)}
                autoFocus
                className="text-lg md:text-xl font-semibold p-0 h-auto border-0 focus-visible:ring-0 bg-transparent"
              />
            ) : (
              <>
                <h1
                  className="text-lg md:text-xl font-semibold cursor-text"
                  onClick={startEdit}
                  title={t('editTitle', lang)}
                  role="button"
                  aria-label={t('editTitle', lang)}
                >
                  {displayTitle}
                </h1>
                <button
                  type="button"
                  onClick={startEdit}
                  aria-label={t('editTitle', lang)}
                  className="ml-1 p-1 rounded-full hover:bg-muted/50 transition-opacity opacity-0 group-hover:opacity-100"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Select value={view} onValueChange={setView}>
              <SelectTrigger className="w-[120px]"><SelectValue placeholder={t('view', lang)} /></SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="day">{t('day', lang)}</SelectItem>
                <SelectItem value="week">{t('week', lang)}</SelectItem>
              </SelectContent>
            </Select>
            {/* Language selector */}
            <Select value={lang} onValueChange={setLang}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder={t('language', lang)} /></SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="en">{t('english', lang)}</SelectItem>
                <SelectItem value="fr">{t('french', lang)}</SelectItem>
              </SelectContent>
            </Select>
            <Input
              className="w-[120px]"
              type="number"
              min={1}
              step={1}
              value={seed}
              onChange={(e) => setSeed(Number(e.target.value) || 1)}
              placeholder="Seed"
            />
            <Button variant="outline" onClick={() => setSeed((s) => s + 1)} className="gap-2">
              <RefreshCw className="w-4 h-4" /> {t('mockData', lang)}
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleExport}>
              <Download className="w-4 h-4" /> {t('exportCsv', lang)}
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base md:text-lg">{t('flowRate', lang)} ({view === "day" ? t('daily', lang) : t('weekly', lang)})</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="w-full h-[280px] md:h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  {view === "day" ? (
                    <AreaChart data={dayData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                      <defs>
                        <linearGradient id="flow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                      <XAxis dataKey="name" interval={6} tick={{ fontSize: 12 }} />
                      <YAxis width={40} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v) => [v, t('customers', lang)]} />
                      <Area type="monotone" dataKey="customers" stroke="#3b82f6" fill="url(#flow)" strokeWidth={2} />
                    </AreaChart>
                  ) : (
                    <BarChart data={weekly} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                      <XAxis dataKey="key" tick={{ fontSize: 12 }} />
                      <YAxis width={40} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v) => [v, t('avgPerDay', lang)]} />
                      <Bar dataKey="avg" fill="#22c55e" />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-1">
                <CardTitle className="text-sm">{t('dayCount', lang)}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-3xl md:text-4xl font-semibold tabular-nums">{dayCount}</p>
                <p className="text-xs text-muted-foreground">{fmtDateShort(todayRow.date)} ({dayNamesMap[lang][todayRow.weekday]})</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="pb-1">
                <CardTitle className="text-sm">{t('sevenDayTotal', lang)}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-3xl md:text-4xl font-semibold tabular-nums">{weekCount}</p>
                <p className="text-xs text-muted-foreground">{t('trailingWeek', lang)}</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="pb-1">
                <CardTitle className="text-sm">{t('todaysProfile', lang)}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="w-full h-[120px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={HOURS.map((h) => ({ h, v: hourly[h] }))}>
                      <XAxis dataKey="h" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} width={28} />
                      <Tooltip formatter={(v) => [v, t('index', lang)]} labelFormatter={(label) => `${label}:00`} />
                      <Line type="monotone" dataKey="v" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-1 mt-2 items-center">
                  <Clock3 className="w-4 h-4" />
                  <span className="text-xs text-muted-foreground mr-1">{t('recommended', lang)} </span>
                  {recHourBadges}
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="pb-1">
                <CardTitle className="text-sm">{t('notes', lang)}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Input placeholder={t('notePlaceholder', lang)} />
                <p className="text-xs text-muted-foreground mt-2">{t('tip', lang)}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4 md:space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base md:text-lg">{t('planShopping', lang)}</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <Tabs defaultValue="calendar" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="calendar">{t('calendar', lang)}</TabsTrigger>
                  <TabsTrigger value="hours">{t('bestHours', lang)}</TabsTrigger>
                </TabsList>
                <TabsContent value="calendar" className="mt-3">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(d) => d && setSelectedDate(d)}
                    className="rounded-md border"
                  />
                </TabsContent>
                <TabsContent value="hours" className="mt-3">
                  <div className="w-full h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={HOURS.map((h) => ({ h, v: hourly[h] }))}>
                        <XAxis dataKey="h" tick={{ fontSize: 12 }} />
                        <YAxis width={32} tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(v) => [v, t('index', lang)]} labelFormatter={(label) => `${label}:00`} />
                        <Bar dataKey="v" fill="#0ea5e9" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">{recHourBadges}</div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base md:text-lg">{t('settings', lang)}</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm">{t('currentDevice', lang)}</span>
                  <div className="flex items-center gap-2">
                    <Select value={currentDeviceId} onValueChange={setCurrentDeviceId}>
                      <SelectTrigger className="w-[180px]"><SelectValue placeholder={t('currentDevice', lang)} /></SelectTrigger>
                      <SelectContent align="end">
                        {devices.map(d => (
                          <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={() => setManagingDevices(v => !v)}>{t('manageDevices', lang)}</Button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm">{t('devicePreset', lang)}</span>
                  <Select value={currentDevice?.preset || 'auto'} onValueChange={updateCurrentPreset}>
                    <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                    <SelectContent align="end">
                      <SelectItem value="auto">{t('autoResponsive', lang)}</SelectItem>
                      <SelectItem value="desktop">{t('desktop', lang)}</SelectItem>
                      <SelectItem value="tablet">{t('tablet', lang)}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {managingDevices && (
                  <div className="rounded-lg border p-3 space-y-3 bg-muted/20">
                    <div className="flex items-center gap-2">
                      <Input value={newDeviceName} onChange={(e)=>setNewDeviceName(e.target.value)} placeholder={t('deviceName', lang)} className="w-[200px]" />
                      <Select value={newDevicePreset} onValueChange={setNewDevicePreset}>
                        <SelectTrigger className="w-[150px]"><SelectValue placeholder={t('preset', lang)} /></SelectTrigger>
                        <SelectContent align="start">
                          <SelectItem value="auto">{t('autoResponsive', lang)}</SelectItem>
                          <SelectItem value="desktop">{t('desktop', lang)}</SelectItem>
                          <SelectItem value="tablet">{t('tablet', lang)}</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" onClick={addDevice}>{t('addDevice', lang)}</Button>
                    </div>
                    <div className="space-y-2">
                      {devices.map(d => (
                        <div key={d.id} className="flex items-center justify-between gap-2">
                          <div className="text-sm truncate">{d.name} <span className="opacity-60">— {t('preset', lang)}: {d.preset}</span></div>
                          <Button variant="ghost" size="sm" onClick={()=>removeDevice(d.id)} disabled={devices.length<=1}>{t('delete', lang)}</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm">{t('weekStarts', lang)}</span>
                <Select defaultValue="sun">
                  <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="sun">{t('sunday', lang)}</SelectItem>
                    <SelectItem value="mon">{t('mondayIso', lang)}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm">{t('dataSource', lang)}</span>
                <Select defaultValue="mock">
                  <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="mock">{t('mock', lang)}</SelectItem>
                    <SelectItem value="api" disabled>{t('apiComing', lang)}</SelectItem>
                    <SelectItem value="csv" disabled>{t('csvComing', lang)}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="mx-auto max-w-7xl px-4 pb-6 pt-2 text-xs text-muted-foreground flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
        <span>
          {t('footerMock', lang)}
        </span>
        <span className="opacity-70">•</span>
        <span>{t('footerResp', lang)}</span>
      </footer>
    </div>
  );
}
