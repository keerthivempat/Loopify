export function debounce(func, wait) {
  let timeout;
  const debouncedFunction = function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
  debouncedFunction.cancel = function () {
    clearTimeout(timeout);
  };
  return debouncedFunction;
}
