import { ImageResponse } from 'next/og'

export const size = { width: 512, height: 512 }
export const contentType = 'image/png'

export default function Icon() {
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
        {/* Bolt shape */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0,
          }}
        >
          {/* S letter */}
          <div
            style={{
              fontSize: 320,
              fontWeight: 800,
              color: '#ff6b4a',
              fontFamily: 'sans-serif',
              lineHeight: 0.85,
              letterSpacing: '-0.05em',
            }}
          >
            S
          </div>
          {/* Underline bar */}
          <div
            style={{
              width: 200,
              height: 18,
              background: '#ff6b4a',
              borderRadius: 9,
              marginTop: 8,
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  )
}
