import { type ImmutableObject } from 'jimu-core'

export interface Feed {
  name: string
  url: string
}

export type IMConfig = ImmutableObject<{
  feeds: Feed[]
  /** Query string appended to all video and fragment requests */
  authQueryString: string
  useAdvancedStyles: boolean
  widgetBackgroundColor: string
  widgetBorderColor: string
  dropdownBackgroundColor: string
  dropdownSectionBackgroundColor: string
  dropdownBorderRadius: number
  dropdownSectionBorderRadius: number
  dropdownTextColor: string
  dropdownSectionTextColor: string
  dropdownSectionHoverTextColor: string
  dropdownArrowColor: string
  expandButtonBackgroundColor: string
  expandButtonIconColor: string
  expandButtonBorderRadius: number
  popupGap: number
  popupPadding: number
  popupItemPadding: number
  popupBackgroundColor: string
  popupBorderRadius: number
}>