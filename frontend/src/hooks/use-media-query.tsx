import * as React from "react"

export function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false)

  React.useEffect(() => {
    const media = window.matchMedia(query)
    const onChange = () => {
      setMatches(media.matches)
    }

    setMatches(media.matches)
    media.addEventListener("change", onChange)

    return () => media.removeEventListener("change", onChange)
  }, [query])

  return matches
} 