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
  dropdownBackgroundColor: string
  dropdownSectionBackgroundColor: string
  dropdownSectionHoverBackgroundColor: string
  dropdownBorderRadius: number
  dropdownTextColor: string
  dropdownSectionTextColor: string
  dropdownSectionHoverTextColor: string
  dropdownSectionHoverBorderRadius: number
  dropdownArrowColor: string
  expandButtonBackgroundColor: string
  expandButtonIconColor: string
  expandButtonBorderRadius: number
  popupGap: number
  popupPadding: number
  popupItemPadding: number
  popupBackgroundColor: string
  popupBorderRadius: number
  markerBackgroundColor: string
  markerTextColor: string
  markerBorderRadius: number
}>
