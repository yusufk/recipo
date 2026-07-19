import { useEffect, useRef } from 'react'

interface CommentsProps {
  term: string  // The recipe path used to map to a Discussion
}

export default function Comments({ term }: CommentsProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    // Clear any existing giscus
    ref.current.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://giscus.app/client.js'
    script.setAttribute('data-repo', 'yusufk/recipo')
    script.setAttribute('data-repo-id', 'R_kgDOTda7_A')
    script.setAttribute('data-category', 'General')
    script.setAttribute('data-category-id', 'DIC_kwDOTda7_M4DBiRB')
    script.setAttribute('data-mapping', 'specific')
    script.setAttribute('data-term', term)
    script.setAttribute('data-strict', '0')
    script.setAttribute('data-reactions-enabled', '1')
    script.setAttribute('data-emit-metadata', '0')
    script.setAttribute('data-input-position', 'top')
    script.setAttribute('data-theme', 'light')
    script.setAttribute('data-lang', 'en')
    script.setAttribute('data-loading', 'lazy')
    script.crossOrigin = 'anonymous'
    script.async = true

    ref.current.appendChild(script)
  }, [term])

  return (
    <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '2px solid var(--border)' }}>
      <h2 style={{ fontFamily: 'var(--font-handwritten)', fontSize: '2rem', color: 'var(--ink)', marginBottom: '1rem' }}>
        Comments & Tips
      </h2>
      <div ref={ref} />
    </div>
  )
}
