import { Static, Type } from '@sinclair/typebox'

export const InboundChat = Type.Object({
  user: Type.String(),
  message: Type.String(),
  room: Type.String()
})

export const OutboundChat = Type.Object({
  user: Type.String(),
  message: Type.String(),
  timestamp: Type.Date(),
  room: Type.String()
})

export const ChatsRequest = Type.Object({
  room: Type.String()
});

export type InboundChatType = Static<typeof InboundChat>
export type OutboundChatType = Static<typeof OutboundChat>
export type ChatsRequestType = Static<typeof ChatsRequest>