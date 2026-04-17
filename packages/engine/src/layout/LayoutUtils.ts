import { LayoutVars } from "./LayoutHandlers";

export function isObject(item: any) {
  return item && typeof item === "object" && !Array.isArray(item);
}

export function calculateLayoutString(
  vars: LayoutVars,
  value: number | string,
): number {
  if (typeof value === "number") return value;
  if (typeof value !== "string") {
    throw new Error("Invalid type " + value + " -> " + typeof value);
  }

  let _valueBefore = value;

  // Remove spaces
  value = value.replace(new RegExp(/\s/g), "");

  // If value contains only numbers - return it;
  if (!isNaN(Number(value))) {
    return Number(value);
  }

  value = value
    // Replace relative variables with their values
    .replace(new RegExp(/\b(sw|sh|smax|smin|gw|gx|gy|gh)\b/g), (match) => {
      const res = vars[match];

      return Number.isFinite(res) ? res : match;
    });

  // Sanitize resulted string
  value = value.replace(new RegExp(/[^0-9+\-*/().\s]/g), "");

  let result = 0;

  let _temp = Number(value);

  if (!isNaN(_temp)) {
    result = _temp;
  } else {
    try {
      result = new Function("return " + value)();
    } catch (error) {
      console.error("Invalid mathematical expression", error);
      console.log(_valueBefore);
    }
  }

  return result;
}
