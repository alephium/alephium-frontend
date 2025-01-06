class WaveEntity {
  private waveLength: number[]
  private gradientColors: string[]
  private amplitude: number
  private base: number

  constructor(waveLength: number[], amplitude: number, base: number, gradientColors: string[]) {
    this.waveLength = waveLength
    this.gradientColors = gradientColors
    this.amplitude = amplitude
    this.base = base
  }

  public draw = (ctx: CanvasRenderingContext2D, width: number, height: number, frequency: number): void => {
    ctx.beginPath()
    ctx.moveTo(0, height)
    if (this.waveLength.length < 3) {
      return
    }

    const standardPpi = 96
    const pointsPerInch = 15
    const pointSpacing = standardPpi / pointsPerInch

    for (let i = 0; i < width; i += pointSpacing) {
      const wave1 = Math.sin(i * this.waveLength[0] - frequency)
      const wave2 = Math.sin(i * this.waveLength[1] - frequency)
      const wave3 = Math.sin(i * this.waveLength[2] - frequency)

      ctx.lineTo(i * 2.5, height - (100 + this.base * 50) + wave1 * wave2 * wave3 * 80 * this.amplitude)
    }
    ctx.lineTo(width, height)

    const gradient = ctx.createLinearGradient(0, height / 1.8, 0, height)

    gradient.addColorStop(0, this.gradientColors[0])
    gradient.addColorStop(1, this.gradientColors[1])

    ctx.fillStyle = gradient

    ctx.fill()
    ctx.closePath()
  }
}

export default WaveEntity
