/** @jsx jsx */
import { React, jsx, type AllWidgetSettingProps, css, type ThemeVariables } from 'jimu-core'
import { TextInput, Button, Label, Icon, Switch, Collapse } from 'jimu-ui'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { ThemeColorPicker } from 'jimu-ui/basic/color-picker'
import { type IMConfig, type Feed } from '../config'
import defaultMessages from './translations/default'

// eslint-disable-next-line
const deleteIcon = require('jimu-ui/lib/icons/delete.svg')

interface SettingState {
  feeds: Feed[]
}

const getSettingStyles = (theme: ThemeVariables) => css`
  .settings-panel {
    padding: 20px;
    max-height: 500px;
    overflow-y: auto;
  }
  .setting-section-item {
    margin-bottom: 20px;
    padding: 15px;
    border: 0px solid ${theme.colors.border};
    background-color: ${theme.surfaces[1].bg};
    border-radius: ${theme.borderRadiuses.medium};
    position: relative;
  }
  .setting-section-item label {
    color: ${theme.body.color};
    font-weight: bold;
    margin-bottom: 6px;
    display: block;
  }
  .jimu-input {
    margin-bottom: 10px;
  }
  .feed-group .jimu-input {
    margin-bottom: 20px;
  }
  .delete-button {
    position: absolute;
    top: 5px;
    right: 5px;
    color: ${theme.colors.danger};
    &:hover {
      color: ${theme.colors.palette.danger[700]};
    }
  }
  .add-button-container {
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid ${theme.colors.border};
    text-align: center;
  }
  .advanced-switch-container {
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: center;
  }
  .style-setting {
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-bottom: 12px;
  }
  .style-setting label {
    margin-bottom: 4px;
    white-space: nowrap;
  }
  .style-setting .jimu-input {
    width: 100%;
  }
`

export default class Setting extends React.PureComponent<AllWidgetSettingProps<IMConfig>, SettingState> {
  constructor (props) {
    super(props)
    this.state = {
      feeds: props.config?.feeds || []
    }
  }

  onConfigChange = (key: string, value: any): void => {
    const newConfig = this.props.config.set(key, value)
    this.props.onSettingChange({
      id: this.props.id,
      config: newConfig
    })
  }

  onFeedNameChange = (index: number, evt: React.ChangeEvent<HTMLInputElement>): void => {
    const feeds = [...this.state.feeds]
    feeds[index] = { ...feeds[index], name: evt.target.value }
    this.setState({ feeds })
    this.onConfigChange('feeds', feeds)
  }

  onFeedUrlChange = (index: number, evt: React.ChangeEvent<HTMLInputElement>): void => {
    const feeds = [...this.state.feeds]
    feeds[index] = { ...feeds[index], url: evt.target.value }
    this.setState({ feeds })
    this.onConfigChange('feeds', feeds)
  }

  addFeed = (): void => {
    const feeds = [...this.state.feeds, { name: '', url: '' }]
    this.setState({ feeds })
    this.onConfigChange('feeds', feeds)
  }

  deleteFeed = (indexToDelete: number): void => {
    const feeds = this.state.feeds.filter((_, i) => i !== indexToDelete)
    this.setState({ feeds })
    this.onConfigChange('feeds', feeds)
  }

