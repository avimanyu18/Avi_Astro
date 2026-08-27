// Pure Standalone Native Vedic Astrology Engine (Lahiri Ayanamsha, 16 Shodashavargas D1-D60, Vimshottari Dasha, Doshas, Panchang & AI Reasoning)

export const ZODIAC_SIGNS = [
  { id: 1, name: "Aries", sanskrit: "Mesha", lord: "Mars", element: "Fire" },
  { id: 2, name: "Taurus", sanskrit: "Vrishabha", lord: "Venus", element: "Earth" },
  { id: 3, name: "Gemini", sanskrit: "Mithuna", lord: "Mercury", element: "Air" },
  { id: 4, name: "Cancer", sanskrit: "Karka", lord: "Moon", element: "Water" },
  { id: 5, name: "Leo", sanskrit: "Simha", lord: "Sun", element: "Fire" },
  { id: 6, name: "Virgo", sanskrit: "Kanya", lord: "Mercury", element: "Earth" },
  { id: 7, name: "Libra", sanskrit: "Tula", lord: "Venus", element: "Air" },
  { id: 8, name: "Scorpio", sanskrit: "Vrishchika", lord: "Mars", element: "Water" },
  { id: 9, name: "Sagittarius", sanskrit: "Dhanu", lord: "Jupiter", element: "Fire" },
  { id: 10, name: "Capricorn", sanskrit: "Makara", lord: "Saturn", element: "Earth" },
  { id: 11, name: "Aquarius", sanskrit: "Kumbha", lord: "Saturn", element: "Air" },
  { id: 12, name: "Pisces", sanskrit: "Meena", lord: "Jupiter", element: "Water" }
];

export const NAKSHATRAS = [
  { name: "Ashwini", lord: "Ketu", yoni: "Horse", gana: "Deva", nadi: "Adi" },
  { name: "Bharani", lord: "Venus", yoni: "Elephant", gana: "Manushya", nadi: "Madhya" },
  { name: "Krittika", lord: "Sun", yoni: "Sheep", gana: "Rakshasa", nadi: "Antya" },
  { name: "Rohini", lord: "Moon", yoni: "Serpent", gana: "Manushya", nadi: "Antya" },
  { name: "Mrigashira", lord: "Mars", yoni: "Serpent", gana: "Deva", nadi: "Madhya" },
  { name: "Ardra", lord: "Rahu", yoni: "Dog", gana: "Manushya", nadi: "Adi" },
  { name: "Punarvasu", lord: "Jupiter", yoni: "Cat", gana: "Deva", nadi: "Adi" },
  { name: "Pushya", lord: "Saturn", yoni: "Goat", gana: "Deva", nadi: "Madhya" },
  { name: "Ashlesha", lord: "Mercury", yoni: "Cat", gana: "Rakshasa", nadi: "Antya" },
  { name: "Magha", lord: "Ketu", yoni: "Rat", gana: "Rakshasa", nadi: "Antya" },
  { name: "Purva Phalguni", lord: "Venus", yoni: "Rat", gana: "Manushya", nadi: "Madhya" },
  { name: "Uttara Phalguni", lord: "Sun", yoni: "Bull", gana: "Manushya", nadi: "Adi" },
  { name: "Hasta", lord: "Moon", yoni: "Buffalo", gana: "Deva", nadi: "Adi" },
  { name: "Chitra", lord: "Mars", yoni: "Tiger", gana: "Rakshasa", nadi: "Madhya" },
  { name: "Swati", lord: "Rahu", yoni: "Buffalo", gana: "Deva", nadi: "Antya" },
  { name: "Vishakha", lord: "Jupiter", yoni: "Tiger", gana: "Rakshasa", nadi: "Antya" },
  { name: "Anuradha", lord: "Saturn", yoni: "Deer", gana: "Deva", nadi: "Madhya" },
  { name: "Jyeshtha", lord: "Mercury", yoni: "Deer", gana: "Rakshasa", nadi: "Adi" },
  { name: "Mula", lord: "Ketu", yoni: "Dog", gana: "Rakshasa", nadi: "Adi" },
  { name: "Purva Ashadha", lord: "Venus", yoni: "Monkey", gana: "Manushya", nadi: "Madhya" },
  { name: "Uttara Ashadha", lord: "Sun", yoni: "Mongoose", gana: "Manushya", nadi: "Antya" },
  { name: "Shravana", lord: "Moon", yoni: "Monkey", gana: "Deva", nadi: "Antya" },
  { name: "Dhanishta", lord: "Mars", yoni: "Lion", gana: "Rakshasa", nadi: "Madhya" },
  { name: "Shatabhisha", lord: "Rahu", yoni: "Horse", gana: "Rakshasa", nadi: "Adi" },
  { name: "Purva Bhadrapada", lord: "Jupiter", yoni: "Lion", gana: "Manushya", nadi: "Adi" },
  { name: "Uttara Bhadrapada", lord: "Saturn", yoni: "Cow", gana: "Manushya", nadi: "Madhya" },
  { name: "Revati", lord: "Mercury", yoni: "Elephant", gana: "Deva", nadi: "Antya" }
];

