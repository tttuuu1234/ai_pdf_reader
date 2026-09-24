import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Library } from './components/Library/Library'
import { ReaderPage } from './components/Layout/ReaderPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Library />} />
        <Route path="/read/:docId" element={<ReaderPage />} />
      </Routes>
    </BrowserRouter>
  )
}
