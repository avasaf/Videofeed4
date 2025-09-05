import { type ImmutableObject } from 'jimu-core'

export interface Feed {
  name: string
  url: string
}

export type IMConfig = ImmutableObject<{
  feeds: Feed[]
  useAdvancedStyles: boolean
  widgetBackgroundColor: string
  widgetBorderColor: string
}>