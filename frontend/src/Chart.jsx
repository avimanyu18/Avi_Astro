import React from 'react'

const SIGNS = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'
]

function signToBase(sign){
  const idx = SIGNS.indexOf(sign)
  if(idx === -1) return 0
  return idx * 30
}

function getLongitude(entry){
  if(!entry) return 0
  if(entry.longitude !== undefined && entry.longitude !== null) return Number(entry.longitude) % 360
  if(entry.sign && entry.degree !== undefined) return (signToBase(entry.sign) + Number(entry.degree)) % 360
  return 0
}

const CELL_POS = [
  [0.5, 0.12],  // Top Center (House 1 / Ascendant default)
  [0.82, 0.22], // Top Right
  [0.88, 0.5],  // Mid Right
  [0.82, 0.78], // Bottom Right
  [0.5, 0.88],  // Bottom Center
  [0.18, 0.78], // Bottom Left
  [0.12, 0.5],  // Mid Left
  [0.18, 0.22], // Top Left
  [0.5, 0.5],   // Center
]

export default function Chart({planets, size=380, title='D1 Chart', layout='south', lagna=null, computed=null, onPlanetClick=null}){
  const cx = size/2, cy = size/2, r = size*0.4
  const entries = Object.entries(planets || {})

  const renderWheel = () => (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto drop-shadow-lg">
      <defs>
        <radialGradient id="wheelGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </radialGradient>
      </defs>
      
      <circle cx={cx} cy={cy} r={r} fill="url(#wheelGrad)" stroke="#f59e0b" strokeWidth="2" opacity="0.9" />
      <circle cx={cx} cy={cy} r={r*0.45} fill="#0b0f19" stroke="#d97706" strokeWidth="1" strokeDasharray="4 2" />

      {Array.from({length:12}).map((_,i)=>{
        const ang = (i*30 - 90) * Math.PI/180
        const x = cx + r * Math.cos(ang)
        const y = cy + r * Math.sin(ang)
        const signLabel = SIGNS[i].substring(0, 3)
        const lx = cx + (r*0.88) * Math.cos((i*30 - 75) * Math.PI/180)
        const ly = cy + (r*0.88) * Math.sin((i*30 - 75) * Math.PI/180)
        return (
          <g key={i}>
            <line x1={cx} y1={cy} x2={x} y2={y} stroke="#f59e0b" strokeWidth="1" opacity="0.3" />
            <text x={lx} y={ly} fontSize="10" fill="#fef08a" textAnchor="middle" opacity="0.8" fontWeight="600">{signLabel}</text>
          </g>
        )
      })}

      {entries.map(([p,entry])=>{
        const lon = getLongitude(entry)
        const ang = (lon - 90) * Math.PI/180
        const px = cx + (r*0.68) * Math.cos(ang)
        const py = cy + (r*0.68) * Math.sin(ang)
        const degreeText = entry && entry.degree !== undefined ? `${entry.degree}°` : ''
        
        let houseLabel = ''
        try {
          const houses = computed && computed.houses
          const h = houses && houses[p] && houses[p].house
          if(h) houseLabel = `H${h}`
        } catch(e){}

        return (
          <g key={p} transform={`translate(${px},${py})`} className="transition-transform duration-200 hover:scale-125 cursor-pointer">
            <title>{p} - {entry?.sign || ''} {degreeText} ({houseLabel})</title>
            <circle r="14" fill="#d97706" stroke="#fef08a" strokeWidth="1.5" />
            <text x={0} y={4} fontSize="9" fill="#ffffff" fontWeight="bold" textAnchor="middle" style={{pointerEvents: 'none'}}>{p.substring(0,2)}</text>
          </g>
        )
      })}
    </svg>
  )

  const renderNorth = () => {
    let ascIndex = null
    if(lagna){
      if(typeof lagna === 'string') ascIndex = SIGNS.indexOf(lagna)
      else if(typeof lagna === 'object' && lagna.sign) ascIndex = SIGNS.indexOf(lagna.sign)
      if(ascIndex === -1) ascIndex = null
    }

    const signCell = {}
    for(let i=0; i<12; i++){
      const signIdx = ((ascIndex !== null ? ascIndex : 0) + i) % 12
      signCell[SIGNS[signIdx]] = i % 8
    }

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto drop-shadow-lg">
        <rect x={size*0.05} y={size*0.05} width={size*0.9} height={size*0.9} fill="#0f172a" stroke="#f59e0b" strokeWidth="2" rx="10" />
        
        {/* Diamond inner grid lines */}
        <line x1={size*0.5} y1={size*0.05} x2={size*0.95} y2={size*0.5} stroke="#d97706" strokeWidth="1.5" opacity="0.6" />
        <line x1={size*0.95} y1={size*0.5} x2={size*0.5} y2={size*0.95} stroke="#d97706" strokeWidth="1.5" opacity="0.6" />
        <line x1={size*0.5} y1={size*0.95} x2={size*0.05} y2={size*0.5} stroke="#d97706" strokeWidth="1.5" opacity="0.6" />
        <line x1={size*0.05} y1={size*0.5} x2={size*0.5} y2={size*0.05} stroke="#d97706" strokeWidth="1.5" opacity="0.6" />

        {CELL_POS.map((pos, i) => {
          const x = pos[0]*size - 36
          const y = pos[1]*size - 18
          const sign = Object.keys(signCell).find(s => signCell[s] === i)
          return (
            <g key={i}>
              <rect x={x} y={y} width="72" height="36" fill="#1e293b" stroke="#f59e0b" strokeWidth="0.8" rx="6" opacity="0.85" />
              <text x={x+36} y={y+14} fontSize="9" fill="#fef08a" textAnchor="middle" fontWeight="600">{sign ? sign.substring(0,3) : ''}</text>
            </g>
          )
        })}

        {entries.map(([p, entry]) => {
          const lon = getLongitude(entry)
          const signIdx = Math.floor(lon/30) % 12
          const signName = SIGNS[signIdx]
          const cell = signCell[signName] || 8
          const pos = CELL_POS[cell]
          const px = pos[0]*size
          const py = pos[1]*size + 6

          return (
            <g key={p} transform={`translate(${px},${py})`} className="cursor-pointer">
              <title>{p} - {signName} {entry?.degree ? `${entry.degree}°` : ''}</title>
              <circle r="12" fill="#d97706" stroke="#ffffff" strokeWidth="1.5" onClick={() => onPlanetClick && onPlanetClick(p, entry)} />
              <text x={0} y={4} fontSize="9" fill="#ffffff" fontWeight="bold" textAnchor="middle" style={{pointerEvents: 'none'}}>{p.substring(0,2)}</text>
            </g>
          )
        })}
      </svg>
    )
  }

  return (
    <div className="mt-4 text-center">
      <div className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs font-semibold text-amber-400 mb-3">
        {title} ({layout === 'south' ? 'South Wheel' : 'North Diamond'})
      </div>
      {layout === 'south' ? renderWheel() : renderNorth()}
    </div>
  )
}

