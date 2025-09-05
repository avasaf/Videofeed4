/** @jsx jsx */
import { React, AllWidgetProps, jsx, css, type IMThemeVariables, type SerializedStyles } from 'jimu-core'
import { Button, Collapse, Icon } from 'jimu-ui'
import dropdownIconSvg from '../../icon.svg'
import { type IMConfig } from '../config'
import Hls from './lib/hls.min.js'

interface State {
  current: number
  expanded: boolean
  menuOpen: boolean
}

export default class Widget extends React.PureComponent<AllWidgetProps<IMConfig>, State> {
  private readonly videoRef: React.RefObject<HTMLVideoElement>
  private hls: Hls | null
  private gridVideos: HTMLVideoElement[] = []
  private gridHls: Hls[] = []

  constructor (props) {
    super(props)
    this.state = { current: 0, expanded: false, menuOpen: false }
    this.videoRef = React.createRef()
    this.hls = null
  }

  componentDidMount (): void {
    this.setupPlayer()
  }

  componentDidUpdate (prevProps: AllWidgetProps<IMConfig>, prevState: State): void {
    if (!this.state.expanded && (prevProps.config.feeds !== this.props.config.feeds || prevState.current !== this.state.current)) {
      this.setupPlayer()
    }

    if (prevState.expanded !== this.state.expanded) {
      if (this.state.expanded) {
        setTimeout(() => this.setupGridPlayers(), 0)
      } else {
        this.cleanupGrid()
        this.setupPlayer()
      }
    }

    if (this.state.expanded && prevProps.config.feeds !== this.props.config.feeds) {
      setTimeout(() => this.setupGridPlayers(), 0)
    }
  }

  componentWillUnmount (): void {
    this.cleanupPlayer()
    this.cleanupGrid()
  }

  private cleanupPlayer (): void {
    if (this.hls) {
      this.hls.destroy()
      this.hls = null
    }
  }

  private setupPlayer (): void {
    this.cleanupPlayer()
    const feed = this.props.config.feeds?.[this.state.current]
    const videoElement = this.videoRef.current
    if (!feed || !videoElement) return
    this.initializeHls(feed.url, videoElement, false)
  }

  private setupGridPlayers (): void {
    this.cleanupGrid()
    const feeds = this.props.config.feeds || []
    feeds.forEach((feed, i) => {
      const el = this.gridVideos[i]
      if (el) this.initializeHls(feed.url, el, true)
    })
  }

  private cleanupGrid (): void {
    this.gridHls.forEach(h => h && h.destroy())
    this.gridHls = []
    this.gridVideos = []
  }