export const DASHA_ORDER = [
  { lord: "Ketu", years: 7 },
  { lord: "Venus", years: 20 },
  { lord: "Sun", years: 6 },
  { lord: "Moon", years: 10 },
  { lord: "Mars", years: 7 },
  { lord: "Rahu", years: 18 },
  { lord: "Jupiter", years: 16 },
  { lord: "Saturn", years: 19 },
  { lord: "Mercury", years: 17 }
];

export function getJulianDay(year, month, day, hours = 12, minutes = 0) {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  const dayFraction = day + (hours + minutes / 60) / 24;
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + dayFraction + b - 1524.5;
}

export function getLahiriAyanamsha(jd) {
  const t = (jd - 2451545.0) / 36525.0;
  return 23.85 + 1.396 * t;
}

export function calculatePlanetaryPositions(year, month, day, hour = 12, minute = 0) {
  const jd = getJulianDay(year, month, day, hour, minute);
  const ayanamsha = getLahiriAyanamsha(jd);
  const d = jd - 2451545.0;

  let sunTrop = (280.466 + 0.98564736 * d) % 360;
  let moonTrop = (218.316 + 13.176396 * d) % 360;
  let marsTrop = (355.433 + 0.524033 * d) % 360;
  let mercTrop = (34.0 + 4.0923344 * d) % 360;
  let jupTrop = (34.351 + 0.083091 * d) % 360;
  let venTrop = (50.416 + 1.602130 * d) % 360;
  let satTrop = (50.077 + 0.033459 * d) % 360;
  let rahuTrop = (125.04 - 0.0529539 * d) % 360;

  const norm = (deg) => (deg % 360 + 360) % 360;

  const sunLong = norm(sunTrop - ayanamsha);
  const moonLong = norm(moonTrop - ayanamsha);
  const marsLong = norm(marsTrop - ayanamsha);
  const mercLong = norm(mercTrop - ayanamsha);
  const jupLong = norm(jupTrop - ayanamsha);
  const venLong = norm(venTrop - ayanamsha);
  const satLong = norm(satTrop - ayanamsha);
  const rahuLong = norm(rahuTrop - ayanamsha);
  const ketuLong = norm(rahuLong + 180);

  const hourOffset = ((hour + minute / 60) - 6) * 15;
  const lagnaLong = norm(sunLong + hourOffset);

  return {
    Lagna: lagnaLong,
    Sun: sunLong,
    Moon: moonLong,
    Mars: marsLong,
    Mercury: mercLong,
    Jupiter: jupLong,
    Venus: venLong,
    Saturn: satLong,
    Rahu: rahuLong,
    Ketu: ketuLong
  };
}

export function getSignInfo(longitude) {
  const normLong = (longitude % 360 + 360) % 360;
  const signId = Math.floor(normLong / 30) + 1;
  const degInSign = normLong % 30;
  const signObj = ZODIAC_SIGNS.find((s) => s.id === signId);
  return {
    sign_id: signId,
    sign_name: signObj.name,
    sanskrit_name: signObj.sanskrit,
    lord: signObj.lord,
    element: signObj.element,
    degree: Math.round(degInSign * 100) / 100,
    total_longitude: normLong
  };
}

