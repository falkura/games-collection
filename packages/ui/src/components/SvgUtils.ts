/**
 * [Icons](https://marella.github.io/material-design-icons/demo/font/)
 */

export function Base64ToSvg(dataString: string) {
  let result: string;

  switch (dataString[0]) {
    case "d":
      const base64 = dataString.split(",")[1];
      result = atob(base64);
      break;
    case "<":
      // Ok
      result = dataString;
      break;

    default:
      console.error("Unknown svg data.", dataString);
      break;
  }

  return result;
}

export function ColorizeSvg(svg: string, color: string) {
  // Replace existing fills
  if (/fill=".*?"/.test(svg)) {
    return svg.replace(/fill=".*?"/g, `fill="${color}"`);
  }

  // Otherwise add fill to all path-like elements
  return svg.replace(
    /<(path|circle|rect|polygon|ellipse|line|polyline)(\s|>)/g,
    `<$1 fill="${color}"$2`,
  );
}
