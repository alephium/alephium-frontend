import { hexToBase64 } from '.'

describe('hexToBase64', () => {
  it('converts short hex strings', () => {
    expect(hexToBase64('cafe0123')).toBe('yv4BIw==')
  })

  it('converts long hex strings', () => {
    expect(hexToBase64('a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0')).toBe(
      'obLD1OX2p7jJ0OHyo7TF1uf4qbDB0uP0pbbH2Onw'
    )
  })

  it('converts all zeros', () => {
    expect(hexToBase64('00000000')).toBe('AAAAAA==')
  })

  it('converts all ff', () => {
    expect(hexToBase64('ffffffff')).toBe('/////w==')
  })

  it('converts single byte', () => {
    expect(hexToBase64('ff')).toBe('/w==')
    expect(hexToBase64('00')).toBe('AA==')
    expect(hexToBase64('41')).toBe('QQ==') // 'A' in ASCII
  })
})
