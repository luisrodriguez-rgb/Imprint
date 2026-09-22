import { z } from 'zod';

export const EquivalenceTypeSchema = z.enum([
  'smartphone_battery_pct', // e.g. "4–6% of a smartphone battery" (12–15 Wh)
  'led_bulb_minutes',       // e.g. "30–45 minutes of a 9W LED bulb"
  'espresso_shots',         // e.g. "≈ 0.15 of a 30 mL espresso cup"
  'ev_distance_meters',     // e.g. "≈ 25–40 meters in an EV (150 Wh/km)"
  'ice_cube_volume',        // e.g. "≈ 1/3 of a 25 mL standard ice cube"
]);

export type EquivalenceType = z.infer<typeof EquivalenceTypeSchema>;

export const PhysicalEquivalenceSchema = z.object({
  id: EquivalenceTypeSchema,
  metric: z.enum(['energy', 'water', 'carbon']),
  displayValue: z.string(),           // e.g. "≈ 4–6%"
  displayText: z.string(),            // e.g. "≈ 4–6% of a typical smartphone battery"
  baselineAssumption: z.string(),     // e.g. "Assumes typical 12–15 Wh modern smartphone battery capacity"
  icon: z.string().optional(),        // e.g. "Smartphone", "Droplets", "Car", "Lightbulb"
});

export type PhysicalEquivalence = z.infer<typeof PhysicalEquivalenceSchema>;
