export function debounce(fn: (...args: any[]) => any, wait: number) {
  let timer: any = null
  return function (...args: any[]) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn(...args)
    }, wait)
  }
}