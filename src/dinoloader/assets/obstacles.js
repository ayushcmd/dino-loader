import { gridToSvg } from './pixelUtils.js';

/**
 * Pixel-art cactus variants with crisp integer grids.
 * Every variant has its solid base at the final row so it sits flush on the ground.
 */

export const CACTUS_SINGLE = [
  '....##......',
  '....##......',
  '.##.##......',
  '.##.##......',
  '.##.##..##..',
  '.#####..##..',
  '..#.##.###..',
  '....######..',
  '....##.##...',
  '....#####...',
  '....##......',
  '....##......',
  '....##......',
  '....##......',
  '....##......',
  '....##......',
  '....##......',
  '....##......'
];

export const CACTUS_DOUBLE = [
  '....##............',
  '....##.......##...',
  '.##.##.......##...',
  '.##.##....##.##...',
  '.#####....#####...',
  '..#.##....#.###...',
  '..####....#####...',
  '...##......#.##...',
  '...##......####...',
  '...##.......##....',
  '...##.......##....',
  '...##.......##....',
  '...##.......##....',
  '...##.......##....'
];

export const CACTUS_TRIPLE = [
  '..##..........##..',
  '.####...##...####.',
  '.####..####..####.',
  '..##...####...##..',
  '..##....##....##..',
  '..##....##....##..',
  '..##....##....##..',
  '..##....##....##..'
];

/**
 * Pixel-art clouds (upper sky background)
 */
export const CLOUD_1 = [
  '........######..........',
  '.....#############......',
  '....###############.....',
  '...#################....',
  '..###################...',
  '########################',
  '########################'
];

export const CLOUD_2 = [
  '....####......####..',
  '..########..########',
  '.###################',
  '####################',
  '####################'
];

/**
 * Subtle irregular ground texture specks beneath the baseline.
 * 240px wide pattern designed to loop seamlessly every 240px.
 * Features only tiny 1-2px pebbles and sand marks, eliminating hanging-wire appearance.
 */
export function createGroundTextureGrid() {
  const width = 240;
  const height = 8;
  const grid = Array.from({ length: height }, () => Array(width).fill('.'));

  // Irregular subtle pebbles and dirt specks
  const specks = [
    // row 0: small 1px touches right below the continuous ground line
    [0, 14, 1], [0, 42, 2], [0, 88, 1], [0, 134, 2], [0, 182, 1], [0, 220, 2],
    // row 1: small pebble dashes
    [1, 15, 2], [1, 60, 2], [1, 102, 2], [1, 146, 1], [1, 190, 2], [1, 232, 2],
    // row 2: tiny dirt grains
    [2, 30, 1], [2, 75, 1], [2, 118, 2], [2, 165, 1], [2, 208, 1],
    // row 3: subtle gravel dots
    [3, 48, 2], [3, 92, 1], [3, 138, 1], [3, 184, 2],
    // row 4: occasional speck
    [4, 64, 1], [4, 155, 1], [4, 216, 1]
  ];

  specks.forEach(([y, x, len]) => {
    for (let i = 0; i < len; i++) {
      if (x + i < width) grid[y][x + i] = '#';
    }
  });

  return grid.map(r => r.join(''));
}

export const GROUND_TEXTURE_GRID = createGroundTextureGrid();

export function createCactusSvg(type = 'single') {
  if (type === 'double') {
    return gridToSvg(CACTUS_DOUBLE, {
      className: 'dl-cactus-svg',
      viewBox: '0 0 18 14'
    });
  }
  if (type === 'triple') {
    return gridToSvg(CACTUS_TRIPLE, {
      className: 'dl-cactus-svg',
      viewBox: '0 0 18 8'
    });
  }
  return gridToSvg(CACTUS_SINGLE, {
    className: 'dl-cactus-svg',
    viewBox: '0 0 12 18'
  });
}

export function createCloudSvg(type = 1) {
  if (type === 2) {
    return gridToSvg(CLOUD_2, {
      className: 'dl-cloud-svg',
      viewBox: '0 0 20 5'
    });
  }
  return gridToSvg(CLOUD_1, {
    className: 'dl-cloud-svg',
    viewBox: '0 0 24 7'
  });
}

export function createGroundTextureSvg() {
  return gridToSvg(GROUND_TEXTURE_GRID, {
    className: 'dl-ground-texture-svg',
    viewBox: '0 0 240 8'
  });
}
