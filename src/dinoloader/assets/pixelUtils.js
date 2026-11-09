/**
 * Utility to convert 2D ASCII pixel grids into optimized, crisp SVG elements.
 * Generates run-length encoded horizontal pixel rectangles with crispEdges.
 */

export function gridToSvg(grid, options = {}) {
  const {
    className = '',
    viewBox = null,
    color = 'currentColor',
    extraAttrs = ''
  } = options;

  const height = grid.length;
  let maxWidth = 0;
  for (let i = 0; i < height; i++) {
    if (grid[i].length > maxWidth) maxWidth = grid[i].length;
  }

  const vb = viewBox || `0 0 ${maxWidth} ${height}`;
  let rects = '';

  for (let y = 0; y < height; y++) {
    const row = grid[y];
    let inRun = false;
    let startX = 0;

    for (let x = 0; x < row.length; x++) {
      if (row[x] === '#' && !inRun) {
        inRun = true;
        startX = x;
      } else if (row[x] !== '#' && inRun) {
        rects += `<rect x="${startX}" y="${y}" width="${x - startX}" height="1"/>`;
        inRun = false;
      }
    }
    if (inRun) {
      rects += `<rect x="${startX}" y="${y}" width="${row.length - startX}" height="1"/>`;
    }
  }

  const classAttr = className ? ` class="${className}"` : '';
  const extra = extraAttrs ? ` ${extraAttrs}` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" shape-rendering="crispEdges" fill="${color}"${classAttr}${extra}>${rects}</svg>`;
}

export function gridToGroup(grid, options = {}) {
  const { className = '', id = '' } = options;
  const height = grid.length;
  let rects = '';

  for (let y = 0; y < height; y++) {
    const row = grid[y];
    let inRun = false;
    let startX = 0;

    for (let x = 0; x < row.length; x++) {
      if (row[x] === '#' && !inRun) {
        inRun = true;
        startX = x;
      } else if (row[x] !== '#' && inRun) {
        rects += `<rect x="${startX}" y="${y}" width="${x - startX}" height="1"/>`;
        inRun = false;
      }
    }
    if (inRun) {
      rects += `<rect x="${startX}" y="${y}" width="${row.length - startX}" height="1"/>`;
    }
  }

  const classAttr = className ? ` class="${className}"` : '';
  const idAttr = id ? ` id="${id}"` : '';
  return `<g${idAttr}${classAttr}>${rects}</g>`;
}
