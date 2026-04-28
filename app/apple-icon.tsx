import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1a1a2e',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: 112,
              fontWeight: 800,
              color: '#ff6b4a',
              fontFamily: 'sans-serif',
              lineHeight: 0.85,
              letterSpacing: '-0.05em',
            }}
          >
            S
          </div>
          <div
            style={{
              width: 70,
              height: 7,
              background: '#ff6b4a',
              borderRadius: 4,
              marginTop: 4,
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  )
}
