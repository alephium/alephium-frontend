/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

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
