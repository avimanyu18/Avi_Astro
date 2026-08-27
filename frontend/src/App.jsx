import React, { useState, useEffect, useRef } from 'react';
import Chart from './Chart';
import MapPicker from './MapPicker';
import {
  calculatePlanetaryPositions,
  calculateDivisionalCharts,
  calculateVimshottariDasha,
  calculatePanchang,
  calculateDoshas,
  detectYogas,
  getSignInfo,
  getNakshatraInfo,
  queryAstrologerAI
} from './vedicEngine';

// ═══════════════════════════════════════════════
// PRIMARY OWNER BIRTH PROFILE — HARDCODED
// Name   : Avimanyu Singh Chauhan
// DOB    : 30 September 2001
// TOB    : 3:45 PM (15:45)
// Gender : Male
// Place  : Birgunj, Madhesh Province, Nepal
// Lat/Lon: 27.0104° N, 85.0625° E
// TZ     : Asia/Kathmandu (UTC +5:45)
// ═══════════════════════════════════════════════
const MY_PROFILE = {
  name: 'Avimanyu Singh Chauhan',
  dob: '2001-09-30',
  tob: '15:45',
  gender: 'Male',
  city: 'Birgunj, Madhesh Province, Nepal',
  lat: 27.0104,
  lon: 85.0625,
  tz: 5.75   // UTC +5:45 (Nepal Standard Time)
};

const SAMPLE_PROFILES = [
  {
    ...MY_PROFILE,
    name: 'Avimanyu Singh Chauhan (My Chart)'
  },
  {
    name: 'Lord Krishna (Divine Chart)',
    dob: '-3228-07-18',
    tob: '23:45',
    gender: 'Male',
    city: 'Mathura, Uttar Pradesh, India',
    lat: 27.4924,
    lon: 77.6737,
    tz: 5.5
  },
  {
    name: 'Swami Vivekananda',
    dob: '1863-01-12',
    tob: '06:33',
    gender: 'Male',
    city: 'Kolkata, West Bengal, India',
    lat: 22.5726,
    lon: 88.3639,
    tz: 5.5
  },
  {
    name: 'Steve Jobs',
    dob: '1955-02-24',
    tob: '19:15',
    gender: 'Male',
    city: 'San Francisco, California, USA',
    lat: 37.7749,
    lon: -122.4194,
    tz: -8.0
  }
];

