let timeoutAction: NodeJS.Timeout | number | undefined
let timeoutEnable: NodeJS.Timeout | number | undefined

/**
 * Prevents CSS transitions from being applied to the DOM elements
 * while executing the provided function.
 *
 * This is useful for cases such as switching themes.
 *
 * @param fn - The function to execute without transitions.
 */
export default function withoutTransition(fn: () => void) {
  clearTimeout(timeoutAction)
  clearTimeout(timeoutEnable)

  const style = document.createElement('style')
  const css = document.createTextNode(`* {
    -webkit-transition: none !important;
    -moz-transition: none !important;
    -o-transition: none !important;
    -ms-transition: none !important;
    transition: none !important;
  }`)
  style.appendChild(css)

  const disable = () => document.head.appendChild(style)
  const enable = () => document.head.removeChild(style)

  if (typeof window.getComputedStyle !== 'undefined') {
    disable()
    fn()
    // eslint-disable-next-line ts/no-unused-expressions -- force reflow
    window.getComputedStyle(style).opacity
    enable()
    return
  }

  if (typeof window.requestAnimationFrame !== 'undefined') {
    disable()
    fn()
    window.requestAnimationFrame(enable)
    return
  }

  disable()
  timeoutAction = setTimeout(() => {
    fn()
    timeoutEnable = setTimeout(enable, 120)
  }, 120)
}
