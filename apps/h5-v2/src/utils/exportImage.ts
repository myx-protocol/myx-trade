import * as htmlToImage from 'html-to-image'
import { aLink } from '.'
import type { Options } from 'html-to-image/lib/types'

export const exportImage = async (root: HTMLElement, fileName?: string): Promise<void> => {
  aLink({
    href: await htmlToImage.toJpeg(root),
    fileName,
  })
}

export const exportPngImage = async (
  root: HTMLElement,
  fileName?: string,
  options?: Options,
): Promise<void> => {
  aLink({
    href: await htmlToImage.toPng(root, options),
    fileName,
  })
}