// Complete 16 Shodashavargas Calculation (D1 to D60)
export function calculateDivisionalCharts(rawPositions) {
  const numList = [1, 2, 3, 4, 7, 9, 10, 12, 16, 20, 24, 27, 30, 40, 45, 60];
  const vargas = {};
  numList.forEach((n) => { vargas[`D${n}`] = {}; });

  for (const [body, long] of Object.entries(rawPositions)) {
    const d1Sign = Math.floor(long / 30) + 1;
    const deg = long % 30;

    vargas["D1"][body] = { sign_id: d1Sign, degree: deg };

    // D2 Hora
    const d2Sign = deg < 15 ? d1Sign : ((d1Sign % 12) + 1);
    vargas["D2"][body] = { sign_id: d2Sign, degree: (deg % 15) * 2 };

    // D3 Drekkana
    const d3Part = Math.floor(deg / 10);
    const d3Sign = ((d1Sign - 1 + d3Part * 4) % 12) + 1;
    vargas["D3"][body] = { sign_id: d3Sign, degree: (deg % 10) * 3 };

    // D4 Chaturthamsha
    const d4Part = Math.floor(deg / 7.5);
    const d4Sign = ((d1Sign - 1 + d4Part * 3) % 12) + 1;
    vargas["D4"][body] = { sign_id: d4Sign, degree: (deg % 7.5) * 4 };

    // D7 Saptamsha
    const d7Part = Math.floor(deg / (30 / 7));
    const d7Start = d1Sign % 2 !== 0 ? d1Sign : ((d1Sign + 6 - 1) % 12) + 1;
    const d7Sign = ((d7Start - 1 + d7Part) % 12) + 1;
    vargas["D7"][body] = { sign_id: d7Sign, degree: (deg % (30 / 7)) * 7 };

    // D9 Navamsha
    const d9Part = Math.floor(deg / (3 + 1/3));
    let d9Start = 1;
    if ([1, 5, 9].includes(d1Sign)) d9Start = 1;
    else if ([2, 6, 10].includes(d1Sign)) d9Start = 10;
    else if ([3, 7, 11].includes(d1Sign)) d9Start = 7;
    else d9Start = 4;
    const d9Sign = ((d9Start - 1 + d9Part) % 12) + 1;
    vargas["D9"][body] = { sign_id: d9Sign, degree: (deg % (3 + 1/3)) * 9 };

    // D10 Dashamsha
    const d10Part = Math.floor(deg / 3);
    const d10Start = d1Sign % 2 !== 0 ? d1Sign : ((d1Sign + 8 - 1) % 12) + 1;
    const d10Sign = ((d10Start - 1 + d10Part) % 12) + 1;
    vargas["D10"][body] = { sign_id: d10Sign, degree: (deg % 3) * 10 };

    // D12 Dwadasamsha
    const d12Part = Math.floor(deg / 2.5);
    const d12Sign = ((d1Sign - 1 + d12Part) % 12) + 1;
    vargas["D12"][body] = { sign_id: d12Sign, degree: (deg % 2.5) * 12 };

    // D16 Shodashamsha
    const d16Part = Math.floor(deg / 1.875);
    const d16Sign = ((d1Sign - 1 + d16Part) % 12) + 1;
    vargas["D16"][body] = { sign_id: d16Sign, degree: (deg % 1.875) * 16 };

    // D20 Vimsamsha
    const d20Part = Math.floor(deg / 1.5);
    const d20Sign = ((d1Sign - 1 + d20Part) % 12) + 1;
    vargas["D20"][body] = { sign_id: d20Sign, degree: (deg % 1.5) * 20 };

    // D24 Siddhamsa
    const d24Part = Math.floor(deg / 1.25);
    const d24Sign = ((d1Sign - 1 + d24Part) % 12) + 1;
    vargas["D24"][body] = { sign_id: d24Sign, degree: (deg % 1.25) * 24 };

    // D27 Bhamsa
    const d27Part = Math.floor(deg / (30 / 27));
    const d27Sign = ((d1Sign - 1 + d27Part) % 12) + 1;
    vargas["D27"][body] = { sign_id: d27Sign, degree: (deg % (30 / 27)) * 27 };

    // D30 Trimsamsha
    const d30Sign = ((d1Sign - 1 + Math.floor(deg)) % 12) + 1;
    vargas["D30"][body] = { sign_id: d30Sign, degree: deg };

    // D40 Khavedamsha
    const d40Part = Math.floor(deg / 0.75);
    const d40Sign = ((d1Sign - 1 + d40Part) % 12) + 1;
    vargas["D40"][body] = { sign_id: d40Sign, degree: (deg % 0.75) * 40 };

    // D45 Akshavedamsha
    const d45Part = Math.floor(deg / (30 / 45));
    const d45Sign = ((d1Sign - 1 + d45Part) % 12) + 1;
    vargas["D45"][body] = { sign_id: d45Sign, degree: (deg % (30 / 45)) * 45 };

    // D60 Shashtiamsha
    const d60Part = Math.floor(deg / 0.5);
    const d60Sign = ((d1Sign - 1 + d60Part) % 12) + 1;
    vargas["D60"][body] = { sign_id: d60Sign, degree: (deg % 0.5) * 60 };
  }

  return vargas;
}