  private initializeHls (url: string, videoElement: HTMLVideoElement, store: boolean): void {
    if (!url || !videoElement) return

    if (url.includes('.m3u8') && Hls.isSupported()) {
      const hls = new Hls()
      hls.loadSource(url)
      hls.attachMedia(videoElement)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoElement.play().catch(() => { console.warn('Browser prevented autoplay.') })
      })
      if (store) {
        this.gridHls.push(hls)
      } else {
        this.hls = hls
      }
    } else {
      videoElement.src = url
      videoElement.load()
      videoElement.play().catch(() => { console.warn('Browser prevented autoplay.') })
    }
  }

  private toggleExpand = (): void => {
    this.setState({ expanded: !this.state.expanded })
  }

  private toggleMenu = (): void => {
    this.setState({ menuOpen: !this.state.menuOpen })
  }

  private selectFeed = (index: number): void => {
    this.setState({ current: index, menuOpen: false })
  }

  getStyle (theme: IMThemeVariables): SerializedStyles {
    const { config } = this.props

    const baseStyle = css`
      width: 100%;
      height: 100%;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      background-color: #000;
    `

    if (!config.useAdvancedStyles) {
      return css`
        ${baseStyle};
        border: 1px solid ${theme.colors.border};
        .main-button-wrapper {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          height: 32px;
          padding: 0 8px 0 12px;
          cursor: pointer;
          border-radius: 2px;
          background-color: ${theme.surfaces[1].bg};
          border: 1px solid ${theme.colors.border};
          color: ${theme.body.color};
        }
        .main-button-wrapper .jimu-icon {
          color: ${theme.body.color};
          fill: ${theme.body.color};
        }
        .dropdown-menu-container {
          background-color: ${theme.surfaces[1].bg};
          margin-top: 2px;
          border: 1px solid ${theme.colors.border};
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          border-radius: 2px;
          padding: 4px 0;
        }
        .dropdown-item-button.jimu-btn {
          width: 100%;
          justify-content: flex-start;
          text-align: left;
          background-color: transparent;
          border: none;
          border-radius: 0;
          &:hover {
            background-color: ${theme.colors.palette.light[400]};
          }
        }
      `
    }

    return css`
      ${baseStyle};
      border: 1px solid ${config.widgetBorderColor};
      background-color: ${config.widgetBackgroundColor};
      .main-button-wrapper {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        height: 32px;
        padding: 0 8px 0 12px;
        cursor: pointer;
        background-color: ${config.dropdownBackgroundColor};
        border: 1px solid ${config.widgetBorderColor};
        color: ${config.dropdownTextColor};
        border-radius: ${config.dropdownBorderRadius}px;
      }
      .main-button-wrapper .button-text-label {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .main-button-wrapper .button-icon {
        flex-shrink: 0;
        color: ${config.dropdownArrowColor};
        fill: ${config.dropdownArrowColor};
      }
      .dropdown-menu-container {
        background-color: ${config.dropdownSectionBackgroundColor};
        margin-top: 2px;
        border: 1px solid ${config.widgetBorderColor};
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        border-radius: ${config.dropdownBorderRadius}px;
        padding: 4px 0;
      }
      .dropdown-item-button.jimu-btn {
        width: 100%;
        justify-content: flex-start;
        text-align: left;
        color: ${config.dropdownSectionTextColor};
        background-color: transparent;
        border: none;
        &:hover {
          background-color: ${config.dropdownSectionHoverBackgroundColor};
          color: ${config.dropdownSectionHoverTextColor};
        }
      }
    `
  }

  render (): React.ReactElement {
    const { config, theme } = this.props
    const { feeds = [] } = config
    const { current, expanded, menuOpen } = this.state

    return (
      <div className='video-feed-widget' css={this.getStyle(theme)}>
        {!expanded && (
          <>
            {feeds.length > 1 && (
              <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 2, width: 200 }}>
                <div className='main-button-wrapper' onClick={this.toggleMenu} role='button' aria-expanded={menuOpen}>
                  <span className='button-text-label'>{feeds[current]?.name || 'Select feed'}</span>
                  <Icon className='button-icon' icon={dropdownIconSvg} />
                </div>
                <Collapse isOpen={menuOpen}>
                  <div className='dropdown-menu-container'>
                    {feeds.filter(f => f.name && f.url).map((f, i) => (
                      <Button key={i} type='tertiary' className='dropdown-item-button' onClick={() => this.selectFeed(i)}>
                        {f.name}
                      </Button>
                    ))}
                  </div>
                </Collapse>
              </div>
            )}
            <button
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                zIndex: 2,
                background: config.expandButtonBackgroundColor,
                color: config.expandButtonIconColor,
                borderRadius: `${config.expandButtonBorderRadius}px`
              }}
              onClick={this.toggleExpand}
            >⛶</button>
            <video
              ref={this.videoRef}
              controls
              autoPlay
              muted
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, borderRadius: 'inherit' }}
            />
            {feeds.length === 0 && (
              <span style={{ color: '#fff', zIndex: 1 }}>
                Please configure at least one video URL in the widget settings.
              </span>
            )}
          </>
        )}

        {expanded && (
          <div
            style={{
              position: 'fixed',
              top: '5%',
              left: '5%',
              width: '90%',
              height: '90%',
              background: config.popupBackgroundColor,
              zIndex: 1000,
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gridAutoRows: '1fr',
              gap: `${config.popupGap}px`,
              padding: `${config.popupPadding}px`,
              borderRadius: `${config.popupBorderRadius}px`,
              overflow: 'auto'
            }}
          >
            <button
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                zIndex: 1001,
                background: config.expandButtonBackgroundColor,
                color: config.expandButtonIconColor,
                borderRadius: `${config.expandButtonBorderRadius}px`
              }}
              onClick={this.toggleExpand}
            >×</button>
            {feeds.map((feed, i) => (
              <div key={i} style={{ padding: `${config.popupItemPadding}px`, overflow: 'hidden', borderRadius: `${config.popupBorderRadius}px` }}>
                <video
                  ref={el => { this.gridVideos[i] = el }}
                  controls
                  autoPlay
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
}
