import { describe, expect, it, vi } from 'vitest'

// mock backend base URL resolver
vi.mock('../services/api', () => ({
  getBackendBaseURL: () => 'http://localhost:8000',
}))

import { useMarkdownRenderer } from './useMarkdownRenderer'

describe('useMarkdownRenderer - math rendering', () => {
  it('renders inline and block latex to KaTeX HTML', () => {
    const { renderMarkdownWithLatex } = useMarkdownRenderer()
    const md = [
      '行內 $x^2 + y^2 = r^2$',
      '',
      '$$',
      '\\frac{1}{2}',
      '$$',
    ].join('\n')

    const html = renderMarkdownWithLatex(md)
    expect(html).toContain('katex')
    expect(html).toContain('x^2')
    expect(html).toContain('\\frac') // data-math-raw should keep raw latex
  })

  it('handles $$∴$...$ without requiring manual newline', () => {
    const { renderMarkdownWithLatex } = useMarkdownRenderer()
    const md = '$$∴$\\sin 2\\theta < \\cos\\theta < \\cos 2\\theta < \\sin\\theta$'
    const html = renderMarkdownWithLatex(md)

    // should not leak placeholder text
    expect(html).not.toContain('data-latex-block')
    // should render inline katex and keep therefore symbol
    expect(html).toContain('∴')
    expect(html).toContain('katex')
  })

  it('sanitizes inline $...$ inside $$...$$ blocks so KaTeX does not fail', () => {
    const { renderMarkdownWithLatex } = useMarkdownRenderer()
    const md = '$$\\text{because }$x+y$\\text{ is }2$$'
    const html = renderMarkdownWithLatex(md)
    expect(html).toContain('katex')
    // ensure it didn't keep nested $ delimiters as raw
    expect(html).not.toContain('$x+y$')
  })
})