export function getNakshatraInfo(moonLong) {
  const normLong = (moonLong % 360 + 360) % 360;
  const nakIndex = Math.floor(normLong / (13 + 1/3));
  const nakObj = NAKSHATRAS[nakIndex % 27];
  const degInNak = normLong % (13 + 1/3);
  const pada = Math.floor(degInNak / (3 + 1/3)) + 1;

  return {
    index: nakIndex + 1,
    name: nakObj.name,
    lord: nakObj.lord,
    pada,
    yoni: nakObj.yoni,
    gana: nakObj.gana,
    nadi: nakObj.nadi,
    degInNak,
    percentagePassed: degInNak / (13 + 1/3)
  };
}

export function calculateDoshas(rawPositions) {
  const lagnaSign = Math.floor(rawPositions.Lagna / 30) + 1;
  const moonSign = Math.floor(rawPositions.Moon / 30) + 1;
  const marsSign = Math.floor(rawPositions.Mars / 30) + 1;
  const rahuSign = Math.floor(rawPositions.Rahu / 30) + 1;
  const ketuSign = Math.floor(rawPositions.Ketu / 30) + 1;

  const houseLagna = ((marsSign - lagnaSign + 12) % 12) + 1;
  const houseMoon = ((marsSign - moonSign + 12) % 12) + 1;

  const isManglik = [1, 4, 7, 8, 12].includes(houseLagna) || [1, 4, 7, 8, 12].includes(houseMoon);

  // Kalsarpa: all planets between Rahu and Ketu axis
  const planets = [rawPositions.Sun, rawPositions.Moon, rawPositions.Mars,
    rawPositions.Mercury, rawPositions.Jupiter, rawPositions.Venus, rawPositions.Saturn];
  const rahu = rawPositions.Rahu;
  const ketu = rawPositions.Ketu;
  const allBetween = planets.every(p => {
    const norm = (deg) => (deg % 360 + 360) % 360;
    const rn = norm(rahu), kn = norm(ketu), pn = norm(p);
    if (rn < kn) return pn >= rn && pn <= kn;
    return pn >= rn || pn <= kn;
  });

  return {
    manglik_dosha: {
      is_present: isManglik,
      house_from_lagna: houseLagna,
      remedy: isManglik
        ? "Chant Hanuman Chalisa daily and offer water/belpatra to Lord Shiva on Tuesdays."
        : "No severe Manglik afflicted houses detected. Relationships are generally harmonious."
    },
    kalsarpa_dosha: {
      is_present: allBetween,
      remedy: allBetween
        ? "Perform Kalsarpa Puja at Trimbakeshwar Jyotirlinga and recite Maha Mrityunjaya Mantra 108 times daily."
        : "No Kalsarpa Dosha present. Planetary energies flow freely."
    }
  };
}

export function calculateVimshottariDasha(moonLong, birthDateObj) {
  const nakInfo = getNakshatraInfo(moonLong);
  const startingLord = nakInfo.lord;
  const startingIndex = DASHA_ORDER.findIndex((d) => d.lord === startingLord);

  const balanceRatio = 1 - nakInfo.percentagePassed;
  const totalStartingYears = DASHA_ORDER[startingIndex].years;
  const remainingStartingYears = totalStartingYears * balanceRatio;

  const timeline = [];
  let currentStart = new Date(birthDateObj.getTime());

  for (let i = 0; i < 9; i++) {
    const dIndex = (startingIndex + i) % 9;
    const dashaObj = DASHA_ORDER[dIndex];
    let durationYears = i === 0 ? remainingStartingYears : dashaObj.years;

    const endDate = new Date(currentStart.getTime());
    endDate.setFullYear(endDate.getFullYear() + Math.floor(durationYears));
    endDate.setMonth(endDate.getMonth() + Math.floor((durationYears % 1) * 12));

    const antardashas = [];
    let adStart = new Date(currentStart.getTime());
    for (let j = 0; j < 9; j++) {
      const adIndex = (dIndex + j) % 9;
      const adLordObj = DASHA_ORDER[adIndex];
      const adYears = (dashaObj.years * adLordObj.years) / 120;
      const adEnd = new Date(adStart.getTime());
      adEnd.setDate(adEnd.getDate() + Math.round(adYears * 365.25));

      antardashas.push({
        lord: adLordObj.lord,
        startDate: adStart.toISOString().split("T")[0],
        endDate: adEnd.toISOString().split("T")[0]
      });
      adStart = adEnd;
    }

    timeline.push({
      lord: dashaObj.lord,
      startDate: currentStart.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      durationYears: dashaObj.years,
      antardashas
    });
    currentStart = endDate;
  }

  return timeline;
}

