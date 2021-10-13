import { useState } from 'react'
import DatePicker from './components/datepicker'
import MainTable from './components/table'
import Footer from './components/footer'

export default function App(): JSX.Element {
  const [isPulling, setIsPulling] = useState<boolean>(false)
  const [type, setType] = useState<string>('yearly')
  const [date, setDate] = useState<Date>(new Date())
  return (
    <main>
      <div className="container is-fullhd">
        <header className="mt-3 mb-6">
          <h1 className="title is-size-1 has-text-centered">
            SET Market Return
          </h1>
        </header>
        <div className="m-2">
          <DatePicker
            isPulling={isPulling}
            setIsPulling={setIsPulling}
            type={type}
            setType={setType}
            date={date}
            setDate={setDate}
          />
          <MainTable
            isPulling={isPulling}
            setIsPulling={setIsPulling}
            type={type}
            setType={setType}
            date={date}
            setDate={setDate}
          />
        </div>
      </div>
      <Footer />
    </main>
  )
}