  render (): React.ReactElement {
    const { config, theme, intl } = this.props
    const { feeds } = this.state

    return (
      <div css={getSettingStyles(theme)} className='settings-panel'>
        <SettingSection>
          {feeds.map((feed, index) => (
            <div key={index} className='setting-section-item feed-group'>
              <Button icon size='sm' type='tertiary' className='delete-button' onClick={() => { this.deleteFeed(index) }} title={`Delete Feed ${index + 1}`}>
                <Icon icon={deleteIcon} size='14' />
              </Button>
              <div>
                <Label>{intl.formatMessage({ id: 'feedName', defaultMessage: 'Feed Name' })} {index + 1}</Label>
                <TextInput className='jimu-input' value={feed.name} onChange={(evt) => { this.onFeedNameChange(index, evt) }} placeholder={`Enter feed name ${index + 1}`}/>
              </div>
              <div>
                <Label>{intl.formatMessage({ id: 'feedUrl', defaultMessage: 'Feed URL' })} {index + 1}</Label>
                <TextInput className='jimu-input' value={feed.url} onChange={(evt) => { this.onFeedUrlChange(index, evt) }} placeholder={`Enter feed URL ${index + 1}`}/>
              </div>
            </div>
          ))}

          <div className='add-button-container'>
            <Button type='primary' onClick={this.addFeed}>
              {intl.formatMessage({ id: 'addFeed', defaultMessage: defaultMessages.addFeed || 'Add Feed' })}
            </Button>
          </div>
        </SettingSection>

        <SettingSection title={intl.formatMessage({ id: 'advanced', defaultMessage: 'Advanced' })}>
          <SettingRow>
            <div className='advanced-switch-container'>
              <Label>{intl.formatMessage({ id: 'advancedStyling', defaultMessage: 'Advanced Styling' })}</Label>
              <Switch checked={config.useAdvancedStyles} onChange={evt => { this.onConfigChange('useAdvancedStyles', evt.target.checked) }}/>
            </div>
          </SettingRow>
          <Collapse isOpen={config.useAdvancedStyles}>
            <SettingRow className='style-setting'>
              <Label>Background Color</Label>
              <ThemeColorPicker value={config.widgetBackgroundColor} onChange={color => { this.onConfigChange('widgetBackgroundColor', color) }}/>
            </SettingRow>
            <SettingRow className='style-setting'>
              <Label>Border Color</Label>
              <ThemeColorPicker value={config.widgetBorderColor} onChange={color => { this.onConfigChange('widgetBorderColor', color) }}/>
            </SettingRow>
            <SettingRow className='style-setting'>
              <Label>Dropdown Background</Label>
              <ThemeColorPicker value={config.dropdownBackgroundColor} onChange={color => { this.onConfigChange('dropdownBackgroundColor', color) }}/>
            </SettingRow>
            <SettingRow className='style-setting'>
              <Label>Dropdown Section Background</Label>
              <ThemeColorPicker value={config.dropdownSectionBackgroundColor} onChange={color => { this.onConfigChange('dropdownSectionBackgroundColor', color) }}/>
            </SettingRow>
            <SettingRow className='style-setting'>
              <Label>Dropdown Section Hover Background</Label>
              <ThemeColorPicker value={config.dropdownSectionHoverBackgroundColor} onChange={color => { this.onConfigChange('dropdownSectionHoverBackgroundColor', color) }}/>
            </SettingRow>
            <SettingRow className='style-setting'>
              <Label>Dropdown Border Radius</Label>
              <TextInput type='number' value={config.dropdownBorderRadius} onChange={e => { this.onConfigChange('dropdownBorderRadius', parseInt(e.target.value)) }}/>
            </SettingRow>
            <SettingRow className='style-setting'>
              <Label>Dropdown Text Color</Label>
              <ThemeColorPicker value={config.dropdownTextColor} onChange={color => { this.onConfigChange('dropdownTextColor', color) }}/>
            </SettingRow>
            <SettingRow className='style-setting'>
              <Label>Dropdown Section Text Color</Label>
              <ThemeColorPicker value={config.dropdownSectionTextColor} onChange={color => { this.onConfigChange('dropdownSectionTextColor', color) }}/>
            </SettingRow>
            <SettingRow className='style-setting'>
              <Label>Dropdown Section Hover Text Color</Label>
              <ThemeColorPicker value={config.dropdownSectionHoverTextColor} onChange={color => { this.onConfigChange('dropdownSectionHoverTextColor', color) }}/>
            </SettingRow>
            <SettingRow className='style-setting'>
              <Label>Dropdown Arrow Color</Label>
              <ThemeColorPicker value={config.dropdownArrowColor} onChange={color => { this.onConfigChange('dropdownArrowColor', color) }}/>
            </SettingRow>
            <SettingRow className='style-setting'>
              <Label>Expand Button Background</Label>
              <ThemeColorPicker value={config.expandButtonBackgroundColor} onChange={color => { this.onConfigChange('expandButtonBackgroundColor', color) }}/>
            </SettingRow>
            <SettingRow className='style-setting'>
              <Label>Expand Button Icon Color</Label>
              <ThemeColorPicker value={config.expandButtonIconColor} onChange={color => { this.onConfigChange('expandButtonIconColor', color) }}/>
            </SettingRow>
            <SettingRow className='style-setting'>
              <Label>Expand Button Border Radius</Label>
              <TextInput type='number' value={config.expandButtonBorderRadius} onChange={e => { this.onConfigChange('expandButtonBorderRadius', parseInt(e.target.value)) }}/>
            </SettingRow>
            <SettingRow className='style-setting'>
              <Label>Popup Gap</Label>
              <TextInput type='number' value={config.popupGap} onChange={e => { this.onConfigChange('popupGap', parseInt(e.target.value)) }}/>
            </SettingRow>
            <SettingRow className='style-setting'>
              <Label>Popup Padding</Label>
              <TextInput type='number' value={config.popupPadding} onChange={e => { this.onConfigChange('popupPadding', parseInt(e.target.value)) }}/>
            </SettingRow>
            <SettingRow className='style-setting'>
              <Label>Popup Item Padding</Label>
              <TextInput type='number' value={config.popupItemPadding} onChange={e => { this.onConfigChange('popupItemPadding', parseInt(e.target.value)) }}/>
            </SettingRow>
            <SettingRow className='style-setting'>
              <Label>Popup Background</Label>
              <ThemeColorPicker value={config.popupBackgroundColor} onChange={color => { this.onConfigChange('popupBackgroundColor', color) }}/>
            </SettingRow>
            <SettingRow className='style-setting'>
              <Label>Popup Border Radius</Label>
              <TextInput type='number' value={config.popupBorderRadius} onChange={e => { this.onConfigChange('popupBorderRadius', parseInt(e.target.value)) }}/>
            </SettingRow>
          </Collapse>
        </SettingSection>
      </div>
    )
  }
