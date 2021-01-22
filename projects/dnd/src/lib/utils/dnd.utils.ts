/**
 * Check and return true if an object is type of string
 */
export function isString(obj: any): boolean {
  return typeof obj === 'string';
}

/**
 * Check and return true if an object not undefined or null
 */
export function isPresent(obj: any): boolean {
  return obj !== undefined && obj !== null;
}

/**
 * Check and return true if an object is type of Function
 */
export function isFunction(obj: any): boolean {
  return typeof obj === 'function';
}

/**
 * Create Image element with specified url string
 */
export function createImage(src: string): HTMLImageElement {
  const img: HTMLImageElement = new HTMLImageElement();
  img.src = src;
  return img;
}

/**
 * Call the function
 */
export function callFun(fun: (() => void)): any {
  return fun();
}
