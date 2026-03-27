export function isObject(item: any) {
  return item && typeof item === "object" && !Array.isArray(item);
}

declare global {
  namespace Layout {
    interface LayoutVars {
      /** Game X */
      gx: number;
      /** Game Y */
      gy: number;
      /** Game width */
      gw: number;
      /** Game height */
      gh: number;

      /** Screen width */
      sw: number;
      /** Screen height */
      sh: number;
      /** Bigger screen side, width or height */
      smax: number;

      /** Parent width */
      pw: number;
      /** Parent height */
      ph: number;

      /** Game scale */
      gs: number;
    }
  }
}

const DEBUG = false;
let history = [];

export function calculateLayoutString(
  vars: Layout.LayoutVars,
  value: number | string,
): number {
  if (typeof value === "number") return value;
  if (typeof value !== "string") {
    throw new Error("Invalid type " + typeof value + " " + value);
  }

  if (DEBUG) {
    history = [value];
  }

  // Remove spaces
  value = value.replace(new RegExp(/\s/g), "");

  if (DEBUG) {
    history.push(value);
  }

  // If value contains only numbers - return it;
  if (!isNaN(Number(value))) {
    return Number(value);
  }

  value = value
    // Replace relative variables with their values
    .replace(
      new RegExp(
        /\b(sw|sh|smax|gw|gx|gy|gh|gs|pw|ph)\b/g,
      ),
      (match) => {
        const res = vars[match];

        return Number.isFinite(res) ? res : match;
      },
    );

  if (DEBUG) {
    history.push(value);
  }

  let _valueBeforeSanitize = value;

  // Sanitize resulted string
  value = value.replace(new RegExp(/[^0-9+\-*/().\s]/g), "");

  if (DEBUG) {
    history.push(value);

    if (value !== _valueBeforeSanitize) {
      console.groupCollapsed("Incorrect layout vars!", history.at[0]);
      let i = 1;

      while (history.length) {
        console.log("Step " + i++ + ":", history.shift());
      }
      console.groupEnd();
    }
  }

  let result = 0;

  let _temp = Number(value);

  if (!isNaN(_temp)) {
    result = _temp;
  } else {
    try {
      result = new Function("return " + value)();
    } catch (error) {
      console.error("Invalid mathematical expression", error);
      console.log(value);
    }
  }

  return result;
}

export {};
