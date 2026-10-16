/* Elodea in water: how fast it makes oxygen (bubbles per minute).
   Rate = Pmax(T) · min(light term, CO₂ term), the classic limiting-factor picture (Blackman). */

export type LightColor = 'white' | 'red' | 'blue' | 'green';

/** how well chlorophyll uses this light: it absorbs red and blue, reflects green */
export const COLOR_USE: Record<LightColor, number> = { white: 1, red: 0.9, blue: 0.8, green: 0.2 };
export const COLOR_HEX: Record<LightColor, string> = { white: '#FFF6D6', red: '#FF5A4E', blue: '#4F7BFF', green: '#3DD68C' };

export interface Conditions {
  /** lamp distance, cm */
  d: number;
  color: LightColor;
  /** NaHCO₃ added, % */
  co2: number;
  /** water temperature, °C */
  t: number;
}

export const MAX_BUBBLES = 60;

/** illuminance relative to the lamp at 10 cm: inverse-square law */
export const illuminance = (d: number) => Math.min(1, (10 / d) ** 2);

export function factors(c: Conditions) {
  const le = illuminance(c.d) * COLOR_USE[c.color];
  const light = Math.min(1, (1.2 * le) / (le + 0.2));
  const co2 = Math.min(1, (1.25 * (c.co2 + 0.04)) / (c.co2 + 0.04 + 0.3));
  // enzymes: about twice as fast per 10 °C up to the optimum (25–32 °C), then they denature
  const temp = c.t <= 25 ? Math.exp((c.t - 25) / 14.4) : c.t <= 32 ? 1 : Math.max(0, 1 - ((c.t - 32) / 13) ** 2);
  return { light, co2, temp };
}

export function rate(c: Conditions) {
  const f = factors(c);
  return f.temp * Math.min(f.light, f.co2);
}

/** the factor holding the rate back right now */
export function limiting(c: Conditions): 'light' | 'co2' | 'temp' | null {
  const f = factors(c);
  const lim = Math.min(f.light, f.co2);
  if (f.temp < 0.75 && f.temp * 1.0 < lim) return 'temp';
  if (lim > 0.95 && f.temp > 0.9) return null;
  return f.light < f.co2 ? 'light' : 'co2';
}
