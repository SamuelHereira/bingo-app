export const defaultColor = "#216449";

export function cardStyle(value = defaultColor) {
  const color = /^#[0-9a-f]{6}$/i.test(value) ? value : defaultColor;
  const rgb = [1, 3, 5].map((offset) =>
    parseInt(color.slice(offset, offset + 2), 16),
  );
  const linear = rgb.map((v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  const luminance =
    linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  return {
    color,
    headerText: luminance > 0.179 ? "#18251d" : "#ffffff",
    numberText: luminance > 0.179 ? "#18251d" : color,
    tint: `rgb(${rgb.map((v) => Math.round(v * 0.12 + 255 * 0.88)).join(", ")})`,
  };
}
