import { type ImmutableObject } from 'jimu-core'

// Interface for a single link item in the dropdown
export interface ReportLink {
    name: string
    url: string
}

// The overall configuration structure for the widget
export type IMConfig = ImmutableObject<{
    label: string
    reports: ReportLink[]
    useAdvancedStyles: boolean
    widgetBackgroundColor: string
    widgetBorderColor: string
    widgetTextColor: string
    dropdownArrowColor: string
    itemHoverBackgroundColor: string
    dropdownMenuBackgroundColor: string
    dropdownMenuTextColor: string
}>