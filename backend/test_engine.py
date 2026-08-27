from astrology.engine import calculate_natal_chart, calculate_shodashavarga, check_doshas, calculate_transits

raw = calculate_natal_chart('1992-04-14', '07:30')
vargas = calculate_shodashavarga(raw)
doshas = check_doshas(raw)
transits = calculate_transits(raw)

print("--- PRECISION NATAL CHART ---")
for k, v in raw.items():
    print(f"{k}: {v:.2f}°")

print("\n--- SHODASHAVARGAS (D1, D9, D10) ---")
print("D1 Sun:", vargas['D1']['Sun'])
print("D9 Sun:", vargas['D9']['Sun'])
print("D10 Sun:", vargas['D10']['Sun'])

print("\n--- DOSHAS ---")
print("Manglik:", doshas['manglik_dosha'])
print("Kalsarpa:", doshas['kalsarpa_dosha'])

print("\n--- LIVE TRANSITS (GOCHAR) ---")
print("Jupiter Transit:", transits['Jupiter'])