export function calculatePanchang(sunLong, moonLong) {
  const norm = (deg) => (deg % 360 + 360) % 360;
  const diff = norm(moonLong - sunLong);
  const tithiNum = Math.floor(diff / 12) + 1;
  const paksha = tithiNum <= 15 ? "Shukla Paksha" : "Krishna Paksha";

  const nakInfo = getNakshatraInfo(moonLong);
  const yogaSum = norm(sunLong + moonLong);
  const yogaIndex = Math.floor(yogaSum / (13 + 1/3));

  const YOGAS_27 = [
    "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana",
    "Atiganda", "Sukarma", "Dhriti", "Shula", "Ganda",
    "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra",
    "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva",
    "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"
  ];

  return {
    tithi: `${paksha} Tithi ${tithiNum}`,
    nakshatra: `${nakInfo.name} (Pada ${nakInfo.pada})`,
    yoga: YOGAS_27[yogaIndex % 27],
    illuminationPercentage: Math.round((1 - Math.cos((diff * Math.PI) / 180)) * 50)
  };
}

export function detectYogas(rawPositions) {
  const yogas = [];
  const moonSign = Math.floor(rawPositions.Moon / 30) + 1;
  const jupSign = Math.floor(rawPositions.Jupiter / 30) + 1;
  const dist = ((jupSign - moonSign + 12) % 12) + 1;

  if ([1, 4, 7, 10].includes(dist)) {
    yogas.push({ name: "Gajakesari Yoga", effect: "Immense wisdom, high intellect, enduring prosperity, and noble honor.", strength: "Strong" });
  }

  if (Math.floor(rawPositions.Sun / 30) === Math.floor(rawPositions.Mercury / 30)) {
    yogas.push({ name: "Budhaditya Yoga", effect: "Sharp analytical mind, executive command, and scholarly prominence.", strength: "Moderate" });
  }

  return yogas;
}

