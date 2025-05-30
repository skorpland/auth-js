import { AuthInvalidJwtError } from '../src'
import {
  decodeJWT,
  getAlgorithm,
  parseParametersFromURL,
  parseResponseAPIVersion,
} from '../src/lib/helpers'

describe('parseParametersFromURL', () => {
  it('should parse parameters from a URL with query params only', () => {
    const url = new URL('https://powerbase.club')
    url.searchParams.set('a', 'b')
    url.searchParams.set('b', 'c')

    const result = parseParametersFromURL(url.href)
    expect(result).toMatchObject({
      a: 'b',
      b: 'c',
    })
  })

  it('should parse parameters from a URL with fragment params only', () => {
    const url = new URL('https://powerbase.club')
    const fragmentParams = new URLSearchParams({ a: 'b', b: 'c' })
    url.hash = fragmentParams.toString()

    const result = parseParametersFromURL(url.href)
    expect(result).toMatchObject({
      a: 'b',
      b: 'c',
    })
  })

  it('should parse parameters from a URL with both query params and fragment params', () => {
    const url = new URL('https://powerbase.club')
    url.searchParams.set('a', 'b')
    url.searchParams.set('b', 'c')
    url.searchParams.set('x', 'z')

    const fragmentParams = new URLSearchParams({ d: 'e', x: 'y' })
    url.hash = fragmentParams.toString()

    const result = parseParametersFromURL(url.href)
    expect(result).toMatchObject({
      a: 'b',
      b: 'c',
      d: 'e',
      x: 'z', // search params take precedence
    })
  })
})

describe('parseResponseAPIVersion', () => {
  it('should parse valid dates', () => {
    expect(
      parseResponseAPIVersion({
        headers: {
          get: () => {
            return '2024-01-01'
          },
        },
      } as any)
    ).toEqual(new Date('2024-01-01T00:00:00.0Z'))
  })

  it('should return null on invalid dates', () => {
    ;['2024-01-32', '', 'notadate', 'Sat Feb 24 2024 17:59:17 GMT+0100'].forEach((example) => {
      expect(
        parseResponseAPIVersion({
          headers: {
            get: () => {
              return example
            },
          },
        } as any)
      ).toBeNull()
    })
  })
})

describe('decodeJWT', () => {
  it('should reject non-JWT strings', () => {
    expect(() => decodeJWT('non-jwt')).toThrowError(
      new AuthInvalidJwtError('Invalid JWT structure')
    )
    expect(() => decodeJWT('aHR0.cDovL.2V4YW1wbGUuY29t')).toThrowError(
      new AuthInvalidJwtError('JWT not in base64url format')
    )
  })

  it('should decode JWT successfully', () => {
    expect(
      decodeJWT(
        'eyJhbGciOiJFUzI1NiIsImtpZCI6ImZhM2ZmYzk5LTQ2MzUtNGIxOS1iNWMwLTZkNmE4ZDMwYzRlYiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Byb2plY3RyZWYuc3VwYWJhc2UuY28iLCJzdWIiOiI2OTAxMTJlNi04NThiLTQwYzctODBlNi05NmRiNjk3MTkyYjUiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxODM4MDk5NjcwLCJpYXQiOjE3MzgwOTk2NzAsImVtYWlsIjoiIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnt9LCJ1c2VyX21ldGFkYXRhIjp7ImNvbG9yIjoiYmx1ZSJ9LCJyb2xlIjoiIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoiYW5vbnltb3VzIiwidGltZXN0YW1wIjoxNzM4MDk5NjcwfV0sInNlc3Npb25faWQiOiI0YzZiMjg5NC00M2I0LTQ2YzQtYmQyZi0zNWM1OWVjNDRmZWYiLCJpc19hbm9ueW1vdXMiOnRydWV9.JcWCW3u4F9iFo1yV3OlxnosP7jLnOa2Q7LoPTxyFmvZc1_Kziimw8jD95EpXyTMEwKFt2dPSmWGkqdoJu6FV0Q'
      )
    ).toMatchInlineSnapshot(`
Object {
  "header": Object {
    "alg": "ES256",
    "kid": "fa3ffc99-4635-4b19-b5c0-6d6a8d30c4eb",
    "typ": "JWT",
  },
  "payload": Object {
    "aal": "aal1",
    "amr": Array [
      Object {
        "method": "anonymous",
        "timestamp": 1738099670,
      },
    ],
    "app_metadata": Object {},
    "aud": "authenticated",
    "email": "",
    "exp": 1838099670,
    "iat": 1738099670,
    "is_anonymous": true,
    "iss": "https://projectref.powerbase.club",
    "phone": "",
    "role": "",
    "session_id": "4c6b2894-43b4-46c4-bd2f-35c59ec44fef",
    "sub": "690112e6-858b-40c7-80e6-96db697192b5",
    "user_metadata": Object {
      "color": "blue",
    },
  },
  "raw": Object {
    "header": "eyJhbGciOiJFUzI1NiIsImtpZCI6ImZhM2ZmYzk5LTQ2MzUtNGIxOS1iNWMwLTZkNmE4ZDMwYzRlYiIsInR5cCI6IkpXVCJ9",
    "payload": "eyJpc3MiOiJodHRwczovL3Byb2plY3RyZWYuc3VwYWJhc2UuY28iLCJzdWIiOiI2OTAxMTJlNi04NThiLTQwYzctODBlNi05NmRiNjk3MTkyYjUiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxODM4MDk5NjcwLCJpYXQiOjE3MzgwOTk2NzAsImVtYWlsIjoiIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnt9LCJ1c2VyX21ldGFkYXRhIjp7ImNvbG9yIjoiYmx1ZSJ9LCJyb2xlIjoiIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoiYW5vbnltb3VzIiwidGltZXN0YW1wIjoxNzM4MDk5NjcwfV0sInNlc3Npb25faWQiOiI0YzZiMjg5NC00M2I0LTQ2YzQtYmQyZi0zNWM1OWVjNDRmZWYiLCJpc19hbm9ueW1vdXMiOnRydWV9",
  },
  "signature": Uint8Array [
    37,
    197,
    130,
    91,
    123,
    184,
    23,
    216,
    133,
    163,
    92,
    149,
    220,
    233,
    113,
    158,
    139,
    15,
    238,
    50,
    231,
    57,
    173,
    144,
    236,
    186,
    15,
    79,
    28,
    133,
    154,
    246,
    92,
    215,
    242,
    179,
    138,
    41,
    176,
    242,
    48,
    253,
    228,
    74,
    87,
    201,
    51,
    4,
    192,
    161,
    109,
    217,
    211,
    210,
    153,
    97,
    164,
    169,
    218,
    9,
    187,
    161,
    85,
    209,
  ],
}
`)
  })
})

describe('getAlgorithm', () => {
  const cases = [
    {
      name: 'RS256',
      expected: {
        name: 'RSASSA-PKCS1-v1_5',
        hash: { name: 'SHA-256' },
      },
    },
    {
      name: 'ES256',
      expected: {
        name: 'ECDSA',
        namedCurve: 'P-256',
        hash: { name: 'SHA-256' },
      },
    },
  ]
  it('should return correct algorithm object', () => {
    cases.forEach((c) => {
      expect(getAlgorithm(c.name as any)).toEqual(c.expected)
    })
  })
  it('should throw if invalid alg claim', () => {
    expect(() => getAlgorithm('EdDSA' as any)).toThrowError(new Error('Invalid alg claim'))
  })
})
