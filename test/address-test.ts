// Copyright 2018 - 2021 The Alephium Authors
// This file is part of the alephium project.
//
// The library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the library. If not, see <http://www.gnu.org/licenses/>.

import { addressToGroup } from '../lib/address'

describe('address', function () {
  it('should derive group', async () => {
    function check(address: string, expected: number) {
      const group = addressToGroup(address, 4)
      expect(group).toEqual(expected)
    }

    check('12psscGPMgdqctaeCA37HYAkpVBFX1LbN4dSvjyxbDyKk', 1)
    check('16TGLiD3fqyuGFRFHffh58BC3okYCbjRH1WHPzeSp39Wi', 2)
    check('15aTcpJfCX9akQqYuRMMgun6Mv6ek8bigB98VTUFMwKYA', 1)
    check('164ejvnxGYRPUt3tYwJrMxBLLmeag2WACH4GfcsRUN3W7', 2)
    check('15p5vK921GnxFSQgXZo8Wceg6EvwcXZ9rCQxE2SeXc1s5', 1)
    check('1HSLAetSuMTKPHukvXYg6yaDuUJ67vxGashzFLEuu6qV6', 1)
    check('1HbU1TDiUMAj33Cp5cA2xc9uTqp1bjWa5UvkeGLm4bDbE', 2)
    check('13zn4s3fb5Q9d8rtszYdmYVpQ3MM9VM2xLBe9rMhcNxjd', 0)
    check('1DdQwce5ZzFrEYyz1H5KU9v8hRpoTbq5i7zE5Nu5k4ope', 2)
    check('19hpcUVGzdpWRD8yVUyP9pJwwxD6P5ixGUgSmVPbhBAVX', 2)
    check('1DpNeY8uutS1FRW7D565WjUgu5HcKSYAMqZNWgUJWggWZ', 0)
    check('1G1gjpt4mxij7JwP5SpX6ScwQHisWN3V5WBtFfWKtc3vo', 3)
    check('19XyGb6f1upjvQAG4vexB1EmY3pU8G2VN5gM267Pdhogg', 3)
    check('1H5YniQrUqxJY9ShTjMeX6DMgjPpYfdFqDvTgBYv6h1iz', 1)
    check('18Ca9jZDqRcxTfdNr2hq5KBJjf7PJLA5PXMjRoeB83JNv', 3)
    check('15XyPNJuZ85wyUMs4mwn98LLPMjiwUSCuTmR74NuxpwXT', 0)
    check('1F6ssQRwH1p1omaoQR3eirFrycHC3mUr3Vw9pLcgEe33W', 1)
    check('19JtVnQ4YLcA9mWPafnLmtWarAjdaLR3d7R5RAUjxHbe1', 3)
  })
})
