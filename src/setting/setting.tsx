/** @jsx jsx */
import { React, jsx, type AllWidgetSettingProps, css, type ThemeVariables, Immutable } from 'jimu-core'
import { TextInput, Label, Switch, Collapse, Button } from 'jimu-ui'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { ThemeColorPicker } from 'jimu-ui/basic/color-picker'
import { type IMConfig } from '../config'
import defaultMessages from './translations/default'

const getSettingStyles = (theme: ThemeVariables) => {
  return css`
    .settings-panel {
      padding: 20px;
    }
    .advanced-switch-container {
      display: flex;
      justify-content: space-between;
      width: 100%;
      align-items: center;
    }
  `
}

export default class Setting extends React.PureComponent<AllWidgetSettingProps<IMConfig>, unknown> {
  onConfigChange = (key: string, value: any): void => {
    const newConfig = this.props.config.set(key, value)
    this.props.onSettingChange({
      id: this.props.id,
      config: newConfig
    })
  }

  onFeedChange = (index: number, field: 'name' | 'url', value: string): void => {
    const feeds = (this.props.config.feeds?.asMutable({ deep: true }) || []) as any[]
    feeds[index][field] = value
    this.onConfigChange('feeds', Immutable(feeds))
  }

  addFeed = (): void => {
    const feeds = (this.props.config.feeds?.asMutable({ deep: true }) || []) as any[]
    feeds.push({ name: '', url: '' })
    this.onConfigChange('feeds', Immutable(feeds))
  }

  removeFeed = (index: number): void => {
    const feeds = (this.props.config.feeds?.asMutable({ deep: true }) || []) as any[]
    feeds.splice(index, 1)
    this.onConfigChange('feeds', Immutable(feeds))
  }

  render(): React.ReactElement {
    const { config, theme, intl } = this.props

    return (
      <div css={getSettingStyles(theme)} className="settings-panel">
        <SettingSection>
          <SettingRow>
            <Label>{intl.formatMessage({ id: 'videoUrl', defaultMessage: defaultMessages.videoUrl })}</Label>
          </SettingRow>
          {config.feeds?.map((feed, i) => (
            <SettingRow key={i} className="feed-row" flow="wrap" style={{ marginBottom: '8px' }}>
              <TextInput
                style={{ width: '30%', marginRight: '8px' }}
                value={feed.name}
                onChange={e => this.onFeedChange(i, 'name', e.target.value)}
                placeholder="Name"
              />
              <TextInput
                style={{ flex: 1, marginRight: '8px' }}
                value={feed.url}
                onChange={e => this.onFeedChange(i, 'url', e.target.value)}
                placeholder="URL"
              />
              <Button size="sm" onClick={() => this.removeFeed(i)}>Remove</Button>
            </SettingRow>
          ))}
          <SettingRow>
            <Button size="sm" onClick={this.addFeed}>Add Feed</Button>
          </SettingRow>
        </SettingSection>

        <SettingSection title={intl.formatMessage({ id: 'advanced', defaultMessage: 'Advanced' })}>
          <SettingRow>
            <div className="advanced-switch-container">
              <Label>{intl.formatMessage({ id: 'advancedStyling', defaultMessage: 'Advanced Styling' })}</Label>
              <Switch checked={config.useAdvancedStyles} onChange={evt => { this.onConfigChange('useAdvancedStyles', evt.target.checked) }} />
            </div>
          </SettingRow>
          <Collapse isOpen={config.useAdvancedStyles}>
            <SettingRow label="Background Color">
              <ThemeColorPicker value={config.widgetBackgroundColor} onChange={color => { this.onConfigChange('widgetBackgroundColor', color) }} />
            </SettingRow>
            <SettingRow label="Border Color">
              <ThemeColorPicker value={config.widgetBorderColor} onChange={color => { this.onConfigChange('widgetBorderColor', color) }} />
            </SettingRow>

            <SettingRow label="Dropdown Background">
              <ThemeColorPicker value={config.dropdownBackgroundColor} onChange={color => { this.onConfigChange('dropdownBackgroundColor', color) }} />
            </SettingRow>
            <SettingRow label="Dropdown Section Background">
              <ThemeColorPicker value={config.dropdownSectionBackgroundColor} onChange={color => { this.onConfigChange('dropdownSectionBackgroundColor', color) }} />
            </SettingRow>
            <SettingRow label="Dropdown Border Radius">
              <TextInput type="number" value={config.dropdownBorderRadius} onChange={e => { this.onConfigChange('dropdownBorderRadius', parseInt(e.target.value)) }} />
            </SettingRow>
            <SettingRow label="Dropdown Section Border Radius">
              <TextInput type="number" value={config.dropdownSectionBorderRadius} onChange={e => { this.onConfigChange('dropdownSectionBorderRadius', parseInt(e.target.value)) }} />
            </SettingRow>
            <SettingRow label="Dropdown Text Color">
              <ThemeColorPicker value={config.dropdownTextColor} onChange={color => { this.onConfigChange('dropdownTextColor', color) }} />
            </SettingRow>
            <SettingRow label="Dropdown Section Text Color">
              <ThemeColorPicker value={config.dropdownSectionTextColor} onChange={color => { this.onConfigChange('dropdownSectionTextColor', color) }} />
            </SettingRow>
            <SettingRow label="Dropdown Section Hover Text Color">
              <ThemeColorPicker value={config.dropdownSectionHoverTextColor} onChange={color => { this.onConfigChange('dropdownSectionHoverTextColor', color) }} />
            </SettingRow>
            <SettingRow label="Dropdown Arrow Color">
              <ThemeColorPicker value={config.dropdownArrowColor} onChange={color => { this.onConfigChange('dropdownArrowColor', color) }} />
            </SettingRow>

            <SettingRow label="Expand Button Background">
              <ThemeColorPicker value={config.expandButtonBackgroundColor} onChange={color => { this.onConfigChange('expandButtonBackgroundColor', color) }} />
            </SettingRow>
            <SettingRow label="Expand Button Icon Color">
              <ThemeColorPicker value={config.expandButtonIconColor} onChange={color => { this.onConfigChange('expandButtonIconColor', color) }} />
            </SettingRow>
            <SettingRow label="Expand Button Border Radius">
              <TextInput type="number" value={config.expandButtonBorderRadius} onChange={e => { this.onConfigChange('expandButtonBorderRadius', parseInt(e.target.value)) }} />
            </SettingRow>

            <SettingRow label="Popup Gap">
              <TextInput type="number" value={config.popupGap} onChange={e => { this.onConfigChange('popupGap', parseInt(e.target.value)) }} />
            </SettingRow>
            <SettingRow label="Popup Padding">
              <TextInput type="number" value={config.popupPadding} onChange={e => { this.onConfigChange('popupPadding', parseInt(e.target.value)) }} />
            </SettingRow>
            <SettingRow label="Popup Item Padding">
              <TextInput type="number" value={config.popupItemPadding} onChange={e => { this.onConfigChange('popupItemPadding', parseInt(e.target.value)) }} />
            </SettingRow>
            <SettingRow label="Popup Background">
              <ThemeColorPicker value={config.popupBackgroundColor} onChange={color => { this.onConfigChange('popupBackgroundColor', color) }} />
            </SettingRow>
            <SettingRow label="Popup Border Radius">
              <TextInput type="number" value={config.popupBorderRadius} onChange={e => { this.onConfigChange('popupBorderRadius', parseInt(e.target.value)) }} />
            </SettingRow>
          </Collapse>
        </SettingSection>
      </div>
    )
  }
}