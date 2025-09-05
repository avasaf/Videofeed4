/** @jsx jsx */
import { React, jsx, type AllWidgetSettingProps, css, type ThemeVariables } from 'jimu-core'
import { TextInput, Label, Switch, Collapse } from 'jimu-ui'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { ThemeColorPicker } from 'jimu-ui/basic/color-picker'
import { type IMConfig } from '../runtime/config'
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

  onVideoUrlChange = (evt: React.ChangeEvent<HTMLInputElement>): void => {
    this.onConfigChange('videoUrl', evt.target.value)
  }

  render(): React.ReactElement {
    const { config, theme, intl } = this.props

    return (
      <div css={getSettingStyles(theme)} className="settings-panel">
        <SettingSection>
          <SettingRow>
            <Label>{intl.formatMessage({ id: 'videoUrl', defaultMessage: defaultMessages.videoUrl })}</Label>
          </SettingRow>
          <SettingRow>
            <TextInput
              className="jimu-input"
              value={config.videoUrl}
              onChange={this.onVideoUrlChange}
              placeholder="Enter video stream URL"
            />
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