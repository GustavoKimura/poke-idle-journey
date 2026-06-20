const SUFFIXES = [
  "",
  "k",
  "M",
  "B",
  "T",
  "Qa",
  "Qi",
  "Sx",
  "Sp",
  "Oc",
  "No",
  "Dc",
  "Ud",
  "Dd",
  "Td",
  "Qad",
  "Qid",
  "Sxd",
  "Spd",
  "Ocd",
  "Nod",
  "Vg",
  "Uvg",
  "Dvg",
  "Tvg",
  "Qavg",
  "Qivg",
  "Sxvg",
  "Spvg",
  "Ocvg",
  "Novg",
  "Tg",
];

export function formatNumber(value: number): string {
  if (typeof value !== "number" || isNaN(value)) return "0";
  if (value < 1000) return Math.floor(value).toString();
  const tier = Math.floor(Math.log10(value) / 3);
  if (tier === 0) return Math.floor(value).toString();
  const suffix = SUFFIXES[Math.min(tier, SUFFIXES.length - 1)];
  const scale = Math.pow(10, tier * 3);
  const scaled = value / scale;
  return scaled.toFixed(2) + suffix;
}
