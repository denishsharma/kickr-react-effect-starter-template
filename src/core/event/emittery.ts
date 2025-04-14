import Emittery from 'emittery'

const emittery = new Emittery({
  debug: {
    enabled: false,
    name: 'global_emittery',
  },
})

export default emittery
