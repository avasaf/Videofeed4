/** @jsx jsx */
import { React, AllWidgetProps, jsx, css, type IMThemeVariables, type SerializedStyles } from 'jimu-core'
import { type IMConfig } from '../config'
import Hls from './lib/hls.min.js'

interface State {
  current: number
  expanded: boolean
}

export default class Widget extends React.PureComponent<AllWidgetProps<IMConfig>, State> {
  private readonly videoRef: React.RefObject<HTMLVideoElement>
  private hls: Hls
  private gridVideos: HTMLVideoElement[] = []
  private gridHls: Hls[] = []

  constructor (props) {
    super(props)
    this.state = { current: 0, expanded: false }
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
    }
  }

  private toggleExpand = (): void => {
    this.setState({ expanded: !this.state.expanded })
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
      `
    }

    return css`
      ${baseStyle};
      border: 1px solid ${config.widgetBorderColor};
      background-color: ${config.widgetBackgroundColor};
    `
  }

  render (): React.ReactElement {
    const { config, theme } = this.props
    const { feeds = [] } = config
    const { current, expanded } = this.state

    return (
      <div className='video-feed-widget' css={this.getStyle(theme)}>
        {!expanded && (
          <>
            {feeds.length > 1 && (
              <select
                style={{ position: 'absolute', top: 10, left: 10, zIndex: 2 }}
                value={current}
                onChange={e => this.setState({ current: parseInt(e.target.value) })}
              >
                {feeds.map((f, i) => (<option key={i} value={i}>{f.name || `Feed ${i + 1}`}</option>))}
              </select>
            )}
            <button
              style={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }}
              onClick={this.toggleExpand}
            >⛶</button>
            <video
              ref={this.videoRef}
              controls
              autoPlay
              muted
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
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
              top: '10%',
              left: '10%',
              width: '80%',
              height: '80%',
              background: '#000',
              zIndex: 1000,
              display: 'flex',
              flexWrap: 'wrap'
            }}
          >
            <button
              style={{ position: 'absolute', top: 10, right: 10, zIndex: 1001 }}
              onClick={this.toggleExpand}
            >×</button>
            {feeds.map((feed, i) => (
              <video
                key={i}
                ref={el => { this.gridVideos[i] = el }}
                controls
                autoPlay
                muted
                style={{ flex: '1 0 50%', maxHeight: '50%', objectFit: 'cover' }}
              />
            ))}
          </div>
        )}
      </div>
    )
  }
}
