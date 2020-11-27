import { onBeforeMount, onBeforeUnmount, reactive, readonly } from 'vue'
import { on, off } from 'evtd'

interface useKeyboardOptions {
  keyup?: UseKeyboardHandlers
  keydown?: UseKeyboardHandlers
}

type UseKeyboardHandlers = Record<string, useKeyboardHandler | UseKeyboardOptionHandler>

type useKeyboardHandler = (e: KeyboardEvent) => any

interface UseKeyboardOptionHandler {
  stop?: boolean
  prevent?: boolean
  handler: (e: KeyboardEvent) => any
}

interface UseKeyboardState {
  ctrl: boolean
  command: boolean
  win: boolean
  shift: boolean
  tab: boolean
}

export default function useKeyboard (options: useKeyboardOptions = {}): Readonly<UseKeyboardState> {
  const state = reactive<UseKeyboardState>({
    ctrl: false,
    command: false,
    win: false,
    shift: false,
    tab: false
  })
  const {
    keydown,
    keyup
  } = options
  const keydownHandler = (e: KeyboardEvent): void => {
    switch (e.key) {
      case 'Control':
        state.ctrl = true
        break
      case 'Meta':
        state.command = true
        state.win = true
        break
      case 'Shift':
        state.shift = true
        break
      case 'Tab':
        state.tab = true
        break
    }
    if (keydown !== undefined) {
      Object.keys(keydown).forEach(key => {
        if (key !== e.key) return
        const handler = keydown[key]
        if (typeof handler === 'function') {
          handler(e)
        } else {
          const { stop = false, prevent = false } = handler
          if (stop) e.stopPropagation()
          if (prevent) e.preventDefault()
          handler.handler(e)
        }
      })
    }
  }
  const keyupHandler = (e: KeyboardEvent): void => {
    switch (e.key) {
      case 'Control':
        state.ctrl = false
        break
      case 'Meta':
        state.command = false
        state.win = false
        break
      case 'Shift':
        state.shift = false
        break
      case 'Tab':
        state.tab = false
        break
    }
    if (keyup !== undefined) {
      Object.keys(keyup).forEach(key => {
        if (key !== e.key) return
        const handler = keyup[key]
        if (typeof handler === 'function') {
          handler(e)
        } else {
          const { stop = false, prevent = false } = handler
          if (stop) e.stopPropagation()
          if (prevent) e.preventDefault()
          handler.handler(e)
        }
      })
    }
  }
  onBeforeMount(() => {
    on('keydown', document, keydownHandler)
    on('keyup', document, keyupHandler)
  })
  onBeforeUnmount(() => {
    off('keydown', document, keydownHandler)
    off('keyup', document, keyupHandler)
  })
  return readonly(state)
}