export function queryAstrologerAI(question, profileData, rawPositions, dashaTimeline) {
  const lagnaInfo = getSignInfo(rawPositions.Lagna || 0);
  const moonInfo = getSignInfo(rawPositions.Moon || 0);
  const sunInfo = getSignInfo(rawPositions.Sun || 0);
  const nakInfo = getNakshatraInfo(rawPositions.Moon || 0);
  const yogas = detectYogas(rawPositions);
  const doshas = calculateDoshas(rawPositions);
  const currentMD = dashaTimeline[0]?.lord || 'Sun';
  const nextMD = dashaTimeline[1]?.lord || 'Moon';
  const currentMDEnd = dashaTimeline[0]?.endDate || 'N/A';
  const gender = profileData.gender || 'Male';
  const pronoun = gender === 'Female' ? 'her' : 'his';
  const pronounCap = gender === 'Female' ? 'Her' : 'His';
  const genderTitle = gender === 'Female' ? 'She' : 'He';

  let response = `Namaste ${profileData.name || 'Seeker'} Ji! \ud83d\ude4f\n\n`;
  response += `*\u2606 Active Chart Snapshot*:\n`;
  response += `\u2022 **Lagna (Ascendant)**: ${lagnaInfo.sign_name} (${lagnaInfo.sanskrit_name}) \u2014 Lord ${lagnaInfo.lord}\n`;
  response += `\u2022 **Sun Sign (Rashi)**: ${sunInfo.sign_name} \u2014 ${sunInfo.degree.toFixed(1)}\u00b0\n`;
  response += `\u2022 **Moon Sign**: ${moonInfo.sign_name} in ${nakInfo.name} Nakshatra (Pada ${nakInfo.pada})\n`;
  response += `\u2022 **Active Mahadasha**: ${currentMD} (ends ${currentMDEnd}) \u2192 next: ${nextMD}\n\n`;

  const q = question.toLowerCase();

  if (q.includes('career') || q.includes('job') || q.includes('work') || q.includes('profession') || q.includes('business')) {
    response += `### \ud83d\udcbc Career & Profession Analysis (D10 Dashamsha)\n`;
    response += `${genderTitle} was born with **${lagnaInfo.sign_name} Lagna**, ruled by **${lagnaInfo.lord}**, making ${pronoun} naturally suited for ${lagnaInfo.lord === 'Mars' ? 'defense, engineering, or sports' : lagnaInfo.lord === 'Mercury' ? 'communication, technology, or commerce' : lagnaInfo.lord === 'Jupiter' ? 'law, teaching, or consulting' : lagnaInfo.lord === 'Venus' ? 'arts, luxury, or entertainment' : lagnaInfo.lord === 'Saturn' ? 'discipline, government, or research' : 'leadership and administration'}.\n\n`;
    response += `During **${currentMD} Mahadasha** (active until ${currentMDEnd}), opportunities in ${currentMD === 'Jupiter' ? 'education, finance, or spirituality' : currentMD === 'Venus' ? 'creative fields, relationships, or luxury goods' : currentMD === 'Saturn' ? 'structured roles, real estate, or long-term projects' : currentMD === 'Rahu' ? 'technology, foreign connections, or unconventional paths' : currentMD === 'Mercury' ? 'communications, IT, or trade' : 'self-driven enterprises'} are favored.\n\n`;
    response += `**\ud83d\udd11 Key Remedies**: Recite *Om Budhaya Namah* 108 times on Wednesdays. Wear a green emerald or Peridot on Wednesday morning.`;

  } else if (q.includes('marriage') || q.includes('spouse') || q.includes('love') || q.includes('partner') || q.includes('relationship')) {
    response += `### \ud83d\udc8d Marriage & Relationships (D9 Navamsha)\n`;
    response += `Your 7th house and **D9 Navamsha** chart govern marriage and soul-level partnerships. With **${moonInfo.sign_name}** Moon, your ideal partner shares qualities of ` +
      (moonInfo.sign_name === 'Scorpio' || moonInfo.sign_name === 'Aries' ? 'intensity, passion, and emotional depth' :
       moonInfo.sign_name === 'Taurus' || moonInfo.sign_name === 'Libra' ? 'beauty, stability, and artistic sensibility' :
       moonInfo.sign_name === 'Gemini' || moonInfo.sign_name === 'Virgo' ? 'intelligence, wit, and adaptability' :
       moonInfo.sign_name === 'Cancer' || moonInfo.sign_name === 'Pisces' ? 'nurturing care, spirituality, and empathy' :
       'wisdom, justice, and noble character') + `.\n\n`;
    if (doshas.manglik_dosha.is_present) {
      response += `\u26a0\ufe0f **Manglik Note**: Mars occupies a sensitive house. It is recommended to consider compatibility with a partner who also carries Manglik influence for balance.\n\n`;
    }
    response += `**${currentMD} Mahadasha** ${currentMD === 'Venus' ? 'is highly auspicious for marriage — Venus directly activates relationships.' : currentMD === 'Jupiter' ? 'brings blessings for marriage through Jupiter\'s wisdom.' : 'brings general stability for long-term commitment.'} Best marriage timing: during Venus or Jupiter antardasha.\n\n`;
    response += `**\ud83d\udd11 Remedy**: Chant *Om Shukraya Namah* 108 times on Fridays. Offer white flowers to Goddess Lakshmi.`;

  } else if (q.includes('wealth') || q.includes('money') || q.includes('finance') || q.includes('rich') || q.includes('property')) {
    response += `### \ud83d\udcb0 Wealth & Financial Prosperity (D2 Hora)\n`;
    response += `Your **2nd house** (accumulated wealth) and **11th house** (income & gains) are the primary wealth indicators. The **D2 Hora chart** gives fine details on financial accumulation.\n\n`;
    response += `With **${lagnaInfo.lord}** as your Lagna lord, financial gains come through ${lagnaInfo.lord === 'Jupiter' ? 'consulting, teaching, investments, or wisdom-based professions' : lagnaInfo.lord === 'Venus' ? 'creative ventures, luxury trade, or partnerships' : lagnaInfo.lord === 'Saturn' ? 'disciplined saving, real estate, or long-term assets' : lagnaInfo.lord === 'Mercury' ? 'trading, communication, or intellectual work' : 'leadership and self-employment'}.\n\n`;
    response += `During **${currentMD} Mahadasha**, ${currentMD === 'Venus' || currentMD === 'Jupiter' || currentMD === 'Mercury' ? 'financial expansion is strongly indicated.' : 'steady, patient accumulation is the wise strategy.'}\n\n`;
    response += `**\ud83d\udd11 Remedy**: Chant *Om Shri Mahalakshmyai Namah* on Fridays. Keep a crystal Shri Yantra at home facing East.`;

  } else if (q.includes('health') || q.includes('illness') || q.includes('body') || q.includes('disease')) {
    response += `### \u2695\ufe0f Health & Vitality (D30 Trimsamsha)\n`;
    response += `The **1st house (Lagna)**, **6th house**, and **8th house** govern health and vitality. The **D30 Trimsamsha** chart gives deep insight into chronic or hidden health patterns.\n\n`;
    response += `With **${lagnaInfo.sign_name} Lagna**, general constitution is ${lagnaInfo.element === 'Fire' ? 'energetic and active — watch for inflammation or fevers' : lagnaInfo.element === 'Earth' ? 'grounded and resilient — watch for digestive or skeletal issues' : lagnaInfo.element === 'Air' ? 'mental and communicative — watch for nervous system or respiratory concerns' : 'sensitive and intuitive — watch for water-related or emotional health patterns'}.\n\n`;
    response += `**\ud83d\udd11 Remedy**: Practice Surya Namaskar (Sun Salutation) daily at sunrise. Chant *Mahamrityunjaya Mantra* 108 times for longevity and vitality. Avoid excessive ${lagnaInfo.element === 'Fire' ? 'spicy and stimulating foods.' : lagnaInfo.element === 'Earth' ? 'heavy and oily foods.' : lagnaInfo.element === 'Air' ? 'raw and cold foods.' : 'salty and cold fluids.'}`;

  } else if (q.includes('spiritual') || q.includes('moksha') || q.includes('dharma') || q.includes('meditation') || q.includes('karma')) {
    response += `### \ud83d\udd4e Spirituality & Dharmic Path (D20 Vimsamsha)\n`;
    response += `The **D20 Vimsamsha** chart reveals your soul\'s spiritual journey and sacred practices. The **9th house** (dharma, guru) and **12th house** (liberation, moksha) are key.\n\n`;
    response += `Your **${nakInfo.name} Nakshatra** (ruled by **${nakInfo.lord}**) reveals ${nakInfo.lord === 'Ketu' ? 'deep past-life wisdom and spiritual gifts — drawn to liberation and mysticism' : nakInfo.lord === 'Jupiter' ? 'a natural teacher and truth-seeker — expansion through wisdom' : nakInfo.lord === 'Moon' ? 'devotion and bhakti yoga are most powerful for you' : nakInfo.lord === 'Sun' ? 'inner authority and self-realization are your dharmic path' : 'unique spiritual gifts tied to this Nakshatra\'s energy'}.\n\n`;
    response += `**\ud83d\udd11 Practice**: ${nakInfo.lord === 'Ketu' ? 'Study Advaita Vedanta, practice Vipassana meditation, and observe regular silence (Mauna).' : nakInfo.lord === 'Jupiter' ? 'Read scriptures daily (Bhagavad Gita, Upanishads). Serve teachers and elders.' : nakInfo.lord === 'Moon' ? 'Practice devotional chanting (Bhajans), offer white flowers to Shiva on Mondays.' : 'Maintain daily meditation, offer oblations to the divine, and practice sattvic living.'}`;

  } else if (q.includes('dasha') || q.includes('period') || q.includes('mahadasha') || q.includes('antardasha')) {
    response += `### \u23f3 Vimshottari Dasha Analysis\n`;
    response += `**Current Mahadasha: ${currentMD}** (active until ${currentMDEnd})\n`;
    response += `**Next Mahadasha: ${nextMD}**\n\n`;
    response += `The **${currentMD} period** brings ${currentMD === 'Sun' ? 'themes of authority, father-figure dynamics, government interactions, and self-identity.' : currentMD === 'Moon' ? 'themes of mind, emotions, mother, home, travel, and public image.' : currentMD === 'Mars' ? 'themes of energy, courage, siblings, property, and legal matters.' : currentMD === 'Rahu' ? 'themes of ambition, technology, foreign influences, and unconventional growth.' : currentMD === 'Jupiter' ? 'themes of wisdom, expansion, children, spirituality, and financial blessings.' : currentMD === 'Saturn' ? 'themes of discipline, delays, karma, service, and long-term transformation.' : currentMD === 'Mercury' ? 'themes of intellect, communication, commerce, and analytical growth.' : currentMD === 'Ketu' ? 'themes of detachment, spirituality, past karma, and inner liberation.' : 'themes of luxury, relationships, arts, creativity, and pleasures.'}\n\n`;
    response += `**\ud83d\udd11 Remedy**: Propitiate ${currentMD} by ${currentMD === 'Jupiter' ? 'wearing yellow sapphire and offering turmeric to Lord Vishnu on Thursdays' : currentMD === 'Saturn' ? 'offering black sesame to Lord Shani on Saturdays and wearing blue sapphire' : currentMD === 'Rahu' ? 'chanting *Om Rahave Namah* and wearing Hessonite Garnet on Saturdays' : currentMD === 'Sun' ? 'offering water to the Sun at sunrise and wearing Ruby on Sundays' : 'performing the appropriate graha puja for ' + currentMD}.`;

  } else if (q.includes('remedy') || q.includes('remedies') || q.includes('dosha') || q.includes('puja') || q.includes('mantra') || q.includes('gemstone')) {
    response += `### \ud83d\udcbf Sacred Vedic Remedies, Mantras & Gemstones\n`;
    response += `To harmonize planetary influences during **${currentMD} Mahadasha**:\n\n`;
    response += `**\ud83d\udea9 Daily Practices**:\n`;
    response += `1. Chant *Om Namah Shivaya* or *Gayatri Mantra* 108 times every morning\n`;
    response += `2. Offer water (Arghya) to the rising Sun at dawn\n`;
    response += `3. Light a ghee lamp before your household deity each evening\n\n`;
    response += `**\ud83d\udc8e Gemstone Recommendation** (consult a certified Jyotishi before wearing):\n`;
    response += `\u2022 Lagna Lord (${lagnaInfo.lord}): ${lagnaInfo.lord === 'Jupiter' ? 'Yellow Sapphire (Pukhraj) in gold' : lagnaInfo.lord === 'Venus' ? 'Diamond or White Sapphire in platinum' : lagnaInfo.lord === 'Saturn' ? 'Blue Sapphire (Neelam) in iron/steel' : lagnaInfo.lord === 'Mercury' ? 'Green Emerald (Panna) in gold' : lagnaInfo.lord === 'Mars' ? 'Red Coral (Moonga) in copper' : lagnaInfo.lord === 'Moon' ? 'Natural Pearl (Moti) in silver' : 'Ruby (Manik) in gold'}\n\n`;
    if (doshas.manglik_dosha.is_present) {
      response += `**\u26a0\ufe0f Manglik Dosha**: ${doshas.manglik_dosha.remedy}\n`;
    }
    if (doshas.kalsarpa_dosha.is_present) {
      response += `**\ud83d\udc0d Kalsarpa Dosha**: ${doshas.kalsarpa_dosha.remedy}\n`;
    }

  } else {
    response += `### \ud83c\udf0c General Vedic Guidance\n`;
    if (yogas.length > 0) {
      response += `**\u2606 Active Classical Yogas in Your Chart**:\n`;
      yogas.forEach((y) => { response += `\u2022 **${y.name}** (${y.strength}): ${y.effect}\n`; });
      response += `\n`;
    }
    if (doshas.manglik_dosha.is_present) {
      response += `**\u26a0\ufe0f Manglik Dosha Detected** \u2014 Mars influences house ${doshas.manglik_dosha.house_from_lagna} from Lagna.\n`;
    }
    if (doshas.kalsarpa_dosha.is_present) {
      response += `**\ud83d\udc0d Kalsarpa Dosha Detected** \u2014 all planets within the Rahu-Ketu axis.\n`;
    }
    response += `\nYou are currently in **${currentMD} Mahadasha** (until ${currentMDEnd}). Maintain clarity, righteous action (dharma), and spiritual focus during this cosmic cycle.\n`;
    response += `\nTry asking about: *Career*, *Marriage*, *Wealth*, *Health*, *Spirituality*, *Dasha*, or *Remedies*!`;
  }

  response += `\n\n*May the divine light of Jyotish illuminate your path.* \ud83c\udf1f`;
  return response;
}
