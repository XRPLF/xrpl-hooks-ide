import { FC } from 'react'
import { Link } from '.'

interface Props {
  result?: string
}

const ResultLink: FC<Props> = ({ result }) => {
  if (!result) return null
  let href: string
  if (result === 'tesSUCCESS') {
    href = 'https://xrpl.org/tes-success.html'
  } else {
    // Going shortcut here because of url structure, if that changes we will do it manually
    href = `https://xrpl.org/${result.slice(0, 3)}-codes.html`
  }
  return (
    <Link as="a" href={href} target="_blank" rel="noopener noreferrer">
      {result}
    </Link>
  )
}

export default ResultLink
