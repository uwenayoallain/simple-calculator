// Lightweight, safe expression evaluator for + - * / ^, parentheses,
// unary minus, postfix percent, and a few functions/constants.
// Inspired by shunting-yard algorithm.

type Token =
  | { type: 'num'; value: number }
  | { type: 'op'; value: '+' | '-' | '*' | '/' | '^' }
  | { type: 'lparen' }
  | { type: 'rparen' }
  | { type: 'func'; name: keyof typeof FUNCTIONS }
  | { type: 'const'; name: keyof typeof CONSTANTS }
  | { type: 'percent' } // postfix 1-arg op
  | { type: 'u-'} // unary minus

const FUNCTIONS = {
  sqrt: (x: number) => Math.sqrt(x),
  sin: (x: number) => Math.sin(x),
  cos: (x: number) => Math.cos(x),
  tan: (x: number) => Math.tan(x),
  abs: (x: number) => Math.abs(x),
  ln: (x: number) => Math.log(x),
  log: (x: number) => Math.log10 ? Math.log10(x) : Math.log(x) / Math.LN10,
  floor: (x: number) => Math.floor(x),
  ceil: (x: number) => Math.ceil(x),
  round: (x: number) => Math.round(x),
}

const CONSTANTS = {
  pi: Math.PI,
  e: Math.E,
}

const isDigit = (c: string) => c >= '0' && c <= '9'
const isLetter = (c: string) => /[a-z]/i.test(c)
const isSpace = (c: string) => /\s/.test(c)

export function evaluate(input: string): number {
  const tokens = tokenize(input)
  const rpn = toRPN(tokens)
  return evalRPN(rpn)
}

function tokenize(s: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  while (i < s.length) {
    const ch = s[i]
    if (isSpace(ch)) { i++; continue }
    if (isDigit(ch) || (ch === '.' && isDigit(s[i+1] ?? ''))) {
      let j = i
      while (isDigit(s[j] ?? '')) j++
      if (s[j] === '.') { j++; while (isDigit(s[j] ?? '')) j++ }
      // exponent part like 1e-3
      if ((s[j] === 'e' || s[j] === 'E') && (isDigit(s[j+1] ?? '') || ((s[j+1] === '+' || s[j+1] === '-') && isDigit(s[j+2] ?? '')))) {
        j++
        if (s[j] === '+' || s[j] === '-') j++
        while (isDigit(s[j] ?? '')) j++
      }
      const num = Number(s.slice(i, j))
      if (!isFinite(num)) throw new Error('Invalid number')
      tokens.push({ type: 'num', value: num })
      i = j
      // postfix percent directly after number
      if (s[i] === '%') { tokens.push({ type: 'percent' }); i++ }
      continue
    }
    if (ch === '+' || ch === '-' || ch === '*' || ch === '/' || ch === '^') {
      tokens.push({ type: 'op', value: ch })
      i++
      continue
    }
    if (ch === '(') { tokens.push({ type: 'lparen' }); i++; continue }
    if (ch === ')') { tokens.push({ type: 'rparen' }); i++; // possible postfix percent
      if (s[i] === '%') { tokens.push({ type: 'percent' }); i++ }
      continue }
    if (isLetter(ch)) {
      let j = i
      while (isLetter(s[j] ?? '')) j++
      const id = s.slice(i, j).toLowerCase()
      if ((FUNCTIONS as any)[id]) {
        tokens.push({ type: 'func', name: id as keyof typeof FUNCTIONS })
      } else if ((CONSTANTS as any)[id]) {
        tokens.push({ type: 'const', name: id as keyof typeof CONSTANTS })
      } else {
        throw new Error(`Unknown identifier: ${id}`)
      }
      i = j
      continue
    }
    throw new Error(`Unexpected character: ${ch}`)
  }
  // Post-process to convert leading '-' to unary minus
  const out: Token[] = []
  for (let k = 0; k < tokens.length; k++) {
    const t = tokens[k]
    if (t.type === 'op' && t.value === '-') {
      const prev = out[out.length - 1]
      if (!prev || prev.type === 'op' || prev.type === 'lparen' || prev.type === 'func') {
        out.push({ type: 'u-' })
        continue
      }
    }
    out.push(t)
  }
  return out
}

function toRPN(tokens: Token[]): Token[] {
  const output: Token[] = []
  const stack: Token[] = []

  const prec = (t: Token): number => {
    if (t.type === 'u-') return 5
    if (t.type === 'op') {
      switch (t.value) {
        case '^': return 4
        case '*': case '/': return 3
        case '+': case '-': return 2
      }
    }
    if (t.type === 'percent') return 6 // highest, postfix
    return 0
  }
  const rightAssoc = (t: Token) => (t.type === 'op' && t.value === '^') || t.type === 'u-'

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]
    if (t.type === 'num' || t.type === 'const') {
      output.push(t)
    } else if (t.type === 'func') {
      stack.push(t)
    } else if (t.type === 'percent') {
      // postfix, goes directly to output as operator
      output.push(t)
    } else if (t.type === 'u-' || t.type === 'op') {
      while (stack.length) {
        const top = stack[stack.length - 1]
        if ((top.type === 'u-' || top.type === 'op' || top.type === 'percent') &&
            (prec(top) > prec(t) || (prec(top) === prec(t) && !rightAssoc(t)))) {
          output.push(stack.pop() as Token)
        } else break
      }
      stack.push(t)
    } else if (t.type === 'lparen') {
      stack.push(t)
    } else if (t.type === 'rparen') {
      while (stack.length && stack[stack.length - 1].type !== 'lparen') {
        output.push(stack.pop() as Token)
      }
      if (!stack.length) throw new Error('Mismatched parentheses')
      stack.pop() // pop lparen
      // if func on top, pop it
      if (stack.length && stack[stack.length - 1].type === 'func') {
        output.push(stack.pop() as Token)
      }
    }
  }
  while (stack.length) {
    const t = stack.pop() as Token
    if (t.type === 'lparen' || t.type === 'rparen') throw new Error('Mismatched parentheses')
    output.push(t)
  }
  return output
}

function evalRPN(rpn: Token[]): number {
  const stack: number[] = []
  const pop = () => {
    if (!stack.length) throw new Error('Invalid expression')
    return stack.pop() as number
  }
  for (const t of rpn) {
    if (t.type === 'num') stack.push(t.value)
    else if (t.type === 'const') stack.push(CONSTANTS[t.name])
    else if (t.type === 'u-') { const a = pop(); stack.push(-a) }
    else if (t.type === 'percent') { const a = pop(); stack.push(a / 100) }
    else if (t.type === 'func') { const a = pop(); const f = FUNCTIONS[t.name]; const v = f(a); if (!isFinite(v)) throw new Error('Math domain error'); stack.push(v) }
    else if (t.type === 'op') {
      const b = pop(); const a = pop()
      let v: number
      switch (t.value) {
        case '+': v = a + b; break
        case '-': v = a - b; break
        case '*': v = a * b; break
        case '/': v = a / b; break
        case '^': v = Math.pow(a, b); break
        default: throw new Error('Unknown operator')
      }
      if (!isFinite(v)) throw new Error('Math domain error')
      stack.push(v)
    }
  }
  if (stack.length !== 1) throw new Error('Invalid expression')
  return stack[0]
}

