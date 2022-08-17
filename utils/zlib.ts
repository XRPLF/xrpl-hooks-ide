export function isZlibData(data: Uint8Array): boolean {
  // @ts-expect-error
  const [firstByte, secondByte] = data
  return firstByte === 0x78 && (secondByte === 0x01 || secondByte === 0x9c || secondByte === 0xda)
}

export async function decompressZlib(data: Uint8Array): Promise<Uint8Array> {
  const { inflate } = await import('pako')
  return inflate(data)
}