const VARGA_LIST = [
  { id: 'D1', label: 'D1 Rashi', desc: 'Natal Chart' },
  { id: 'D2', label: 'D2 Hora', desc: 'Wealth & Assets' },
  { id: 'D3', label: 'D3 Drekkana', desc: 'Siblings & Courage' },
  { id: 'D4', label: 'D4 Chaturthamsha', desc: 'Property & Destiny' },
  { id: 'D7', label: 'D7 Saptamsha', desc: 'Children & Progeny' },
  { id: 'D9', label: 'D9 Navamsha', desc: 'Spouse & Soul Destiny' },
  { id: 'D10', label: 'D10 Dashamsha', desc: 'Career & Authority' },
  { id: 'D12', label: 'D12 Dwadasamsha', desc: 'Parents & Ancestors' },
  { id: 'D16', label: 'D16 Shodashamsha', desc: 'Vehicles & Comforts' },
  { id: 'D20', label: 'D20 Vimsamsha', desc: 'Spiritual Progress' },
  { id: 'D24', label: 'D24 Siddhamsa', desc: 'Higher Education' },
  { id: 'D27', label: 'D27 Bhamsa', desc: 'Strengths & Talents' },
  { id: 'D30', label: 'D30 Trimsamsha', desc: 'Misfortunes & Health' },
  { id: 'D40', label: 'D40 Khavedamsha', desc: 'Auspicious Events' },
  { id: 'D45', label: 'D45 Akshavedamsha', desc: 'Character Integrity' },
  { id: 'D60', label: 'D60 Shashtiamsha', desc: 'Fine Karmic Roots' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedProfile, setSelectedProfile] = useState(SAMPLE_PROFILES[0]);

  // Form & Map Location State — pre-loaded with owner's birth details
  const [profileName, setProfileName] = useState(MY_PROFILE.name);
  const [dob, setDob] = useState(MY_PROFILE.dob);
  const [tob, setTob] = useState(MY_PROFILE.tob);
  const [gender, setGender] = useState(MY_PROFILE.gender);
  const [cityInput, setCityInput] = useState(MY_PROFILE.city);
  const [lat, setLat] = useState(MY_PROFILE.lat);
  const [lon, setLon] = useState(MY_PROFILE.lon);
  const [tzOffset, setTzOffset] = useState(MY_PROFILE.tz);

  // Selected Vargas & Chart layout
  const [vargaTab, setVargaTab] = useState('D1');
  const [layout, setLayout] = useState('south');

  // Chat State
  const [messages, setMessages] = useState([
    {
      sender: 'astrologer',
      text: '🙏 Namaste, Avimanyu Singh Chauhan Ji!\n\nWelcome to your personal Vedic Astrology App. Your Janam Kundli has been computed from your birth details:\n\n📅 30 September 2001  ⏰ 3:45 PM\n📍 Birgunj, Madhesh Province, Nepal\n\nI have calculated your complete:\n✦ 16 Shodashavargas (D1–D60)\n✦ Vimshottari Dasha Timeline\n✦ Manglik & Kalsarpa Doshas\n✦ Panchang & Active Yogas\n\nAsk me anything about your Career, Marriage, Wealth, Health, Doshas, or Sacred Remedies! 🌟'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const chatBottomRef = useRef(null);

  // Dasha Accordion
  const [expandedMD, setExpandedMD] = useState(0);

  // Astrological Engine Calculations State
  const [rawPositions, setRawPositions] = useState({});
  const [divisionalCharts, setDivisionalCharts] = useState({ D1: {} });
  const [dashaTimeline, setDashaTimeline] = useState([]);
  const [panchang, setPanchang] = useState({});
  const [doshas, setDoshas] = useState({});
  const [yogas, setYogas] = useState([]);

  // Perform precision Vedic calculations on DOB/TOB/Lat/Lon change
  useEffect(() => {
    try {
      const [y, m, d] = dob.split('-').map(v => parseInt(v, 10) || 1992);
      const [h, min] = tob.split(':').map(v => parseInt(v, 10) || 0);

      const raw = calculatePlanetaryPositions(y, m, d, h, min);
      setRawPositions(raw);

      const vargas = calculateDivisionalCharts(raw);
      setDivisionalCharts(vargas);

      const birthDate = new Date(Math.max(y, 100), m - 1, d, h, min);
      const dasha = calculateVimshottariDasha(raw.Moon, birthDate);
      setDashaTimeline(dasha);

      const pan = calculatePanchang(raw.Sun, raw.Moon);
      setPanchang(pan);

      const dsh = calculateDoshas(raw);
      setDoshas(dsh);

      const yo = detectYogas(raw);
      setYogas(yo);
    } catch (e) {
      console.error("Astrological calculation error:", e);
    }
  }, [dob, tob, lat, lon]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleLocationSelectFromMap = (loc) => {
    setCityInput(loc.name);
    setLat(loc.lat);
    setLon(loc.lon);
    setTzOffset(loc.tz || 5.5);
  };

  const handleSelectPreset = (preset) => {
    setSelectedProfile(preset);
    setProfileName(preset.name);
    setDob(preset.dob);
    setTob(preset.tob);
    setGender(preset.gender || 'Male');
    setCityInput(preset.city);
    setLat(preset.lat);
    setLon(preset.lon);
    setTzOffset(preset.tz || 5.5);
  };

  const handleSendMessage = (textToSend = null) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text }]);
    if (!textToSend) setInputMessage('');

    setTimeout(() => {
      const reply = queryAstrologerAI(text, { name: profileName, dob, tob, gender, city: cityInput }, rawPositions, dashaTimeline);
      setMessages((prev) => [...prev, { sender: 'astrologer', text: reply }]);
    }, 300);
  };

  const getChartPlanetFormat = (vargaKey) => {
    const currentVarga = divisionalCharts[vargaKey] || {};
    const formatted = {};
    for (const [p, val] of Object.entries(currentVarga)) {
      if (p === 'Lagna') continue;
      const deg = val.degree || 0;
      const signId = val.sign_id || val.signId || 1;
      const signObj = getSignInfo((signId - 1) * 30 + deg);
      formatted[p] = {
        sign: signObj.sign_name || signObj.signName,
        degree: Math.round(deg * 10) / 10,
        longitude: (signId - 1) * 30 + deg
      };
    }
    return formatted;
  };

  const lagnaInfo = rawPositions.Lagna ? getSignInfo(rawPositions.Lagna) : null;
  const moonInfo = rawPositions.Moon ? getSignInfo(rawPositions.Moon) : null;
  const nakInfo = rawPositions.Moon ? getNakshatraInfo(rawPositions.Moon) : null;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col max-w-md mx-auto relative border-x border-amber-500/20 shadow-2xl">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-50 bg-[#0f172a]/90 backdrop-blur-md border-b border-amber-500/20 p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <img src="/logo.png" alt="Avimanyu Astro AI Logo" className="w-9 h-9 rounded-full border border-amber-400/50 shadow-md glow-gold" />
          <div>
            <h1 className="font-cinzel text-base font-bold gold-gradient-text tracking-wide leading-tight">
              Avimanyu Astro AI
            </h1>
            <p className="text-[10px] text-amber-200/70 font-medium">Precision Vedic Astrology Mobile App</p>
          </div>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="text-[10px] px-2.5 py-1 border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 rounded-full font-semibold">
            ✨ 100% Standalone APK
          </span>
        </div>
      </header>

      {/* Main Body Content based on Active Tab */}
      <main className="flex-1 overflow-y-auto pb-20 p-4 space-y-4">

        {/* ACTIVE PROFILE SUMMARY */}
        <div className="glass-panel p-3.5 rounded-2xl flex items-center justify-between border-amber-500/30">
          <div>
            <div className="text-xs text-amber-400 font-semibold tracking-wider uppercase">Active Birth Profile</div>
            <div className="text-sm font-bold text-slate-100 flex items-center space-x-1">
              <span>{profileName}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[220px]">
              📅 {dob} · ⏰ {tob} · {gender === 'Male' ? '♂' : gender === 'Female' ? '♀' : '⚧'} {gender}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[220px]">
              📍 {cityInput} • {lagnaInfo ? `${lagnaInfo.sign_name} Lagna` : ''}
            </div>
          </div>
          <button
            onClick={() => setActiveTab('profile')}
            className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-semibold transition"
          >
            Edit Profile
          </button>
        </div>

        {/* TAB 1: AI ASTROLOGER CHATBOT */}
        {activeTab === 'chat' && (
          <div className="flex flex-col h-[calc(100vh-210px)]">
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-amber-600 text-white rounded-br-none shadow-md font-medium'
                        : 'glass-panel border-amber-500/30 text-slate-200 rounded-bl-none shadow-lg'
                    }`}
                  >
                    {msg.sender === 'astrologer' && (
                      <div className="text-[10px] text-amber-400 font-bold mb-1 flex items-center space-x-1">
                        <span>✨ Avimanyu AI Jyotish Guru</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  </div>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>

            <div className="py-2 overflow-x-auto whitespace-nowrap flex space-x-2 no-scrollbar">
              <button
                onClick={() => handleSendMessage("What does my career & profession look like in D10 Dashamsha?")}
                className="px-3 py-1 bg-slate-800/80 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[11px] font-medium transition"
              >
                💼 Career & D10
              </button>
              <button
                onClick={() => handleSendMessage("Tell me about my marriage and spouse characteristics in D9 Navamsha")}
                className="px-3 py-1 bg-slate-800/80 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[11px] font-medium transition"
              >
                💍 Marriage & D9
              </button>
              <button
                onClick={() => handleSendMessage("Tell me about my wealth, money, and financial prosperity")}
                className="px-3 py-1 bg-slate-800/80 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[11px] font-medium transition"
              >
                💰 Wealth & D2
              </button>
              <button
                onClick={() => handleSendMessage("What does my health and vitality look like in D30 Trimsamsha?")}
                className="px-3 py-1 bg-slate-800/80 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[11px] font-medium transition"
              >
                🏥 Health & D30
              </button>
              <button
                onClick={() => handleSendMessage("What is my current Mahadasha and Antardasha period?")}
                className="px-3 py-1 bg-slate-800/80 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[11px] font-medium transition"
              >
                ⏳ Dasha Period
              </button>
              <button
                onClick={() => handleSendMessage("Tell me about my spiritual path, dharma, and meditation practice")}
                className="px-3 py-1 bg-slate-800/80 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[11px] font-medium transition"
              >
                🕉️ Spirituality
              </button>
              <button
                onClick={() => handleSendMessage("Do I have Manglik or Kalsarpa Dosha? What remedies should I follow?")}
                className="px-3 py-1 bg-slate-800/80 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[11px] font-medium transition"
              >
                ⚠️ Doshas & Remedies
              </button>
            </div>

            <div className="pt-2 flex items-center space-x-2">
              <input
                type="text"
                placeholder="Ask about Career, Doshas, Dasha, Marriage..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-slate-900/90 border border-amber-500/30 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-400 transition"
              />
              <button
                onClick={() => handleSendMessage()}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs transition shadow-md"
              >
                Send
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: 16 SHODASHAVARGA DIVISIONAL CHARTS */}
        {activeTab === 'charts' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[11px] text-amber-300 font-semibold">Select Divisional Chart (Shodashavargas)</span>
              <div className="grid grid-cols-4 gap-1.5 p-1.5 bg-slate-900/90 border border-amber-500/20 rounded-xl max-h-36 overflow-y-auto">
                {VARGA_LIST.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVargaTab(v.id)}
                    className={`py-1.5 px-1 text-[11px] font-bold rounded-lg transition text-center ${
                      vargaTab === v.id
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-amber-200/70 hover:text-amber-300 bg-slate-800/40'
                    }`}
                  >
                    <div>{v.id}</div>
                    <div className="text-[9px] font-normal opacity-80 truncate">{v.label.split(' ')[1]}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-semibold text-amber-300">{vargaTab} Chart View</span>
              <div className="flex bg-slate-900 border border-amber-500/30 rounded-lg p-0.5">
                <button
                  onClick={() => setLayout('south')}
                  className={`px-3 py-1 text-[11px] font-medium rounded-md transition ${
                    layout === 'south' ? 'bg-amber-500/30 text-amber-300' : 'text-slate-400'
                  }`}
                >
                  South Wheel
                </button>
                <button
                  onClick={() => setLayout('north')}
                  className={`px-3 py-1 text-[11px] font-medium rounded-md transition ${
                    layout === 'north' ? 'bg-amber-500/30 text-amber-300' : 'text-slate-400'
                  }`}
                >
                  North Diamond
                </button>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-2xl">
              <Chart
                planets={getChartPlanetFormat(vargaTab)}
                size={340}
                title={`${vargaTab} (${VARGA_LIST.find(v=>v.id===vargaTab)?.desc || ''})`}
                layout={layout}
                lagna={lagnaInfo?.sign_name}
              />
            </div>
          </div>
        )}

        {/* TAB 3: JANAM KUNDLI BIRTH REPORT & DOSHAS */}
        {activeTab === 'report' && (
          <div className="space-y-4">
            {/* Birth Details Summary Card */}
            <div className="glass-panel p-4 rounded-2xl space-y-3 border-amber-500/30">
              <h3 className="text-xs font-bold text-amber-300 tracking-wider uppercase border-b border-amber-500/20 pb-2">
                📜 Janam Kundli — Birth Record
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="col-span-2 p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <span className="text-slate-400 block text-[10px]">Full Name</span>
                  <span className="font-bold text-amber-200">{profileName}</span>
                </div>
                <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Date of Birth</span>
                  <span className="font-bold text-amber-200">{dob}</span>
                </div>
                <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Time of Birth</span>
                  <span className="font-bold text-amber-200">{tob}</span>
                </div>
                <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Gender</span>
                  <span className="font-bold text-amber-200">{gender}</span>
                </div>
                <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Timezone</span>
                  <span className="font-bold text-amber-200">UTC {tzOffset >= 0 ? '+' : ''}{tzOffset}</span>
                </div>
                <div className="col-span-2 p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Birth Place</span>
                  <span className="font-bold text-amber-200">{cityInput}</span>
                </div>
                <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Lagna (Ascendant)</span>
                  <span className="font-bold text-amber-200">{lagnaInfo?.sign_name || '—'}</span>
                </div>
                <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Moon Sign (Rashi)</span>
                  <span className="font-bold text-amber-200">{moonInfo?.sign_name || '—'}</span>
                </div>
              </div>
            </div>

            {/* Avakhada Chakra & Nakshatra */}
            <div className="glass-panel p-4 rounded-2xl space-y-3 border-amber-500/30">
              <h3 className="text-xs font-bold text-amber-300 tracking-wider uppercase border-b border-amber-500/20 pb-2">
                🔮 Avakhada Chakra & Nakshatra
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Nakshatra</span>
                  <span className="font-bold text-amber-200">{nakInfo?.name || '—'}</span>
                </div>
                <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Pada</span>
                  <span className="font-bold text-amber-200">{nakInfo?.pada || '—'}</span>
                </div>
                <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Yoni</span>
                  <span className="font-bold text-amber-200">{nakInfo?.yoni || '—'}</span>
                </div>
                <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Gana</span>
                  <span className="font-bold text-amber-200">{nakInfo?.gana || '—'}</span>
                </div>
                <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Nadi</span>
                  <span className="font-bold text-amber-200">{nakInfo?.nadi || '—'}</span>
                </div>
                <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Nakshatra Lord</span>
                  <span className="font-bold text-amber-200">{nakInfo?.lord || '—'}</span>
                </div>
              </div>
            </div>

            {/* Panchang */}
            <div className="glass-panel p-4 rounded-2xl space-y-3 border-amber-500/30">
              <h3 className="text-xs font-bold text-amber-300 tracking-wider uppercase border-b border-amber-500/20 pb-2">
                🌛 Panchang at Birth
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Tithi</span>
                  <span className="font-bold text-amber-200">{panchang?.tithi || '—'}</span>
                </div>
                <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Yoga</span>
                  <span className="font-bold text-amber-200">{panchang?.yoga || '—'}</span>
                </div>
                <div className="col-span-2 p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Moon's Nakshatra at Birth</span>
                  <span className="font-bold text-amber-200">{panchang?.nakshatra || '—'}</span>
                </div>
                <div className="col-span-2 p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Moon Illumination</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex-1 bg-slate-800 rounded-full h-1.5">
                      <div
                        className="h-1.5 bg-amber-400 rounded-full"
                        style={{ width: `${panchang?.illuminationPercentage || 0}%` }}
                      />
                    </div>
                    <span className="font-bold text-amber-200">{panchang?.illuminationPercentage || 0}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Classical Yogas */}
            {yogas.length > 0 && (
              <div className="glass-panel p-4 rounded-2xl space-y-3 border-amber-500/30">
                <h3 className="text-xs font-bold text-amber-300 tracking-wider uppercase border-b border-amber-500/20 pb-2">
                  ✨ Classical Yogas in Your Chart
                </h3>
                <div className="space-y-2">
                  {yogas.map((yoga, idx) => (
                    <div key={idx} className="p-3 bg-slate-900/80 rounded-xl border border-emerald-500/20 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-emerald-300 text-xs">{yoga.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">{yoga.strength}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{yoga.effect}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Doshas */}
            <div className="glass-panel p-4 rounded-2xl space-y-3 border-amber-500/30">
              <h3 className="text-xs font-bold text-amber-300 tracking-wider uppercase border-b border-amber-500/20 pb-2">
                ⚠️ Major Doshas & Mitigation
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-amber-300 text-xs">Kuja / Manglik Dosha</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      doshas?.manglik_dosha?.is_present
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {doshas?.manglik_dosha?.is_present ? 'PRESENT' : 'NOT PRESENT'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{doshas?.manglik_dosha?.remedy}</p>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-amber-300 text-xs">Kalsarpa Dosha</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      doshas?.kalsarpa_dosha?.is_present
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {doshas?.kalsarpa_dosha?.is_present ? 'PRESENT' : 'NOT PRESENT'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{doshas?.kalsarpa_dosha?.remedy}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: VIMSHOTTARI DASHA EXPLORER */}
        {activeTab === 'dasha' && (
          <div className="space-y-3">
            <div className="glass-panel p-3.5 rounded-2xl flex items-center justify-between border-amber-500/30">
              <div>
                <span className="text-xs text-amber-400 font-semibold tracking-wider uppercase">Active Mahadasha</span>
                <div className="text-base font-bold text-amber-200 flex items-center space-x-1.5 mt-0.5">
                  <span>✨ {dashaTimeline[0]?.lord || 'Sun'} Mahadasha</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400">Total Cycle</span>
                <div className="text-xs font-bold text-slate-200">120 Sidereal Years</div>
              </div>
            </div>

            <div className="space-y-2">
              {dashaTimeline.map((md, mdIdx) => (
                <div key={mdIdx} className="glass-panel rounded-2xl overflow-hidden border border-amber-500/20">
                  <button
                    onClick={() => setExpandedMD(expandedMD === mdIdx ? null : mdIdx)}
                    className="w-full p-3.5 flex items-center justify-between text-left hover:bg-amber-500/5 transition"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-bold text-xs">
                        {md.lord.substring(0, 2)}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-slate-100">{md.lord} Mahadasha</div>
                        <div className="text-[10px] text-slate-400">{md.startDate} to {md.endDate}</div>
                      </div>
                    </div>
                    <span className="text-amber-400 text-xs font-bold">{expandedMD === mdIdx ? '▲' : '▼'}</span>
                  </button>

                  {expandedMD === mdIdx && (
                    <div className="bg-slate-950/80 p-3 border-t border-amber-500/10 space-y-2 text-xs">
                      <div className="text-[10px] font-bold text-amber-400 tracking-wider uppercase">Antardashas (Sub-Periods)</div>
                      <div className="space-y-1.5">
                        {md.antardashas?.map((ad, adIdx) => (
                          <div key={adIdx} className="p-2 bg-slate-900/90 border border-slate-800 rounded-xl flex justify-between items-center">
                            <span className="font-semibold text-amber-200">{md.lord} - {ad.lord}</span>
                            <span className="text-[10px] text-slate-400">{ad.startDate} ~ {ad.endDate}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: PROFILE & INTERACTIVE MAP BIRTHPLACE PICKER */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="glass-panel p-4 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold text-amber-300 tracking-wider uppercase border-b border-amber-500/20 pb-2">
                ⚡ Presets & Sample Profiles
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {SAMPLE_PROFILES.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      profileName === preset.name
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-amber-500/30'
                    }`}
                  >
                    <div className="truncate text-xs font-semibold">{preset.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">{preset.city}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Birth Details Input & Leaflet Interactive Map Picker */}
            <div className="glass-panel p-4 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold text-amber-300 tracking-wider uppercase border-b border-amber-500/20 pb-2">
                🗺️ Birth Details & Location
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-slate-900 border border-amber-500/30 rounded-xl p-2.5 text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 font-medium block mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full bg-slate-900 border border-amber-500/30 rounded-xl p-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-medium block mb-1">Time of Birth</label>
                    <input
                      type="time"
                      value={tob}
                      onChange={(e) => setTob(e.target.value)}
                      className="w-full bg-slate-900 border border-amber-500/30 rounded-xl p-2 text-slate-100"
                    />
                  </div>
                </div>

                {/* Gender Selection */}
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Gender</label>
                  <div className="flex space-x-2">
                    {['Male', 'Female', 'Other'].map((g) => (
                      <button
                        key={g}
                        onClick={() => setGender(g)}
                        className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition ${
                          gender === g
                            ? 'bg-amber-500/30 border-amber-400 text-amber-200'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-amber-500/30'
                        }`}
                      >
                        {g === 'Male' ? '♂ Male' : g === 'Female' ? '♀ Female' : '⚧ Other'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Leaflet Interactive Map Component */}
                <div>
                  <label className="text-slate-400 font-medium block mb-1">
                    Birthplace Location <span className="text-amber-400 text-[10px]">(Search, Tap Map, or Drag Golden Pin)</span>
                  </label>
                  <MapPicker
                    selectedLat={lat}
                    selectedLon={lon}
                    onLocationSelect={handleLocationSelectFromMap}
                  />
                </div>

                {/* Nepal Timezone Note */}
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <div className="text-[10px] text-amber-300 font-semibold">📍 Detected Timezone</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">UTC {tzOffset >= 0 ? '+' : ''}{tzOffset} — {cityInput}</div>
                </div>

                <button
                  onClick={() => setActiveTab('chat')}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg mt-2"
                >
                  ✨ Calculate & Open AI Chatbot
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#0f172a]/95 backdrop-blur-lg border-t border-amber-500/20 px-2 py-2 flex justify-around items-center z-50">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center transition ${
            activeTab === 'chat' ? 'text-amber-400 font-bold scale-105' : 'text-slate-400'
          }`}
        >
          <span className="text-base">💬</span>
          <span className="text-[10px]">AI Chat</span>
        </button>

        <button
          onClick={() => setActiveTab('charts')}
          className={`flex flex-col items-center transition ${
            activeTab === 'charts' ? 'text-amber-400 font-bold scale-105' : 'text-slate-400'
          }`}
        >
          <span className="text-base">🪐</span>
          <span className="text-[10px]">Vargas</span>
        </button>

        <button
          onClick={() => setActiveTab('report')}
          className={`flex flex-col items-center transition ${
            activeTab === 'report' ? 'text-amber-400 font-bold scale-105' : 'text-slate-400'
          }`}
        >
          <span className="text-base">📜</span>
          <span className="text-[10px]">Kundli</span>
        </button>

        <button
          onClick={() => setActiveTab('dasha')}
          className={`flex flex-col items-center transition ${
            activeTab === 'dasha' ? 'text-amber-400 font-bold scale-105' : 'text-slate-400'
          }`}
        >
          <span className="text-base">⏳</span>
          <span className="text-[10px]">Dasha</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center transition ${
            activeTab === 'profile' ? 'text-amber-400 font-bold scale-105' : 'text-slate-400'
          }`}
        >
          <span className="text-base">📋</span>
          <span className="text-[10px]">Profile</span>
        </button>
      </nav>
    </div>
  );
}
