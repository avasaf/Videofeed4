import { type ImmutableObject } from 'jimu-core'

export type IMConfig = ImmutableObject<{
  videoUrl: string
  useAdvancedStyles: boolean
  widgetBackgroundColor: string
  widgetBorderColor: string
}>