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
            <SettingRow key={i} className="feed-row" flow="wrap">
              <TextInput
                style={{ width: '30%', marginRight: '4px' }}
                value={feed.name}
                onChange={e => this.onFeedChange(i, 'name', e.target.value)}
                placeholder="Name"
              />
              <TextInput
                style={{ flex: 1, marginRight: '4px' }}
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
          </Collapse>
        </SettingSection>
      </div>
    )
  }
}