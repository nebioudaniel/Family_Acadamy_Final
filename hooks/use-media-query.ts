// hooks/use-media-query.ts
import * as React from "react"

export function useMediaQuery(query: string) {
  const [value, setValue] = React.useState(false)

  React.useEffect(() => {
    const onChange = (event: MediaQueryListEvent) => {
      setValue(event.matches)
    }

    const result = matchMedia(query)
    result.addListener(onChange)
    setValue(result.matches)

    return () => result.removeListener(onChange)
  }, [query])

  return value
}