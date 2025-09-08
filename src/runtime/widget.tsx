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
    if (!this.state.expanded) {
      if (prevProps.config.feeds !== this.props.config.feeds) {
        const len = this.props.config.feeds?.length || 0
        if (this.state.current >= len) {
          this.setState({ current: 0 }, () => { this.setupPlayer() })
        } else {
          this.setupPlayer()
        }
      } else if (prevState.current !== this.state.current) {
        this.setupPlayer()
      }
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
    // destroy any existing Hls instances but keep the element refs
    this.gridHls.forEach(h => h && h.destroy())
    this.gridHls = []
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
      const parsed = new URL(url)
      const qs = parsed.search
      const baseUrl = `${parsed.origin}${parsed.pathname}`
      const BaseLoader = Hls.DefaultConfig.loader
      class QueryLoader extends BaseLoader {
        load (context, config, callbacks) {
          if (qs) {
            const sep = context.url.includes('?') ? '&' : '?'
            context.url = `${context.url}${sep}${qs.slice(1)}`
          }
          super.load(context, config, callbacks)
        }
      }
      const hls = new Hls({ loader: QueryLoader })
      hls.loadSource(baseUrl)
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
          display: inline-flex;
          justify-content: space-between;
          align-items: center;
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
          min-width: 100%;
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
        display: inline-flex;
        justify-content: flex-start;
        align-items: center;
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
      }
      .main-button-wrapper .button-icon {
        flex-shrink: 0;
        color: ${config.dropdownArrowColor};
        fill: ${config.dropdownArrowColor};
        margin-left: 10px;
      }
      .dropdown-wrapper {
        position: relative;
        height: 32px;
      }
      .dropdown-menu-container {
        background-color: ${config.dropdownSectionBackgroundColor};
        margin-top: 2px;
        border: 1px solid ${config.widgetBorderColor};
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        border-radius: ${config.dropdownBorderRadius}px;
        padding: 4px 0;
        min-width: 100%;
      }
      .dropdown-item-button.jimu-btn {
        width: 100%;
        justify-content: flex-start;
        text-align: left;
        color: ${config.dropdownSectionTextColor};
        background-color: transparent;
        border: none;
        border-radius: ${config.dropdownSectionHoverBorderRadius}px;
        &:hover {
          background-color: ${config.dropdownSectionHoverBackgroundColor};
          color: ${config.dropdownSectionHoverTextColor};
          border-radius: ${config.dropdownSectionHoverBorderRadius}px;
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
            <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 2, display: 'flex', alignItems: 'center' }}>
              {feeds.length > 1 && (
                <div className='dropdown-wrapper' style={{ marginRight: 10 }}>
                  <div className='main-button-wrapper' onClick={this.toggleMenu} role='button' aria-expanded={menuOpen}>
                    <span className='button-text-label'>{feeds[current]?.name || 'Select feed'}</span>
                    <Icon className='button-icon' icon={dropdownIconSvg} />
                  </div>
                  <Collapse isOpen={menuOpen} style={{ position: 'absolute', top: '100%', left: 0, right: 0 }}>
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
              {feeds.length > 1 && (
                <button
                  style={{
                    background: config.expandButtonBackgroundColor,
                    color: config.expandButtonIconColor,
                    borderRadius: `${config.expandButtonBorderRadius}px`,
                    border: 'none',
                    padding: 0,
                    height: 32,
                    width: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1
                  }}
                  onClick={this.toggleExpand}
                >⛶</button>
              )}
            </div>
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
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 10000 }}>
            {config.popupBlockPage && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: config.popupBlockPageColor,
                  zIndex: 0
                }}
              />
            )}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90vw',
                height: '90vh',
                background: config.popupBackgroundColor,
                zIndex: 1,
                padding: `${config.popupPadding}px`,
                borderRadius: `${config.popupBorderRadius}px`,
                boxShadow: `${config.popupBoxShadowOffsetX}px ${config.popupBoxShadowOffsetY}px ${config.popupBoxShadowBlur}px ${config.popupBoxShadowSpread}px ${config.popupBoxShadowColor}`
              }}
            >
              <button
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  zIndex: 2,
                  background: config.expandButtonBackgroundColor,
                  color: config.expandButtonIconColor,
                  borderRadius: `${config.expandButtonBorderRadius}px`,
                  border: 'none',
                  padding: 0,
                  height: 32,
                  width: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1
                }}
                onClick={this.toggleExpand}
              >×</button>
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gridAutoRows: '1fr',
                  gap: `${config.popupGap}px`,
                  overflow: 'auto'
                }}
              >
                {feeds.map((feed, i) => (
                  <div
                    key={i}
                    style={{
                      padding: `${config.popupItemPadding}px`,
                      overflow: 'hidden',
                      borderRadius: `${config.popupBorderRadius}px`,
                      position: 'relative'
                    }}
                  >
                    <video
                      ref={el => { this.gridVideos[i] = el }}
                      controls
                      autoPlay
                      muted
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: config.popupItemPadding + 10,
                        right: config.popupItemPadding + 10,
                        background: config.markerBackgroundColor,
                        color: config.markerTextColor,
                        padding: '4px 8px',
                        borderRadius: `${config.markerBorderRadius}px`,
                        pointerEvents: 'none'
                      }}
                    >
                      {feed.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
}
