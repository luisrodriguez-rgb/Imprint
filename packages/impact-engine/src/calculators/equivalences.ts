import { PhysicalEquivalence } from '@imprint/schemas';

export interface EquivalenceInput {
  energyWh: number;
  waterConsumptionMl: number;
  carbonG: number;
}

export function generatePhysicalEquivalences(
  input: EquivalenceInput
): PhysicalEquivalence[] {
  const { energyWh, waterConsumptionMl, carbonG } = input;
  const equivalences: PhysicalEquivalence[] = [];

  // 1. Smartphone battery: 12 - 15 Wh modern smartphone battery
  const phonePctLow = Math.round((energyWh / 15) * 100);
  const phonePctHigh = Math.round((energyWh / 12) * 100);
  equivalences.push({
    id: 'smartphone_battery_pct',
    metric: 'energy',
    displayValue: `${Math.max(1, phonePctLow)}–${Math.max(1, phonePctHigh)}%`,
    displayText: `≈ ${Math.max(1, phonePctLow)}–${Math.max(1, phonePctHigh)}% of a typical smartphone battery`,
    baselineAssumption: 'Assumes a modern 12–15 Wh (approx. 3,200–4,000 mAh at 3.8V) smartphone battery capacity.',
    icon: 'Smartphone',
  });

  // 2. 9W LED Light Bulb: 9 Wh per hour = 0.15 Wh per minute
  const ledMinutesLow = Math.round(energyWh / (9 / 60) * 0.85);
  const ledMinutesHigh = Math.round(energyWh / (9 / 60) * 1.15);
  equivalences.push({
    id: 'led_bulb_minutes',
    metric: 'energy',
    displayValue: `${Math.max(1, ledMinutesLow)}–${Math.max(1, ledMinutesHigh)} min`,
    displayText: `≈ ${Math.max(1, ledMinutesLow)}–${Math.max(1, ledMinutesHigh)} minutes powering a 9W LED bulb`,
    baselineAssumption: 'Assumes a standard household 800-lumen (9W) LED lightbulb.',
    icon: 'Lightbulb',
  });

  // 3. Espresso Shot (30 mL)
  const espressoPctLow = Math.round((waterConsumptionMl / 35) * 100);
  const espressoPctHigh = Math.round((waterConsumptionMl / 25) * 100);
  equivalences.push({
    id: 'espresso_shots',
    metric: 'water',
    displayValue: `${Math.max(1, espressoPctLow)}–${Math.max(1, espressoPctHigh)}%`,
    displayText: `≈ ${Math.max(1, espressoPctLow)}–${Math.max(1, espressoPctHigh)}% of a 30 mL espresso cup`,
    baselineAssumption: 'Assumes standard 30 mL single espresso liquid volume.',
    icon: 'Coffee',
  });

  // 4. Standard ice cube (approx 25 mL frozen water)
  const iceCubePctLow = Math.round((waterConsumptionMl / 30) * 100);
  const iceCubePctHigh = Math.round((waterConsumptionMl / 20) * 100);
  equivalences.push({
    id: 'ice_cube_volume',
    metric: 'water',
    displayValue: `${Math.max(1, iceCubePctLow)}–${Math.max(1, iceCubePctHigh)}%`,
    displayText: `≈ ${Math.max(1, iceCubePctLow)}–${Math.max(1, iceCubePctHigh)}% of a standard 25 mL ice cube`,
    baselineAssumption: 'Assumes standard household tray ice cube volume of 25 mL.',
    icon: 'Droplets',
  });

  // 5. Electric Vehicle drive distance: ~150 Wh/km = 0.15 Wh/meter
  const evMetersLow = Math.round((energyWh / 0.18));
  const evMetersHigh = Math.round((energyWh / 0.13));
  equivalences.push({
    id: 'ev_distance_meters',
    metric: 'energy',
    displayValue: `${Math.max(1, evMetersLow)}–${Math.max(1, evMetersHigh)} m`,
    displayText: `≈ ${Math.max(1, evMetersLow)}–${Math.max(1, evMetersHigh)} meters driven in an electric car`,
    baselineAssumption: 'Assumes efficient electric passenger car consuming 130–180 Wh per kilometer.',
    icon: 'Car',
  });

  return equivalences;
}
