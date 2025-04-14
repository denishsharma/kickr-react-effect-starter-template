import { Schema } from 'effect'
import { EmitteryEvent } from '~/core/event/factories/emittery_event'

export class BroadcastCountEvent extends EmitteryEvent('welcome/broadcast_count')({
  schema: Schema.Struct({
    id: Schema.Literal('counter_one', 'counter_two'),
    count: Schema.Number,
  }),
}) {}

const broadcastCountEvent = new BroadcastCountEvent()
export default broadcastCountEvent
