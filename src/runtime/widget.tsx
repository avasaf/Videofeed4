/** @jsx jsx */
import { React, AllWidgetProps, jsx, css, type IMThemeVariables, type SerializedStyles } from 'jimu-core'
import { type IMConfig } from './config'
import Hls from './lib/hls.min.js'

export default class Widget extends React.PureComponent<AllWidgetProps<IMConfig>, unknown> {
  // Create a reference to the <video> DOM element
  private readonly videoRef: React.RefObject<HTMLVideoElement>
  private hls: Hls

  constructor(props) {
    super(props)
    this.videoRef = React.createRef()
    this.hls = null
  }

  componentDidMount(): void {
    this.setupPlayer()
  }

  // If the URL in the settings changes, re-setup the player
  componentDidUpdate(prevProps: AllWidgetProps<IMConfig>): void {
    if (this.props.config.videoUrl !== prevProps.config.videoUrl) {
      this.setupPlayer()
    }
  }

  // Clean up the HLS instance when the widget is removed
  componentWillUnmount(): void {
    if (this.hls) {
      this.hls.destroy()
    }
  }

  setupPlayer = () => {
    const { videoUrl } = this.props.config
    const videoElement = this.videoRef.current

    if (!videoUrl || !videoElement) return

    // Destroy any existing HLS instance
    if (this.hls) {
      this.hls.destroy()
    }

    // Check if the URL is an HLS stream
    if (videoUrl.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const url = new URL(videoUrl)
        const qs = url.search
        const baseUrl = `${url.origin}${url.pathname}`
        class QueryLoader extends Hls.DefaultConfig.loader {
          load (context, cfg, callbacks) {
            if (qs) {
              const sep = context.url.includes('?') ? '&' : '?'
              context.url = `${context.url}${sep}${qs.slice(1)}`
            }
            super.load(context, cfg, callbacks)
          }
        }
        this.hls = new Hls({ loader: QueryLoader })
        this.hls.loadSource(baseUrl)
        this.hls.attachMedia(videoElement)
        // Optional: Auto-play when the manifest is parsed
        this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoElement.play().catch(() => {
            console.warn('Browser prevented autoplay.')
          })
        })
      } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (e.g., on Safari)
        videoElement.src = videoUrl
      }
    } else {
      // For standard video files like .mp4, .webm, etc.
      videoElement.src = videoUrl
    }
  }

  getStyle(theme: IMThemeVariables): SerializedStyles {
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
        ${baseStyle}
        border: 1px solid ${theme.colors.border};
      `
    }

    return css`
      ${baseStyle}
      border: 1px solid ${config.widgetBorderColor};
      background-color: ${config.widgetBackgroundColor};
    `
  }

  render(): React.ReactElement {
    const { config, theme } = this.props

    return (
      <div className="video-feed-widget" css={this.getStyle(theme)}>
        <video
          ref={this.videoRef}
          controls
          autoPlay
          muted
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
        />
        {!config.videoUrl && (
          <span style={{ color: '#fff', zIndex: 1 }}>
            Please configure the video URL in the widget settings.
          </span>
        )}
      </div>
    )
  }
}