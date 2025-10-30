import './quickcalc.css'
import QuickCalc from './components/QuickCalc'
import { Analytics } from '@vercel/analytics/react'

function App() {

  return <>
    <QuickCalc />
    <Analytics />
  </>
}

export default App
