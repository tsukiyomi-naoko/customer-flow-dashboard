
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
    const weekday = d.getDay();
    const base = [0.8, 0.9, 0.95, 1.0, 1.2, 1.35, 1.15][weekday];
    const trend = 0.9 + (i / days) * 0.2;
    const noise = 0.85 + Math.random() * 0.3;
    const customers = Math.round(140 * base * trend * noise);
    arr.push({ date: d, dateKey: d.toISOString().slice(0, 10), weekday, customers });
  }
  return arr;
}

function groupByWeek(data) {
  const byWeek = new Map();
  for (const row of data) {
    const d = row.date;
    const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = tmp.getUTCDay() || 7;
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
  return Array.from({length:24}, (_,h)=>{
    const morning = Math.max(0, 1 - Math.abs(h - 12) / 6);
    const evening = Math.max(0, 1 - Math.abs(h - 17.5) / 4);
    const weekendBoost = weekday === 5 || weekday === 6 ? 1.2 : 1.0;
    const val = (morning * 0.8 + evening * 1.0) * weekendBoost * (0.8 + Math.random() * 0.4);
    return Math.round(val * 100);
  });
}

function recommendedHours(hourly, take = 6) {
  const pairs = hourly.map((v, h) => ({ h, v }));
  pairs.sort((a, b) => a.v - b.v);
  return pairs.slice(0, take).map((p) => p.h).sort((a, b) => a - b);
}

function fmtDateShort(d) {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function toCSV(rows, headers) {
  const esc = (v) => typeof v === "string" ? '"' + v.replace(/"/g, '""') + '"' : v ?? "";
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
function toCSVWithHeaders(rows, keys, headerLabels) {
  const esc = (v) => (typeof v === "string" ? '"' + v.replace(/"/g, '""') + '"' : v ?? "");
  const header = headerLabels.join(",");
  const lines = rows.map((r) => keys.map((k) => esc(r[k])).join(","));
  return [header, ...lines].join("\n");
}

export default function App() {
  const [seed, setSeed] = React.useState(1337);
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [view, setView] = React.useState("day");
  const [lang, setLang] = React.useState("en");

  const [editingTitle, setEditingTitle] = React.useState(false);
  const [titleInput, setTitleInput] = React.useState("");
  const [customTitle, setCustomTitle] = React.useState(null);
  const storageKeyForLang = (lng) => `cfd.title.${lng}`;
  React.useEffect(()=>{
    try {
      const saved = localStorage.getItem(storageKeyForLang(lang));
      setCustomTitle(saved);
      setTitleInput(saved ?? "");
    } catch {}
  }, [lang]);
  const t = (k)=> (messages[lang] && messages[lang][k]) || k;
  const displayTitle = customTitle ?? t('dashboardTitle');
  const startEdit = ()=>{ setTitleInput(displayTitle); setEditingTitle(true); };
  const commitEdit = ()=>{
    const val = (titleInput || '').trim();
    if (!val || val === t('dashboardTitle')) {
      setCustomTitle(null);
      try { localStorage.removeItem(storageKeyForLang(lang)); } catch {}
    } else {
      setCustomTitle(val);
      try { localStorage.setItem(storageKeyForLang(lang), val); } catch {}
    }
    setEditingTitle(false);
  };
  const cancelEdit = ()=>{ setEditingTitle(false); setTitleInput(displayTitle); };

  const series = React.useMemo(()=> makeMockSeries(90, seed), [seed]);
  const weekly = React.useMemo(()=> groupByWeek(series), [series]);
  const dayData = React.useMemo(()=> series.map((r)=>({ name: fmtDateShort(r.date), customers:r.customers, weekday:r.weekday, date:r.date })), [series]);
  const todayKey = selectedDate.toISOString().slice(0,10);
  const todayRow = series.find((r)=> r.dateKey===todayKey) ?? series[series.length-1];
  const hourly = React.useMemo(()=> makeHourlyProfile(99, todayRow?.weekday ?? 3), [todayRow]);
  const recHours = React.useMemo(()=> recommendedHours(hourly, 6), [hourly]);

  const handleExport = ()=>{
    const dailyRows = series.map((r)=>({ date:r.dateKey, weekday: dayNamesMap[lang][r.weekday], customers:r.customers }));
    const weeklyRows = weekly.map((w)=>({ week:w.key, avg_per_day:w.avg, total:w.total }));
    const hourlyRows = HOURS.map((h)=>({ hour:h, index:hourly[h] }));
    const dailyLabels = [messages[lang].dateLabel, messages[lang].weekdayLabel, messages[lang].customers];
    const weeklyLabels = [messages[lang].weekLabel, messages[lang].avgPerDay, messages[lang].totalLabel];
    const hourlyLabels = [messages[lang].hourLabel, messages[lang].index];
    const csv = [
      `# ${messages[lang].daily}`,
      toCSVWithHeaders(dailyRows, ['date','weekday','customers'], dailyLabels),
      '',
      `# ${messages[lang].weekly}`,
      toCSVWithHeaders(weeklyRows, ['week','avg_per_day','total'], weeklyLabels),
      '',
      `# ${messages[lang].hourlySelected}`,
      toCSVWithHeaders(hourlyRows, ['hour','index'], hourlyLabels),
    ].join('\n');
    const fname = `customer-flow-${todayKey}.csv`;
    downloadCSV(fname, csv);
  };

  const dayCount = todayRow?.customers ?? 0;
  const last7 = series.slice(-7).reduce((s,r)=> s+r.customers, 0);
  const weekCount = last7;
  const recHourBadges = recHours.map((h)=>(
    <span key={h} style={{border:'1px solid #ddd', borderRadius:6, padding:'2px 6px', fontSize:12, marginRight:4}}>
      {String(h).padStart(2,'0')}:00–{String((h+1)%24).padStart(2,'0')}
    </span>
  ));

  return (
    <div style={{minHeight:'100vh', background:'#f8f9fc', color:'#121418'}}>
      <header style={{position:'sticky', top:0, background:'rgba(255,255,255,.8)', borderBottom:'1px solid #eee', backdropFilter:'blur(6px)'}}>
        <div style={{maxWidth:1120, margin:'0 auto', padding:'12px 16px', display:'flex', alignItems:'center', gap:8}}>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <span>📅</span>
            {editingTitle ? (
              <input
                value={titleInput}
                onChange={(e)=>setTitleInput(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={(e)=>{ if(e.key==='Enter') commitEdit(); if(e.key==='Escape') cancelEdit(); }}
                placeholder={messages[lang].editTitle}
                autoFocus
                style={{fontSize:18, fontWeight:600, border:'none', outline:'none', background:'transparent'}}
              />
            ) : (
              <>
                <h1 onClick={startEdit} title={messages[lang].editTitle} style={{fontSize:18, fontWeight:600, cursor:'text', margin:0}}>{displayTitle}</h1>
                <button onClick={startEdit} title={messages[lang].editTitle} style={{marginLeft:4, border:'1px solid #ddd', borderRadius:999, padding:4}}>✏️</button>
              </>
            )}
          </div>
          <div style={{marginLeft:'auto', display:'flex', gap:8, alignItems:'center'}}>
            <select value={view} onChange={(e)=>setView(e.target.value)}>
              <option value="day">{messages[lang].day}</option>
              <option value="week">{messages[lang].week}</option>
            </select>
            <select value={lang} onChange={(e)=>setLang(e.target.value)}>
              <option value="en">{messages[lang].english}</option>
              <option value="fr">{messages[lang].french}</option>
            </select>
            <input type="number" value={seed} onChange={(e)=>setSeed(Number(e.target.value)||1)} style={{width:100}}/>
            <button onClick={()=>setSeed(s=>s+1)}>🔄 {messages[lang].mockData}</button>
            <button onClick={handleExport}>⬇️ {messages[lang].exportCsv}</button>
          </div>
        </div>
      </header>

      <main style={{maxWidth:1120, margin:'0 auto', padding:'16px'}}>
        <p>Live preview build.</p>
      </main>
    </div>
  )
}

