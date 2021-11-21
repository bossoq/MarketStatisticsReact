/// <reference lib="dom" />
import { useCallback, useEffect, useRef, SetStateAction, Dispatch } from 'react'
import { allBondDate } from '../lib/calcreturn'

export default function DatePicker({
  isPulling,
  setIsPulling,
  type,
  setType,
  date,
  setDate,
}: {
  isPulling: boolean
  setIsPulling: Dispatch<SetStateAction<boolean>>
  type: string
  setType: Dispatch<SetStateAction<string>>
  date: Date
  setDate: Dispatch<SetStateAction<Date>>
}): JSX.Element {
  const typeRef = useRef<HTMLSelectElement>(null)
  const dateRef = useRef<HTMLInputElement>(null)
  const onChangeSelection = useCallback(() => {
    if (type !== typeRef.current?.value) {
      setType(typeRef.current?.value.toLowerCase() || 'yearly')
    }
    if (date !== new Date(dateRef.current?.value || '')) {
      setDate(new Date(dateRef.current?.value || ''))
    }
    setIsPulling(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    allBondDate().then((allDate: string[]) => {
      const startDate: Date = new Date(allDate.slice(0, 1)[0])
      const endDate: Date = new Date(allDate.slice(-1)[0])
      let dateRange: Date[] = []
      for (
        let unix = startDate.getTime();
        unix <= endDate.getTime();
        unix += 86400000
      ) {
        const thisDay: Date = new Date(unix)
        const day = thisDay.getDate()
        const month = thisDay.getMonth()
        const year = thisDay.getFullYear()
        if (
          !allDate.includes(
            `${year}-${String(month + 1).padStart(2, '0')}-${String(
              day
            ).padStart(2, '0')}`
          )
        ) {
          dateRange.push(thisDay)
        }
      }
      const startEnd: Date[] = [startDate, endDate]
      sessionStorage.setItem('startEnd', JSON.stringify(startEnd))
      sessionStorage.setItem('allDateList', JSON.stringify(dateRange))
      dateRef.current?.addEventListener('change', onChangeSelection)
    })
  }, [onChangeSelection])
  return (
    <div className="columns is-mobile is-centered is-vcentered">
      <div className="column is-half is-centered is-vcentered">
        <div className="is-flex is-flex-wrap-wrap is-flex-direction-row is-align-items-center is-justify-content-center">
          <div className="ml-1 mr-1">
            <span className="is-size-4 has-text-weight-bold">Type:</span>
          </div>
          <div className="ml-1 mr-1">
            <div className="select is-medium datepicker">
              <select
                title="calculation type"
                ref={typeRef}
                name="indicator"
                className="has-text-weight-bold datepicker"
                onChange={onChangeSelection}
              >
                <option>Yearly</option>
                <option>Monthly</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="column is-half is-centered is-vcentered">
        <div className="is-flex is-flex-wrap-wrap is-flex-direction-row is-align-items-center is-justify-content-center">
          <div className="ml-1 mr-1">
            <label className="is-size-4 has-text-weight-bold">Data asof:</label>
          </div>
          <div className="ml-1 mr-1">
            <input
              title="data asof"
              ref={dateRef}
              className="input is-medium has-text-centered has-text-weight-bold"
              type="text"
              name="datePicker"
              onChange={onChangeSelection}
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  )
}
