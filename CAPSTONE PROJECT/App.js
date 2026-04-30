import { useState, useEffect, useReducer, useCallback, useMemo, useRef, createContext, useContext, lazy, Suspense, Component } from "react";

/* ═══════════════════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════════════════ */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --sand: #F5F0E8;
      --sand-dark: #E8E0CC;
      --ink: #1A1714;
      --ink-soft: #3D3830;
      --ink-muted: #7A7060;
      --gold: #C8943A;
      --gold-light: #E8B55A;
      --teal: #2A7B6F;
      --teal-light: #3DA898;
      --coral: #D4634A;
      --surface: #FFFFFF;
      --surface-2: #FAF7F2;
      --border: rgba(26,23,20,0.1);
      --border-strong: rgba(26,23,20,0.2);
      --shadow: 0 2px 20px rgba(26,23,20,0.08);
      --shadow-lg: 0 8px 40px rgba(26,23,20,0.14);
      --radius: 16px;
      --radius-sm: 10px;
      --font-display: 'Playfair Display', Georgia, serif;
      --font-body: 'DM Sans', system-ui, sans-serif;
      --transition: 0.2s cubic-bezier(0.4,0,0.2,1);
    }

    .dark {
      --sand: #1C1A17;
      --sand-dark: #252220;
      --ink: #F0EBE1;
      --ink-soft: #C8C0B0;
      --ink-muted: #8A8070;
      --surface: #252220;
      --surface-2: #2E2B27;
      --border: rgba(240,235,225,0.1);
      --border-strong: rgba(240,235,225,0.2);
      --shadow: 0 2px 20px rgba(0,0,0,0.3);
      --shadow-lg: 0 8px 40px rgba(0,0,0,0.4);
    }

    body { font-family: var(--font-body); background: var(--sand); color: var(--ink); transition: background var(--transition), color var(--transition); }

    h1,h2,h3 { font-family: var(--font-display); }

    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 3px; }

    .btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 10px 20px; border-radius: 50px; border: none;
      font-family: var(--font-body); font-size: 14px; font-weight: 500;
      cursor: pointer; transition: all var(--transition); white-space: nowrap;
    }
    .btn-primary { background: var(--ink); color: var(--sand); }
    .btn-primary:hover { background: var(--ink-soft); transform: translateY(-1px); box-shadow: var(--shadow); }
    .btn-ghost { background: transparent; color: var(--ink); border: 1.5px solid var(--border-strong); }
    .btn-ghost:hover { background: var(--surface); }
    .btn-gold { background: var(--gold); color: white; }
    .btn-gold:hover { background: var(--gold-light); transform: translateY(-1px); }
    .btn-teal { background: var(--teal); color: white; }
    .btn-teal:hover { background: var(--teal-light); }
    .btn-sm { padding: 6px 14px; font-size: 13px; }
    .btn-danger { background: var(--coral); color: white; }
    .btn-danger:hover { opacity: 0.85; }

    input, select, textarea {
      font-family: var(--font-body); font-size: 14px;
      background: var(--surface); color: var(--ink);
      border: 1.5px solid var(--border); border-radius: var(--radius-sm);
      padding: 10px 14px; width: 100%; outline: none;
      transition: border-color var(--transition);
    }
    input:focus, select:focus, textarea:focus { border-color: var(--gold); }
    textarea { resize: vertical; min-height: 80px; }

    .tag {
      display: inline-block; padding: 4px 12px; border-radius: 50px;
      font-size: 12px; font-weight: 500; background: var(--surface-2);
      color: var(--ink-muted); border: 1px solid var(--border);
    }
    .tag-gold { background: rgba(200,148,58,0.12); color: var(--gold); border-color: rgba(200,148,58,0.3); }
    .tag-teal { background: rgba(42,123,111,0.12); color: var(--teal); border-color: rgba(42,123,111,0.3); }

    .card {
      background: var(--surface); border-radius: var(--radius);
      border: 1px solid var(--border); box-shadow: var(--shadow);
    }

    @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.5;} }
    .animate-in { animation: fadeIn 0.4s ease forwards; }
    .loading { animation: pulse 1.5s ease infinite; }

    .badge {
      display: inline-flex; align-items: center; justify-content: center;
      width: 22px; height: 22px; border-radius: 50%;
      font-size: 11px; font-weight: 600; background: var(--coral); color: white;
    }
  `}</style>
);

/* ═══════════════════════════════════════════════════════
   CONTEXT / STATE MANAGEMENT  (Context API)
═══════════════════════════════════════════════════════ */
const AppContext = createContext(null);

const initialState = {
  trips: [],
  activeTrip: null,
  darkMode: false,
  activeTab: "explore",
};

function appReducer(state, action) {
  switch (action.type) {
    case "SET_DARK": return { ...state, darkMode: action.payload };
    case "SET_TAB": return { ...state, activeTab: action.payload };
    case "ADD_TRIP": return { ...state, trips: [...state.trips, action.payload], activeTrip: action.payload.id };
    case "SET_ACTIVE_TRIP": return { ...state, activeTrip: action.payload };
    case "UPDATE_TRIP": return { ...state, trips: state.trips.map(t => t.id === action.payload.id ? action.payload : t) };
    case "DELETE_TRIP": return { ...state, trips: state.trips.filter(t => t.id !== action.payload), activeTrip: state.trips.length > 1 ? state.trips[0].id : null };
    default: return state;
  }
}

/* ═══════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════ */
const DESTINATIONS = [
  { id:1, name:"Kyoto", country:"Japan", emoji:"🏯", tag:"Culture", temp:"18°C", desc:"Ancient temples, bamboo groves, geisha districts and serene zen gardens.", vibe:"Spiritual", budget:"$$", best:"Mar–May, Oct–Nov", activities:["Fushimi Inari Shrine","Arashiyama Bamboo","Kinkaku-ji","Gion District","Tea Ceremony"] },
  { id:2, name:"Santorini", country:"Greece", emoji:"🌊", tag:"Beach", temp:"24°C", desc:"Iconic white-washed villages perched on volcanic cliffs above the Aegean Sea.", vibe:"Romantic", budget:"$$$", best:"Jun–Sep", activities:["Oia Sunset","Caldera Cruise","Wine Tasting","Black Sand Beach","Akrotiri Ruins"] },
  { id:3, name:"Rajasthan", country:"India", emoji:"🏰", tag:"Heritage", temp:"28°C", desc:"Majestic forts, vibrant bazaars, camel rides through the Thar Desert.", vibe:"Adventure", budget:"$", best:"Oct–Mar", activities:["Jaipur City Palace","Jaisalmer Fort","Camel Safari","Pushkar Lake","Ranthambore Tiger Safari"] },
  { id:4, name:"Patagonia", country:"Chile / Argentina", emoji:"🏔️", tag:"Nature", temp:"8°C", desc:"Wild landscapes of glaciers, mountains and steppe at the end of the world.", vibe:"Adventure", budget:"$$", best:"Nov–Feb", activities:["Torres del Paine","Perito Moreno Glacier","Los Glaciares Trek","Tierra del Fuego","Marble Caves"] },
  { id:5, name:"Marrakech", country:"Morocco", emoji:"🕌", tag:"Culture", temp:"25°C", desc:"Labyrinthine medinas, aromatic souks, riads and the Atlas Mountains backdrop.", vibe:"Immersive", budget:"$", best:"Mar–May, Sep–Nov", activities:["Jemaa el-Fnaa","Majorelle Garden","Souk Shopping","Atlas Day Trip","Hammam"] },
  { id:6, name:"Iceland", country:"Iceland", emoji:"🌋", tag:"Nature", temp:"2°C", desc:"Midnight sun, geysers, waterfalls, Northern Lights and volcanic landscapes.", vibe:"Spiritual", budget:"$$$", best:"Jun–Aug (summer), Dec–Feb (aurora)", activities:["Northern Lights","Golden Circle","Blue Lagoon","Jökulsárlón Glacier","Skógafoss Falls"] },
  { id:7, name:"Amalfi Coast", country:"Italy", emoji:"🍋", tag:"Beach", temp:"26°C", desc:"Dramatic cliffs, pastel villages, limoncello and the world's most scenic coastal drive.", vibe:"Romantic", budget:"$$$", best:"May–Jun, Sep", activities:["Positano Walk","Ravello Concert","Boat Tour","Limoncello Factory","Pompeii Day Trip"] },
  { id:8, name:"Maldives", country:"Maldives", emoji:"🐠", tag:"Beach", temp:"30°C", desc:"Overwater bungalows on crystal lagoons with house reefs right outside your door.", vibe:"Romantic", budget:"$$$$", best:"Nov–Apr", activities:["Snorkeling","Dolphin Cruise","Sandbank Picnic","Spa Treatment","Underwater Restaurant"] },
  { id:9, name:"Banff", country:"Canada", emoji:"🦌", tag:"Nature", temp:"12°C", desc:"Turquoise lakes, Rocky Mountain peaks, hot springs and abundant wildlife.", vibe:"Adventure", budget:"$$", best:"Jun–Sep (summer), Dec–Feb (ski)", activities:["Lake Louise","Moraine Lake","Banff Gondola","Johnston Canyon","Icefields Parkway"] },
  { id:10, name:"Havana", country:"Cuba", emoji:"🎷", tag:"Culture", temp:"27°C", desc:"Colonial architecture, vintage cars, salsa rhythms and warm Caribbean culture.", vibe:"Immersive", budget:"$", best:"Nov–Apr", activities:["Old Havana Walk","Salsa Class","Vintage Car Tour","Hemingway Bar","Malecón Sunset"] },
  { id:11, name:"Bali", country:"Indonesia", emoji:"🌺", tag:"Beach", temp:"29°C", desc:"Terraced rice fields, temple ceremonies, surf beaches and world-class wellness.", vibe:"Spiritual", budget:"$", best:"Apr–Oct", activities:["Ubud Rice Terraces","Tanah Lot Temple","Surf Lesson","Monkey Forest","Mount Batur Sunrise"] },
  { id:12, name:"Prague", country:"Czechia", emoji:"🏛️", tag:"Culture", temp:"14°C", desc:"Fairy-tale Gothic spires, Baroque palaces, cobblestone lanes and craft beer culture.", vibe:"Romantic", budget:"$", best:"Mar–May, Sep–Oct", activities:["Charles Bridge","Prague Castle","Old Town Square","Beer Tasting Tour","Jewish Quarter"] },
];

const PACKING_TEMPLATES = {
  Beach:    ["Sunscreen SPF 50+","Swimsuit x2","Snorkel mask","Reef-safe sunscreen","Beach towel","Flip flops","Sun hat","Aloe vera gel","Waterproof bag","Underwater camera"],
  Nature:   ["Hiking boots","Moisture-wicking shirts","Rain jacket","Trekking poles","Water purifier","First aid kit","Insect repellent","Headlamp","Sleeping bag","Buff/neck gaiter"],
  Culture:  ["Smart casual outfits","Comfortable walking shoes","Small backpack","Phrasebook/app","Universal adapter","DSLR camera","Modest cover-ups","Scarf","Journal","Pocket wifi"],
  Heritage: ["Breathable linen shirts","Sunhat","Sunscreen","Sandals","Modest dress/scarf","Anti-bacterial wipes","Cash in local currency","Guidebook","Water bottle","Light poncho"],
};

const BUDGET_CATEGORIES = ["Flights","Accommodation","Food & Dining","Transport","Activities","Shopping","Visa & Fees","Travel Insurance","Miscellaneous"];

/* ═══════════════════════════════════════════════════════
   ERROR BOUNDARY
═══════════════════════════════════════════════════════ */
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError)
      return (
        <div style={{ padding:"2rem", textAlign:"center" }}>
          <div style={{ fontSize:48, marginBottom:12 }}>✈️</div>
          <h3 style={{ fontFamily:"var(--font-display)", marginBottom:8 }}>Turbulence Encountered</h3>
          <p style={{ color:"var(--ink-muted)", marginBottom:16 }}>{this.state.error?.message}</p>
          <button className="btn btn-primary" onClick={() => this.setState({ hasError:false })}>Try Again</button>
        </div>
      );
    return this.props.children;
  }
}

/* ═══════════════════════════════════════════════════════
   ICONS  (inline SVG — no deps)
═══════════════════════════════════════════════════════ */
const Icon = ({ name, size=18, color="currentColor" }) => {
  const paths = {
    moon: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
    sun: "M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 5a7 7 0 1 0 0 14A7 7 0 0 0 12 5z",
    search: "M11 17A6 6 0 1 0 11 5a6 6 0 0 0 0 12zM20 20l-4-4",
    plus: "M12 5v14M5 12h14",
    trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
    edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
    check: "M20 6L9 17l-5-5",
    map: "M3 7l6-3 6 3 6-3v13l-6 3-6-3-6 3V7zM9 4v13M15 7v13",
    bag: "M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0",
    wallet: "M21 12V7H5a2 2 0 0 1 0-4h14v4M3 5v14a2 2 0 0 0 2 2h16v-5H5a2 2 0 0 1 0-4h16",
    compass: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z",
    note: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
    star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    flight: "M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z",
    close: "M18 6L6 18M6 6l12 12",
    chevron: "M9 18l6-6-6-6",
    globe: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
    sort: "M3 6h18M7 12h10M11 18h4",
    calendar: "M3 4h18v18H3zM16 2v4M8 2v4M3 10h18",
    download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]?.split("M").filter(Boolean).map((d,i) => <path key={i} d={"M"+d}/>)}
    </svg>
  );
};

/* ═══════════════════════════════════════════════════════
   HEADER / NAV
═══════════════════════════════════════════════════════ */
const NAV_ITEMS = [
  { id:"explore", label:"Explore", icon:"compass" },
  { id:"trips",   label:"My Trips", icon:"flight" },
  { id:"itinerary",label:"Itinerary", icon:"calendar" },
  { id:"budget",  label:"Budget", icon:"wallet" },
  { id:"packing", label:"Packing", icon:"bag" },
  { id:"journal", label:"Journal", icon:"note" },
];

function Header({ state, dispatch }) {
  const activeTrip = useMemo(() => state.trips.find(t => t.id === state.activeTrip), [state.trips, state.activeTrip]);
  return (
    <header style={{ background:"var(--surface)", borderBottom:"1px solid var(--border)", position:"sticky", top:0, zIndex:100 }}>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", height:64 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:24 }}>✈️</span>
          <span style={{ fontFamily:"var(--font-display)", fontSize:22, fontWeight:700, color:"var(--gold)" }}>SAFAR</span>
          <span style={{ fontSize:11, color:"var(--ink-muted)", marginTop:4, letterSpacing:"0.1em" }}>TRAVEL PLANNER</span>
        </div>
        <nav style={{ display:"flex", gap:4 }}>
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => dispatch({ type:"SET_TAB", payload:item.id })}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:50, border:"none", cursor:"pointer", fontSize:13, fontWeight:500, fontFamily:"var(--font-body)", transition:"all var(--transition)", background: state.activeTab===item.id ? "var(--ink)" : "transparent", color: state.activeTab===item.id ? "var(--sand)" : "var(--ink-muted)" }}>
              <Icon name={item.icon} size={15} />
              <span style={{ display:"none" }} className="nav-label">{item.label}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          {activeTrip && (
            <div style={{ padding:"6px 14px", borderRadius:50, background:"rgba(200,148,58,0.12)", border:"1px solid rgba(200,148,58,0.3)", fontSize:13, color:"var(--gold)", fontWeight:500 }}>
              ✈ {activeTrip.name}
            </div>
          )}
          <button className="btn btn-ghost btn-sm" onClick={() => dispatch({ type:"SET_DARK", payload:!state.darkMode })}>
            <Icon name={state.darkMode ? "sun" : "moon"} size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════
   EXPLORE TAB  — destination search & discovery
═══════════════════════════════════════════════════════ */
const ITEMS_PER_PAGE = 6;

function ExploreTab({ state, dispatch }) {
  const [query, setQuery] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [filterTag, setFilterTag] = useState("All");
  const [filterVibe, setFilterVibe] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const timerRef = useRef(null);

  // Debounced search
  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { setDebouncedQ(query); setPage(1); }, 350);
    return () => clearTimeout(timerRef.current);
  }, [query]);

  const tags  = useMemo(() => ["All", ...new Set(DESTINATIONS.map(d => d.tag))], []);
  const vibes = useMemo(() => ["All", ...new Set(DESTINATIONS.map(d => d.vibe))], []);

  const filtered = useMemo(() => {
    let res = DESTINATIONS.filter(d => {
      const q = debouncedQ.toLowerCase();
      const matchQ = !q || d.name.toLowerCase().includes(q) || d.country.toLowerCase().includes(q) || d.tag.toLowerCase().includes(q);
      const matchTag = filterTag === "All" || d.tag === filterTag;
      const matchVibe = filterVibe === "All" || d.vibe === filterVibe;
      return matchQ && matchTag && matchVibe;
    });
    if (sortBy === "name") res.sort((a,b) => a.name.localeCompare(b.name));
    else if (sortBy === "budget") {
      const order = {"$":1,"$$":2,"$$$":3,"$$$$":4};
      res.sort((a,b) => order[a.budget] - order[b.budget]);
    } else if (sortBy === "temp") res.sort((a,b) => parseInt(b.temp) - parseInt(a.temp));
    return res;
  }, [debouncedQ, filterTag, filterVibe, sortBy]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((page-1)*ITEMS_PER_PAGE, page*ITEMS_PER_PAGE);

  const addToTrip = useCallback((dest) => {
    if (!state.activeTrip) {
      alert("Please create a trip first in My Trips tab!");
      dispatch({ type:"SET_TAB", payload:"trips" });
      return;
    }
    const trip = state.trips.find(t => t.id === state.activeTrip);
    if (!trip) return;
    if (trip.destinations?.find(d => d.id === dest.id)) { alert("Already in your trip!"); return; }
    dispatch({ type:"UPDATE_TRIP", payload: { ...trip, destinations: [...(trip.destinations||[]), dest] }});
    alert(`${dest.name} added to ${trip.name}!`);
  }, [state.activeTrip, state.trips, dispatch]);

  return (
    <div style={{ padding:"32px 0" }}>
      {/* Hero */}
      <div style={{ textAlign:"center", marginBottom:40, padding:"40px 24px 0" }}>
        <div style={{ display:"inline-block", padding:"6px 16px", borderRadius:50, background:"rgba(200,148,58,0.12)", border:"1px solid rgba(200,148,58,0.3)", fontSize:13, color:"var(--gold)", marginBottom:16 }}>
          🌍 {DESTINATIONS.length} handpicked destinations
        </div>
        <h1 style={{ fontSize:48, fontWeight:700, lineHeight:1.1, marginBottom:16 }}>
          Where will <em>SAFAR</em><br/>take you next?
        </h1>
        <p style={{ color:"var(--ink-muted)", fontSize:18, maxWidth:500, margin:"0 auto 32px" }}>
          Discover, plan and live your perfect journey — all in one place.
        </p>
        {/* Search bar */}
        <div style={{ maxWidth:560, margin:"0 auto", position:"relative" }}>
          <Icon name="search" size={18} color="var(--ink-muted)" style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)" }} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search destinations, countries, vibes…"
            style={{ paddingLeft:46, paddingRight:20, fontSize:16, borderRadius:50, border:"2px solid var(--border)", boxShadow:"var(--shadow)" }} />
          {query && (
            <button onClick={()=>setQuery("")} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"var(--ink-muted)" }}>
              <Icon name="close" size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Filters + Sort */}
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px 24px", display:"flex", gap:12, flexWrap:"wrap", alignItems:"center" }}>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {tags.map(t => (
            <button key={t} onClick={()=>{setFilterTag(t);setPage(1);}} className="btn btn-sm"
              style={{ borderRadius:50, background:filterTag===t?"var(--ink)":"var(--surface)", color:filterTag===t?"var(--sand)":"var(--ink-muted)", border:"1px solid var(--border)" }}>
              {t}
            </button>
          ))}
        </div>
        <div style={{ marginLeft:"auto", display:"flex", gap:8, alignItems:"center" }}>
          <select value={filterVibe} onChange={e=>{setFilterVibe(e.target.value);setPage(1);}} style={{ width:"auto", borderRadius:50, paddingRight:28 }}>
            {vibes.map(v => <option key={v}>{v}</option>)}
          </select>
          <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ width:"auto", borderRadius:50, paddingRight:28 }}>
            <option value="name">Sort: A–Z</option>
            <option value="budget">Sort: Budget</option>
            <option value="temp">Sort: Temperature</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px 16px" }}>
        <p style={{ color:"var(--ink-muted)", fontSize:14 }}>{filtered.length} destination{filtered.length!==1?"s":""} found</p>
      </div>

      {/* Cards grid */}
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px", display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:24 }}>
        {paginated.map((dest, i) => (
          <div key={dest.id} className="card animate-in" style={{ overflow:"hidden", cursor:"pointer", animationDelay:`${i*60}ms`, transition:"transform var(--transition), box-shadow var(--transition)" }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="var(--shadow-lg)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="var(--shadow)";}}>
            {/* Card header */}
            <div style={{ height:160, background:`linear-gradient(135deg, var(--teal) 0%, var(--teal-light) 100%)`, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
              <span style={{ fontSize:72, filter:"drop-shadow(0 4px 8px rgba(0,0,0,0.2))" }}>{dest.emoji}</span>
              <div style={{ position:"absolute", top:12, right:12, display:"flex", gap:6 }}>
                <span className="tag tag-gold">{dest.budget}</span>
                <span className="tag tag-teal">{dest.tag}</span>
              </div>
              <div style={{ position:"absolute", bottom:12, left:12, color:"white", fontSize:12, opacity:0.85 }}>
                🌡 {dest.temp} · Best: {dest.best}
              </div>
            </div>
            <div style={{ padding:"20px 20px 16px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                <div>
                  <h3 style={{ fontSize:20, fontWeight:700, marginBottom:2 }}>{dest.name}</h3>
                  <p style={{ color:"var(--ink-muted)", fontSize:13 }}>{dest.country}</p>
                </div>
                <span style={{ padding:"4px 10px", borderRadius:50, background:"rgba(42,123,111,0.12)", color:"var(--teal)", fontSize:12, fontWeight:500, border:"1px solid rgba(42,123,111,0.2)", whiteSpace:"nowrap" }}>
                  {dest.vibe}
                </span>
              </div>
              <p style={{ color:"var(--ink-soft)", fontSize:14, lineHeight:1.6, marginBottom:16 }}>{dest.desc}</p>
              {/* Top activities */}
              <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>
                {dest.activities.slice(0,3).map(a => <span key={a} className="tag" style={{ fontSize:11 }}>{a}</span>)}
                <span className="tag" style={{ fontSize:11, color:"var(--ink-muted)" }}>+{dest.activities.length-3} more</span>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button className="btn btn-ghost btn-sm" style={{ flex:1, justifyContent:"center" }} onClick={()=>setSelected(dest)}>
                  <Icon name="globe" size={14} /> Details
                </button>
                <button className="btn btn-teal btn-sm" style={{ flex:1, justifyContent:"center" }} onClick={()=>addToTrip(dest)}>
                  <Icon name="plus" size={14} /> Add to Trip
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display:"flex", justifyContent:"center", gap:8, marginTop:40 }}>
          <button className="btn btn-ghost btn-sm" disabled={page===1} onClick={()=>setPage(p=>p-1)}>← Prev</button>
          {Array.from({length:totalPages},(_,i) => (
            <button key={i+1} className="btn btn-sm" onClick={()=>setPage(i+1)}
              style={{ background:page===i+1?"var(--ink)":"var(--surface)", color:page===i+1?"var(--sand)":"var(--ink)", border:"1px solid var(--border)", minWidth:36 }}>
              {i+1}
            </button>
          ))}
          <button className="btn btn-ghost btn-sm" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>Next →</button>
        </div>
      )}

      {/* Destination Detail Modal */}
      {selected && (
        <div onClick={()=>setSelected(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
          <div className="card animate-in" onClick={e=>e.stopPropagation()} style={{ maxWidth:600, width:"100%", maxHeight:"85vh", overflow:"auto" }}>
            <div style={{ height:200, background:`linear-gradient(135deg, var(--teal) 0%, var(--teal-light) 100%)`, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:"16px 16px 0 0", position:"relative" }}>
              <span style={{ fontSize:96 }}>{selected.emoji}</span>
              <button onClick={()=>setSelected(null)} style={{ position:"absolute", top:16, right:16, background:"rgba(0,0,0,0.3)", border:"none", color:"white", borderRadius:"50%", width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                <Icon name="close" size={18} color="white" />
              </button>
            </div>
            <div style={{ padding:28 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <h2 style={{ fontSize:28 }}>{selected.name}</h2>
                <div style={{ display:"flex", gap:6 }}>
                  <span className="tag tag-gold">{selected.budget}</span>
                  <span className="tag tag-teal">{selected.vibe}</span>
                </div>
              </div>
              <p style={{ color:"var(--ink-muted)", marginBottom:16 }}>{selected.country} · {selected.temp} · Best time: {selected.best}</p>
              <p style={{ color:"var(--ink-soft)", lineHeight:1.7, marginBottom:24 }}>{selected.desc}</p>
              <h4 style={{ fontFamily:"var(--font-display)", marginBottom:12 }}>Must-Do Activities</h4>
              <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:24 }}>
                {selected.activities.map((a,i) => (
                  <div key={a} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:10, background:"var(--surface-2)", border:"1px solid var(--border)" }}>
                    <span style={{ color:"var(--gold)", fontSize:13, fontWeight:600, minWidth:20 }}>0{i+1}</span>
                    <span style={{ fontSize:14 }}>{a}</span>
                  </div>
                ))}
              </div>
              <button className="btn btn-gold" style={{ width:"100%", justifyContent:"center", padding:"14px" }} onClick={()=>{addToTrip(selected);setSelected(null);}}>
                <Icon name="plus" size={16} /> Add {selected.name} to My Trip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MY TRIPS TAB
═══════════════════════════════════════════════════════ */
function TripsTab({ state, dispatch }) {
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name:"", startDate:"", endDate:"", notes:"" });

  const createTrip = () => {
    if (!form.name.trim()) return;
    const trip = { id: Date.now(), ...form, destinations:[], itinerary:[], budget:[], packing:[], journal:"", createdAt: new Date().toLocaleDateString() };
    dispatch({ type:"ADD_TRIP", payload:trip });
    setForm({ name:"", startDate:"", endDate:"", notes:"" });
    setCreating(false);
  };

  const nights = (trip) => {
    if (!trip.startDate || !trip.endDate) return null;
    const diff = (new Date(trip.endDate) - new Date(trip.startDate)) / 86400000;
    return diff > 0 ? diff : null;
  };

  return (
    <div style={{ maxWidth:900, margin:"0 auto", padding:"40px 24px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:32 }}>
        <div>
          <h2 style={{ fontSize:32, marginBottom:4 }}>My Trips</h2>
          <p style={{ color:"var(--ink-muted)" }}>{state.trips.length} trip{state.trips.length!==1?"s":""} planned</p>
        </div>
        <button className="btn btn-gold" onClick={()=>setCreating(true)}>
          <Icon name="plus" size={16} /> New Trip
        </button>
      </div>

      {creating && (
        <div className="card animate-in" style={{ padding:28, marginBottom:32, border:"2px solid var(--gold)", borderRadius:"var(--radius)" }}>
          <h3 style={{ fontFamily:"var(--font-display)", marginBottom:20 }}>Plan a New Adventure</h3>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
            <div style={{ gridColumn:"1/-1" }}>
              <label style={{ fontSize:13, color:"var(--ink-muted)", display:"block", marginBottom:6 }}>Trip Name *</label>
              <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Japan Cherry Blossom 2025" />
            </div>
            <div>
              <label style={{ fontSize:13, color:"var(--ink-muted)", display:"block", marginBottom:6 }}>Start Date</label>
              <input type="date" value={form.startDate} onChange={e=>setForm({...form,startDate:e.target.value})} />
            </div>
            <div>
              <label style={{ fontSize:13, color:"var(--ink-muted)", display:"block", marginBottom:6 }}>End Date</label>
              <input type="date" value={form.endDate} onChange={e=>setForm({...form,endDate:e.target.value})} />
            </div>
            <div style={{ gridColumn:"1/-1" }}>
              <label style={{ fontSize:13, color:"var(--ink-muted)", display:"block", marginBottom:6 }}>Notes</label>
              <textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Dream destinations, travel companions, special occasions…" style={{ minHeight:60 }} />
            </div>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button className="btn btn-primary" onClick={createTrip}><Icon name="check" size={15} /> Create Trip</button>
            <button className="btn btn-ghost" onClick={()=>setCreating(false)}>Cancel</button>
          </div>
        </div>
      )}

      {state.trips.length === 0 && !creating && (
        <div style={{ textAlign:"center", padding:"80px 0", color:"var(--ink-muted)" }}>
          <div style={{ fontSize:64, marginBottom:16 }}>🗺️</div>
          <h3 style={{ fontFamily:"var(--font-display)", fontSize:24, marginBottom:8, color:"var(--ink)" }}>No trips yet</h3>
          <p style={{ marginBottom:24 }}>Start planning your first adventure</p>
          <button className="btn btn-gold" onClick={()=>setCreating(true)}><Icon name="plus" size={16} /> Plan a Trip</button>
        </div>
      )}

      <div style={{ display:"grid", gap:20 }}>
        {state.trips.map(trip => {
          const n = nights(trip);
          const isActive = state.activeTrip === trip.id;
          return (
            <div key={trip.id} className="card animate-in" style={{ padding:24, border: isActive ? "2px solid var(--gold)" : "1px solid var(--border)", cursor:"pointer", transition:"all var(--transition)" }}
              onClick={()=>dispatch({type:"SET_ACTIVE_TRIP",payload:trip.id})}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                    <h3 style={{ fontSize:20 }}>{trip.name}</h3>
                    {isActive && <span className="tag tag-gold" style={{ fontSize:11 }}>✓ Active</span>}
                  </div>
                  <div style={{ display:"flex", gap:16, color:"var(--ink-muted)", fontSize:13, marginBottom:12, flexWrap:"wrap" }}>
                    {trip.startDate && <span>📅 {trip.startDate} → {trip.endDate || "?"}</span>}
                    {n && <span>🌙 {n} nights</span>}
                    <span>📍 {trip.destinations?.length || 0} destinations</span>
                    <span>🗓 {trip.itinerary?.length || 0} activities</span>
                  </div>
                  {trip.notes && <p style={{ color:"var(--ink-muted)", fontSize:14, fontStyle:"italic" }}>"{trip.notes}"</p>}
                  {trip.destinations?.length > 0 && (
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:10 }}>
                      {trip.destinations.map(d => <span key={d.id} style={{ fontSize:20 }}>{d.emoji}</span>)}
                      <span style={{ fontSize:13, color:"var(--ink-muted)", alignSelf:"center", marginLeft:4 }}>
                        {trip.destinations.map(d=>d.name).join(" · ")}
                      </span>
                    </div>
                  )}
                </div>
                <button className="btn btn-danger btn-sm" style={{ marginLeft:16 }} onClick={e=>{e.stopPropagation();if(confirm("Delete this trip?"))dispatch({type:"DELETE_TRIP",payload:trip.id});}}>
                  <Icon name="trash" size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ITINERARY TAB
═══════════════════════════════════════════════════════ */
function ItineraryTab({ state, dispatch }) {
  const trip = useMemo(() => state.trips.find(t => t.id === state.activeTrip), [state.trips, state.activeTrip]);
  const [day, setDay] = useState(1);
  const [form, setForm] = useState({ time:"09:00", activity:"", location:"", notes:"", type:"Sightseeing" });
  const TYPES = ["Sightseeing","Food & Drink","Transport","Accommodation","Adventure","Shopping","Relaxation","Cultural","Other"];
  const TYPE_COLORS = { "Sightseeing":"var(--teal)","Food & Drink":"var(--gold)","Transport":"var(--ink-muted)","Accommodation":"var(--coral)","Adventure":"#6B4FBB","Shopping":"#D4638A","Relaxation":"#2A9D8F","Cultural":"#E76F51","Other":"var(--ink-soft)" };

  if (!trip) return <NoTripPlaceholder dispatch={dispatch} />;

  const numDays = useMemo(() => {
    if (!trip.startDate || !trip.endDate) return 7;
    const diff = Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / 86400000);
    return Math.max(diff, 1);
  }, [trip]);

  const addActivity = () => {
    if (!form.activity.trim()) return;
    const item = { id:Date.now(), day, ...form };
    dispatch({ type:"UPDATE_TRIP", payload:{ ...trip, itinerary:[...(trip.itinerary||[]), item] }});
    setForm({ time:"09:00", activity:"", location:"", notes:"", type:"Sightseeing" });
  };

  const removeActivity = (id) => dispatch({ type:"UPDATE_TRIP", payload:{ ...trip, itinerary:trip.itinerary.filter(i=>i.id!==id) }});

  const dayItems = useMemo(() => (trip.itinerary||[]).filter(i=>i.day===day).sort((a,b)=>a.time.localeCompare(b.time)), [trip.itinerary, day]);

  const getDateForDay = (d) => {
    if (!trip.startDate) return `Day ${d}`;
    const date = new Date(trip.startDate);
    date.setDate(date.getDate() + d - 1);
    return date.toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" });
  };

  return (
    <div style={{ maxWidth:1100, margin:"0 auto", padding:"40px 24px" }}>
      <div style={{ marginBottom:32 }}>
        <h2 style={{ fontSize:32, marginBottom:4 }}>Itinerary</h2>
        <p style={{ color:"var(--ink-muted)" }}>{trip.name} · {numDays} days · {(trip.itinerary||[]).length} activities planned</p>
      </div>

      {/* Day selector */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:32, overflowX:"auto", paddingBottom:4 }}>
        {Array.from({length:numDays},(_,i) => i+1).map(d => {
          const dayCount = (trip.itinerary||[]).filter(i=>i.day===d).length;
          return (
            <button key={d} onClick={()=>setDay(d)}
              style={{ flex:"0 0 auto", padding:"10px 16px", borderRadius:12, border:"1.5px solid", cursor:"pointer", fontFamily:"var(--font-body)", fontSize:13, fontWeight:500, transition:"all var(--transition)",
                background: day===d ? "var(--ink)" : "var(--surface)", color: day===d ? "var(--sand)" : "var(--ink)", borderColor: day===d ? "var(--ink)" : "var(--border)",
                minWidth:90, textAlign:"center" }}>
              <div style={{ fontWeight:600 }}>Day {d}</div>
              <div style={{ fontSize:11, opacity:0.7 }}>{getDateForDay(d)}</div>
              {dayCount > 0 && <div style={{ fontSize:10, color:day===d?"rgba(255,255,255,0.7)":"var(--gold)" }}>{dayCount} items</div>}
            </button>
          );
        })}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 380px", gap:28 }}>
        {/* Timeline */}
        <div>
          <h3 style={{ fontFamily:"var(--font-display)", fontSize:20, marginBottom:16 }}>{getDateForDay(day)}</h3>
          {dayItems.length === 0 ? (
            <div style={{ textAlign:"center", padding:"48px 0", color:"var(--ink-muted)", border:"2px dashed var(--border)", borderRadius:"var(--radius)" }}>
              <div style={{ fontSize:40, marginBottom:10 }}>📋</div>
              <p>No activities for this day yet.</p>
              <p style={{ fontSize:13, marginTop:4 }}>Add your first activity →</p>
            </div>
          ) : (
            <div style={{ position:"relative" }}>
              <div style={{ position:"absolute", left:40, top:0, bottom:0, width:2, background:"var(--border)" }} />
              {dayItems.map((item, idx) => (
                <div key={item.id} className="animate-in" style={{ display:"flex", gap:16, marginBottom:16, animationDelay:`${idx*50}ms` }}>
                  <div style={{ flex:"0 0 80px", textAlign:"right", paddingTop:14, fontSize:13, fontWeight:600, color:"var(--ink-muted)" }}>{item.time}</div>
                  <div style={{ position:"relative", zIndex:1 }}>
                    <div style={{ width:16, height:16, borderRadius:"50%", background:TYPE_COLORS[item.type]||"var(--teal)", border:"3px solid var(--surface)", marginTop:16, boxShadow:"0 0 0 2px "+( TYPE_COLORS[item.type]||"var(--teal)")+"44" }} />
                  </div>
                  <div className="card" style={{ flex:1, padding:"14px 18px", borderLeft:`3px solid ${TYPE_COLORS[item.type]||"var(--teal)"}` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div>
                        <div style={{ fontWeight:600, fontSize:15, marginBottom:3 }}>{item.activity}</div>
                        {item.location && <div style={{ fontSize:13, color:"var(--ink-muted)", marginBottom:3 }}>📍 {item.location}</div>}
                        {item.notes && <div style={{ fontSize:13, color:"var(--ink-soft)", fontStyle:"italic" }}>{item.notes}</div>}
                      </div>
                      <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                        <span style={{ fontSize:11, padding:"3px 8px", borderRadius:50, background:`${TYPE_COLORS[item.type]}22`, color:TYPE_COLORS[item.type], border:`1px solid ${TYPE_COLORS[item.type]}44`, whiteSpace:"nowrap" }}>{item.type}</span>
                        <button onClick={()=>removeActivity(item.id)} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--ink-muted)", padding:4 }}>
                          <Icon name="close" size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add activity form */}
        <div>
          <div className="card" style={{ padding:24, position:"sticky", top:88 }}>
            <h4 style={{ fontFamily:"var(--font-display)", fontSize:18, marginBottom:18 }}>Add to Day {day}</h4>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div>
                <label style={{ fontSize:12, color:"var(--ink-muted)", display:"block", marginBottom:5 }}>Time</label>
                <input type="time" value={form.time} onChange={e=>setForm({...form,time:e.target.value})} />
              </div>
              <div>
                <label style={{ fontSize:12, color:"var(--ink-muted)", display:"block", marginBottom:5 }}>Activity *</label>
                <input value={form.activity} onChange={e=>setForm({...form,activity:e.target.value})} placeholder="e.g. Visit Fushimi Inari" />
              </div>
              <div>
                <label style={{ fontSize:12, color:"var(--ink-muted)", display:"block", marginBottom:5 }}>Location</label>
                <input value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="e.g. Kyoto, Japan" />
              </div>
              <div>
                <label style={{ fontSize:12, color:"var(--ink-muted)", display:"block", marginBottom:5 }}>Type</label>
                <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:12, color:"var(--ink-muted)", display:"block", marginBottom:5 }}>Notes</label>
                <textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Booking ref, tips, reminders…" style={{ minHeight:60 }} />
              </div>
              <button className="btn btn-teal" style={{ justifyContent:"center", padding:"12px" }} onClick={addActivity}>
                <Icon name="plus" size={16} /> Add Activity
              </button>
            </div>
            {/* Quick suggestions from destinations */}
            {trip.destinations?.length > 0 && (
              <div style={{ marginTop:20, paddingTop:20, borderTop:"1px solid var(--border)" }}>
                <p style={{ fontSize:12, color:"var(--ink-muted)", marginBottom:10 }}>Quick add from your destinations:</p>
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {trip.destinations.flatMap(d => d.activities||[]).slice(0,5).map(a => (
                    <button key={a} onClick={()=>setForm({...form,activity:a})} style={{ textAlign:"left", padding:"8px 12px", borderRadius:8, border:"1px solid var(--border)", background:"var(--surface-2)", fontSize:13, cursor:"pointer", color:"var(--ink-soft)", fontFamily:"var(--font-body)" }}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   BUDGET TAB
═══════════════════════════════════════════════════════ */
function BudgetTab({ state, dispatch }) {
  const trip = useMemo(() => state.trips.find(t => t.id === state.activeTrip), [state.trips, state.activeTrip]);
  const [form, setForm] = useState({ category:"Flights", item:"", amount:"", currency:"USD", paid:false });
  const [totalBudget, setTotalBudget] = useState("");
  const CURRENCIES = ["USD","EUR","GBP","INR","JPY","AUD","CAD","SGD","AED","THB"];
  const CAT_ICONS = { Flights:"✈️", Accommodation:"🏨","Food & Dining":"🍽️", Transport:"🚌", Activities:"🎫", Shopping:"🛍️","Visa & Fees":"📋","Travel Insurance":"🛡️", Miscellaneous:"💼" };

  if (!trip) return <NoTripPlaceholder dispatch={dispatch} />;

  const addExpense = () => {
    if (!form.item.trim() || !form.amount) return;
    const expense = { id:Date.now(), ...form, amount:parseFloat(form.amount) };
    dispatch({ type:"UPDATE_TRIP", payload:{ ...trip, budget:[...(trip.budget||[]), expense], totalBudget: trip.totalBudget || totalBudget }});
    setForm({ ...form, item:"", amount:"" });
  };

  const removeExpense = (id) => dispatch({ type:"UPDATE_TRIP", payload:{ ...trip, budget:(trip.budget||[]).filter(e=>e.id!==id) }});

  const total = useMemo(() => (trip.budget||[]).reduce((s,e) => s + (e.amount||0), 0), [trip.budget]);
  const paid  = useMemo(() => (trip.budget||[]).filter(e=>e.paid).reduce((s,e) => s + (e.amount||0), 0), [trip.budget]);
  const byCategory = useMemo(() => {
    const map = {};
    (trip.budget||[]).forEach(e => { if (!map[e.category]) map[e.category]=0; map[e.category]+=e.amount; });
    return Object.entries(map).sort((a,b)=>b[1]-a[1]);
  }, [trip.budget]);

  const budget = parseFloat(trip.totalBudget || totalBudget) || 0;
  const remaining = budget - total;

  return (
    <div style={{ maxWidth:1100, margin:"0 auto", padding:"40px 24px" }}>
      <div style={{ marginBottom:32 }}>
        <h2 style={{ fontSize:32, marginBottom:4 }}>Budget Planner</h2>
        <p style={{ color:"var(--ink-muted)" }}>{trip.name} · Track every rupee, dollar and euro</p>
      </div>

      {/* Summary cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:16, marginBottom:32 }}>
        {[
          { label:"Total Budget", value: budget ? `$${budget.toLocaleString()}` : "—", color:"var(--teal)" },
          { label:"Total Spent",  value:`$${total.toLocaleString()}`, color:"var(--coral)" },
          { label:"Amount Paid",  value:`$${paid.toLocaleString()}`, color:"var(--gold)" },
          { label:"Remaining",    value: budget ? `$${remaining.toLocaleString()}` : "—", color: remaining < 0 ? "var(--coral)" : "var(--teal)" },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding:"20px 20px", textAlign:"center" }}>
            <div style={{ fontSize:22, fontWeight:700, color:s.color, fontFamily:"var(--font-display)", marginBottom:4 }}>{s.value}</div>
            <div style={{ fontSize:13, color:"var(--ink-muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {budget > 0 && (
        <div style={{ marginBottom:32 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8, fontSize:13 }}>
            <span style={{ color:"var(--ink-muted)" }}>Budget used</span>
            <span style={{ fontWeight:600, color: total/budget > 0.9 ? "var(--coral)" : "var(--teal)" }}>{Math.round(total/budget*100)}%</span>
          </div>
          <div style={{ height:10, borderRadius:50, background:"var(--border)", overflow:"hidden" }}>
            <div style={{ height:"100%", borderRadius:50, width:`${Math.min(total/budget*100,100)}%`, background: total/budget > 0.9 ? "var(--coral)" : "var(--teal)", transition:"width 0.5s ease" }} />
          </div>
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 360px", gap:28 }}>
        {/* Expenses list */}
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <h3 style={{ fontFamily:"var(--font-display)", fontSize:20 }}>Expenses</h3>
            <span style={{ fontSize:13, color:"var(--ink-muted)" }}>{(trip.budget||[]).length} items</span>
          </div>
          {(trip.budget||[]).length === 0 ? (
            <div style={{ textAlign:"center", padding:"48px 0", color:"var(--ink-muted)", border:"2px dashed var(--border)", borderRadius:"var(--radius)" }}>
              <div style={{ fontSize:40, marginBottom:10 }}>💰</div>
              <p>No expenses tracked yet.</p>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {(trip.budget||[]).map(exp => (
                <div key={exp.id} className="card animate-in" style={{ padding:"14px 18px", display:"flex", alignItems:"center", gap:14, opacity:exp.paid?0.75:1 }}>
                  <span style={{ fontSize:22 }}>{CAT_ICONS[exp.category]||"💼"}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:500, fontSize:15 }}>{exp.item}</div>
                    <div style={{ fontSize:13, color:"var(--ink-muted)" }}>{exp.category} · {exp.currency}</div>
                  </div>
                  <div style={{ fontWeight:700, fontSize:16, color:exp.paid?"var(--teal)":"var(--ink)", minWidth:80, textAlign:"right" }}>
                    {exp.currency} {exp.amount?.toLocaleString()}
                  </div>
                  <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:13, color:"var(--ink-muted)", cursor:"pointer", whiteSpace:"nowrap" }}>
                    <input type="checkbox" checked={!!exp.paid} onChange={()=>{
                      const updated = (trip.budget||[]).map(e=>e.id===exp.id?{...e,paid:!e.paid}:e);
                      dispatch({type:"UPDATE_TRIP",payload:{...trip,budget:updated}});
                    }} /> Paid
                  </label>
                  <button onClick={()=>removeExpense(exp.id)} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--ink-muted)" }}>
                    <Icon name="close" size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Category breakdown */}
          {byCategory.length > 0 && (
            <div style={{ marginTop:28 }}>
              <h4 style={{ fontFamily:"var(--font-display)", fontSize:16, marginBottom:14 }}>Spending by Category</h4>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {byCategory.map(([cat, amt]) => (
                  <div key={cat} style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:14 }}>{CAT_ICONS[cat]||"💼"}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:4 }}>
                        <span>{cat}</span>
                        <span style={{ fontWeight:500 }}>${amt.toLocaleString()} ({total?Math.round(amt/total*100):0}%)</span>
                      </div>
                      <div style={{ height:6, borderRadius:50, background:"var(--border)", overflow:"hidden" }}>
                        <div style={{ height:"100%", borderRadius:50, width:`${total?Math.min(amt/total*100,100):0}%`, background:"var(--gold)", transition:"width 0.5s ease" }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add expense + budget setup */}
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
          {/* Total budget input */}
          <div className="card" style={{ padding:24, borderTop:`3px solid var(--gold)` }}>
            <h4 style={{ fontFamily:"var(--font-display)", fontSize:16, marginBottom:14 }}>Set Total Budget</h4>
            <div style={{ display:"flex", gap:8 }}>
              <input type="number" value={totalBudget || trip.totalBudget || ""} onChange={e=>{setTotalBudget(e.target.value);dispatch({type:"UPDATE_TRIP",payload:{...trip,totalBudget:e.target.value}});}} placeholder="e.g. 3000" style={{ flex:1 }} />
              <span style={{ padding:"10px 14px", background:"var(--surface-2)", border:"1.5px solid var(--border)", borderRadius:"var(--radius-sm)", fontSize:13, color:"var(--ink-muted)" }}>USD</span>
            </div>
          </div>

          {/* Add expense */}
          <div className="card" style={{ padding:24 }}>
            <h4 style={{ fontFamily:"var(--font-display)", fontSize:16, marginBottom:16 }}>Add Expense</h4>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                {BUDGET_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <input value={form.item} onChange={e=>setForm({...form,item:e.target.value})} placeholder="Description (e.g. Return flights)" />
              <div style={{ display:"flex", gap:8 }}>
                <input type="number" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} placeholder="Amount" style={{ flex:2 }} />
                <select value={form.currency} onChange={e=>setForm({...form,currency:e.target.value})} style={{ flex:1 }}>
                  {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:14, cursor:"pointer" }}>
                <input type="checkbox" checked={form.paid} onChange={e=>setForm({...form,paid:e.target.checked})} /> Already paid
              </label>
              <button className="btn btn-gold" style={{ justifyContent:"center" }} onClick={addExpense}>
                <Icon name="plus" size={15} /> Add Expense
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   PACKING TAB  — smart packing list
═══════════════════════════════════════════════════════ */
function PackingTab({ state, dispatch }) {
  const trip = useMemo(() => state.trips.find(t => t.id === state.activeTrip), [state.trips, state.activeTrip]);
  const [newItem, setNewItem] = useState("");
  const [category, setCategory] = useState("Essentials");
  const PACKING_CATS = ["Essentials","Clothing","Tech","Toiletries","Documents","Health","Entertainment","Snacks"];
  const CAT_EMOJI = { Essentials:"🎒",Clothing:"👕",Tech:"💻",Toiletries:"🧴",Documents:"📄",Health:"💊",Entertainment:"🎧",Snacks:"🍫" };

  if (!trip) return <NoTripPlaceholder dispatch={dispatch} />;

  const packing = trip.packing || [];
  const checkedCount = packing.filter(i=>i.checked).length;

  const addItem = (itemText, cat=category) => {
    if (!itemText.trim()) return;
    const item = { id:Date.now(), name:itemText, category:cat, checked:false };
    dispatch({ type:"UPDATE_TRIP", payload:{ ...trip, packing:[...packing, item] }});
  };

  const toggle = (id) => {
    dispatch({ type:"UPDATE_TRIP", payload:{ ...trip, packing:packing.map(i=>i.id===id?{...i,checked:!i.checked}:i) }});
  };

  const remove = (id) => dispatch({ type:"UPDATE_TRIP", payload:{ ...trip, packing:packing.filter(i=>i.id!==id) }});

  const autoGenerate = () => {
    if (!trip.destinations?.length) { alert("Add destinations to your trip first!"); return; }
    const tags = [...new Set(trip.destinations.map(d=>d.tag))];
    let items = [];
    const always = ["Passport","Boarding passes","Travel insurance docs","Phone + charger","Power bank","Earplugs","Eye mask","Reusable water bottle","Hand sanitizer","Pen (for customs forms)"];
    always.forEach(i => { if (!packing.find(p=>p.name===i)) items.push({id:Date.now()+Math.random(),name:i,category:"Essentials",checked:false}); });
    tags.forEach(tag => {
      (PACKING_TEMPLATES[tag]||[]).forEach(i => { if (!packing.find(p=>p.name===i)) items.push({id:Date.now()+Math.random(),name:i,category:tag,checked:false}); });
    });
    dispatch({ type:"UPDATE_TRIP", payload:{ ...trip, packing:[...packing, ...items] }});
  };

  const byCategory = useMemo(() => {
    const map = {};
    packing.forEach(i => { if (!map[i.category]) map[i.category]=[]; map[i.category].push(i); });
    return map;
  }, [packing]);

  return (
    <div style={{ maxWidth:900, margin:"0 auto", padding:"40px 24px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:32, flexWrap:"wrap", gap:16 }}>
        <div>
          <h2 style={{ fontSize:32, marginBottom:4 }}>Packing List</h2>
          <p style={{ color:"var(--ink-muted)" }}>{trip.name} · {checkedCount}/{packing.length} packed</p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button className="btn btn-ghost btn-sm" onClick={autoGenerate}><Icon name="star" size={14} /> Auto-Generate</button>
          {packing.length > 0 && <button className="btn btn-ghost btn-sm" onClick={()=>dispatch({type:"UPDATE_TRIP",payload:{...trip,packing:packing.map(i=>({...i,checked:true}))}})}>✓ All Packed</button>}
        </div>
      </div>

      {/* Progress */}
      {packing.length > 0 && (
        <div style={{ marginBottom:28 }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:6 }}>
            <span style={{ color:"var(--ink-muted)" }}>Packing progress</span>
            <span style={{ fontWeight:600, color:"var(--teal)" }}>{Math.round(checkedCount/packing.length*100)}% ready</span>
          </div>
          <div style={{ height:8, borderRadius:50, background:"var(--border)", overflow:"hidden" }}>
            <div style={{ height:"100%", borderRadius:50, width:`${packing.length?checkedCount/packing.length*100:0}%`, background:"var(--teal)", transition:"width 0.4s ease" }} />
          </div>
        </div>
      )}

      {/* Add item */}
      <div className="card" style={{ padding:20, marginBottom:28, display:"flex", gap:10, flexWrap:"wrap" }}>
        <select value={category} onChange={e=>setCategory(e.target.value)} style={{ width:"auto", flex:"0 0 160px" }}>
          {PACKING_CATS.map(c => <option key={c}>{c}</option>)}
        </select>
        <input value={newItem} onChange={e=>setNewItem(e.target.value)} placeholder="Add item…" style={{ flex:1 }}
          onKeyDown={e=>{if(e.key==="Enter"){addItem(newItem);setNewItem("");}}} />
        <button className="btn btn-teal" onClick={()=>{addItem(newItem);setNewItem("");}}>
          <Icon name="plus" size={15} /> Add
        </button>
      </div>

      {packing.length === 0 ? (
        <div style={{ textAlign:"center", padding:"64px 0", color:"var(--ink-muted)", border:"2px dashed var(--border)", borderRadius:"var(--radius)" }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🧳</div>
          <h3 style={{ fontFamily:"var(--font-display)", color:"var(--ink)", marginBottom:8 }}>Empty suitcase!</h3>
          <p style={{ marginBottom:20 }}>Add destinations and use Auto-Generate for a smart packing list</p>
          <button className="btn btn-teal" onClick={autoGenerate}><Icon name="star" size={15} /> Auto-Generate List</button>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:20 }}>
          {Object.entries(byCategory).map(([cat, items]) => (
            <div key={cat} className="card" style={{ padding:20 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <h4 style={{ fontWeight:600, display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:18 }}>{CAT_EMOJI[cat]||"📦"}</span> {cat}
                </h4>
                <span style={{ fontSize:12, color:"var(--ink-muted)" }}>{items.filter(i=>i.checked).length}/{items.length}</span>
              </div>
              {items.map(item => (
                <div key={item.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:"1px solid var(--border)" }}>
                  <input type="checkbox" checked={item.checked} onChange={()=>toggle(item.id)} style={{ width:16, height:16, cursor:"pointer", accentColor:"var(--teal)" }} />
                  <span style={{ flex:1, fontSize:14, textDecoration:item.checked?"line-through":"none", color:item.checked?"var(--ink-muted)":"var(--ink)", transition:"all 0.2s" }}>{item.name}</span>
                  <button onClick={()=>remove(item.id)} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--ink-muted)", opacity:0.6 }}>
                    <Icon name="close" size={13} />
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   JOURNAL TAB
═══════════════════════════════════════════════════════ */
function JournalTab({ state, dispatch }) {
  const trip = useMemo(() => state.trips.find(t => t.id === state.activeTrip), [state.trips, state.activeTrip]);
  const [entries, setEntries] = useState([]);
  const [form, setForm]       = useState({ title:"", body:"", mood:"😊", date:new Date().toISOString().split("T")[0] });
  const [viewEntry, setViewEntry] = useState(null);
  const MOODS = ["😊","🤩","😌","😢","😤","🤔","😴","🥰","😎"];

  if (!trip) return <NoTripPlaceholder dispatch={dispatch} />;

  const tripEntries = useMemo(() => (trip.journal||[]).sort((a,b) => new Date(b.date)-new Date(a.date)), [trip.journal]);

  const addEntry = () => {
    if (!form.title.trim() || !form.body.trim()) return;
    const entry = { id:Date.now(), ...form, createdAt:new Date().toLocaleString() };
    dispatch({ type:"UPDATE_TRIP", payload:{ ...trip, journal:[...(trip.journal||[]), entry] }});
    setForm({ title:"", body:"", mood:"😊", date:new Date().toISOString().split("T")[0] });
  };

  const deleteEntry = (id) => dispatch({ type:"UPDATE_TRIP", payload:{ ...trip, journal:(trip.journal||[]).filter(e=>e.id!==id) }});

  return (
    <div style={{ maxWidth:1000, margin:"0 auto", padding:"40px 24px" }}>
      <div style={{ marginBottom:32 }}>
        <h2 style={{ fontSize:32, marginBottom:4 }}>Travel Journal</h2>
        <p style={{ color:"var(--ink-muted)" }}>{trip.name} · {tripEntries.length} entr{tripEntries.length!==1?"ies":"y"}</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 380px", gap:28 }}>
        {/* Entries */}
        <div>
          {tripEntries.length === 0 ? (
            <div style={{ textAlign:"center", padding:"64px 0", color:"var(--ink-muted)", border:"2px dashed var(--border)", borderRadius:"var(--radius)" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>📖</div>
              <h3 style={{ fontFamily:"var(--font-display)", color:"var(--ink)", marginBottom:8 }}>Your story awaits</h3>
              <p>Document your memories, thoughts and discoveries</p>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {tripEntries.map((entry, i) => (
                <div key={entry.id} className="card animate-in" style={{ padding:24, cursor:"pointer", transition:"all var(--transition)", animationDelay:`${i*60}ms` }}
                  onMouseEnter={e=>{e.currentTarget.style.boxShadow="var(--shadow-lg)";e.currentTarget.style.transform="translateY(-2px)";}}
                  onMouseLeave={e=>{e.currentTarget.style.boxShadow="var(--shadow)";e.currentTarget.style.transform="none";}}
                  onClick={()=>setViewEntry(entry)}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                    <div>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                        <span style={{ fontSize:22 }}>{entry.mood}</span>
                        <h3 style={{ fontSize:18 }}>{entry.title}</h3>
                      </div>
                      <p style={{ fontSize:13, color:"var(--ink-muted)" }}>{entry.date} · {entry.createdAt}</p>
                    </div>
                    <button onClick={e=>{e.stopPropagation();if(confirm("Delete entry?"))deleteEntry(entry.id);}} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--ink-muted)" }}>
                      <Icon name="trash" size={15} />
                    </button>
                  </div>
                  <p style={{ color:"var(--ink-soft)", fontSize:14, lineHeight:1.7, display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{entry.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Write entry */}
        <div>
          <div className="card" style={{ padding:24, position:"sticky", top:88, borderTop:"3px solid var(--teal)" }}>
            <h4 style={{ fontFamily:"var(--font-display)", fontSize:18, marginBottom:18 }}>New Entry</h4>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div>
                <label style={{ fontSize:12, color:"var(--ink-muted)", display:"block", marginBottom:5 }}>Date</label>
                <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} />
              </div>
              <div>
                <label style={{ fontSize:12, color:"var(--ink-muted)", display:"block", marginBottom:5 }}>Mood</label>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {MOODS.map(m => (
                    <button key={m} onClick={()=>setForm({...form,mood:m})} style={{ fontSize:22, background:form.mood===m?"var(--surface-2)":"transparent", border:form.mood===m?"2px solid var(--teal)":"2px solid transparent", borderRadius:8, padding:4, cursor:"pointer", transition:"all 0.15s" }}>{m}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize:12, color:"var(--ink-muted)", display:"block", marginBottom:5 }}>Title *</label>
                <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Morning at Arashiyama" />
              </div>
              <div>
                <label style={{ fontSize:12, color:"var(--ink-muted)", display:"block", marginBottom:5 }}>Your story *</label>
                <textarea value={form.body} onChange={e=>setForm({...form,body:e.target.value})} placeholder="Write about your day, what you saw, felt, tasted…" style={{ minHeight:140 }} />
              </div>
              <button className="btn btn-teal" style={{ justifyContent:"center", padding:"12px" }} onClick={addEntry}>
                <Icon name="note" size={16} /> Save Entry
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Entry modal */}
      {viewEntry && (
        <div onClick={()=>setViewEntry(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
          <div className="card animate-in" onClick={e=>e.stopPropagation()} style={{ maxWidth:640, width:"100%", maxHeight:"85vh", overflow:"auto", padding:36 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                  <span style={{ fontSize:32 }}>{viewEntry.mood}</span>
                  <h2 style={{ fontSize:24 }}>{viewEntry.title}</h2>
                </div>
                <p style={{ color:"var(--ink-muted)", fontSize:13 }}>{viewEntry.date}</p>
              </div>
              <button onClick={()=>setViewEntry(null)} style={{ background:"var(--surface-2)", border:"none", cursor:"pointer", borderRadius:"50%", width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Icon name="close" size={18} />
              </button>
            </div>
            <div style={{ borderTop:"1px solid var(--border)", paddingTop:20 }}>
              <p style={{ color:"var(--ink-soft)", lineHeight:1.9, fontSize:16, whiteSpace:"pre-wrap" }}>{viewEntry.body}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SHARED: No Trip Placeholder
═══════════════════════════════════════════════════════ */
function NoTripPlaceholder({ dispatch }) {
  return (
    <div style={{ textAlign:"center", padding:"100px 24px", color:"var(--ink-muted)" }}>
      <div style={{ fontSize:64, marginBottom:16 }}>🗺️</div>
      <h3 style={{ fontFamily:"var(--font-display)", fontSize:24, color:"var(--ink)", marginBottom:8 }}>No active trip selected</h3>
      <p style={{ marginBottom:24, maxWidth:400, margin:"0 auto 24px" }}>Create a trip in My Trips and set it as active to start planning.</p>
      <button className="btn btn-gold" onClick={()=>dispatch({type:"SET_TAB",payload:"trips"})}>
        <Icon name="flight" size={16} /> Go to My Trips
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════ */
export default function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", state.darkMode);
  }, [state.darkMode]);

  const renderTab = useMemo(() => {
    switch (state.activeTab) {
      case "explore":   return <ExploreTab state={state} dispatch={dispatch} />;
      case "trips":     return <TripsTab state={state} dispatch={dispatch} />;
      case "itinerary": return <ItineraryTab state={state} dispatch={dispatch} />;
      case "budget":    return <BudgetTab state={state} dispatch={dispatch} />;
      case "packing":   return <PackingTab state={state} dispatch={dispatch} />;
      case "journal":   return <JournalTab state={state} dispatch={dispatch} />;
      default:          return null;
    }
  }, [state]);

  return (
    <ErrorBoundary>
      <GlobalStyles />
      <div style={{ minHeight:"100vh", background:"var(--sand)", transition:"background 0.3s" }}>
        <Header state={state} dispatch={dispatch} />
        <main>
          {renderTab}
        </main>
        <footer style={{ textAlign:"center", padding:"32px 24px", color:"var(--ink-muted)", fontSize:13, borderTop:"1px solid var(--border)", marginTop:40 }}>
          ✈️ <strong style={{ fontFamily:"var(--font-display)", color:"var(--gold)" }}>SAFAR</strong> — Your Complete Travel Companion · Built with React + Context API
        </footer>
      </div>
    </ErrorBoundary>
  );
}