const { PNG } = require('pngjs');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'assets', 'icons');

const iconSpecs = [
  { size: 72 },
  { size: 96 },
  { size: 128 },
  { size: 144 },
  { size: 152 },
  { size: 192 },
  { size: 384 },
  { size: 512 },
  { size: 180, name: 'apple-touch-icon' }
];

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const baseColors = [0x00, 0x88, 0xcc];

for (const spec of iconSpecs) {
  const size = spec.size;
  const fileName = spec.name ? `${spec.name}.png` : `icon-${size}x${size}.png`;
  const outputPath = path.join(OUTPUT_DIR, fileName);
  const png = new PNG({ width: size, height: size, colorType: 6 });

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;
      const mix = x / size;
      png.data[idx] = Math.round(baseColors[0] * (1 - mix) + 0x22 * mix);
      png.data[idx + 1] = Math.round(baseColors[1] * (1 - mix) + 0xaa * mix);
      png.data[idx + 2] = Math.round(baseColors[2] * (1 - mix) + 0xee * mix);
      png.data[idx + 3] = 0xff;
    }
  }

  png.pack().pipe(fs.createWriteStream(outputPath));
  console.log(`Generated ${fileName}`);
}
