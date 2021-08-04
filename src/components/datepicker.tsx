/// <reference lib="dom" />
import { useState, useEffect, useRef, SetStateAction, Dispatch } from "react";
import { allBondDate } from "../lib/calcreturn";

export default function DatePicker({
  isPulling,
  setIsPulling,
  type,
  setType,
  date,
  setDate
}: {
  isPulling: boolean;
  setIsPulling: Dispatch<SetStateAction<boolean>>;
  type: string;
  setType: Dispatch<SetStateAction<string>>;
  date: Date;
  setDate: Dispatch<SetStateAction<Date>>;
}): JSX.Element {
  const typeRef = useRef<HTMLSelectElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const onChangeSelection = () => {
    if (type !== typeRef.current?.value) {
      setType(typeRef.current?.value.toLowerCase() || "yearly")
    }
    if (date !== new Date(dateRef.current?.value || "")) {
      setDate(new Date(dateRef.current?.value || ""))
    }
    setIsPulling(true);
  };
  useEffect(() => {
    allBondDate().then((allDate: string[]) => {
      const startDate: Date = new Date(allDate.slice(0, 1)[0]);
      const endDate: Date = new Date(allDate.slice(-1)[0]);
      let dateRange: Date[] = [];
      for (
        let unix = startDate.getTime();
        unix <= endDate.getTime();
        unix += 86400000
      ) {
        const thisDay: Date = new Date(unix);
        const day = thisDay.getDate();
        const month = thisDay.getMonth();
        const year = thisDay.getFullYear();
        if (
          !allDate.includes(
            `${year}-${String(month + 1).padStart(2, "0")}-${String(
              day
            ).padStart(2, "0")}`
          )
        ) {
          dateRange.push(thisDay);
        }
      }
      const startEnd: Date[] = [startDate, endDate];
      sessionStorage.setItem("allDateList", JSON.stringify(dateRange));
      sessionStorage.setItem("startEnd", JSON.stringify(startEnd));
      dateRef.current?.addEventListener("change", onChangeSelection);
    });
  }, []);
  return (
    <div className="columns is-desktop is-centered is-vcentered">
      <div className="column is-one-third">
        <div className="columns is-desktop is-centered is-vcentered">
          <div className="column is-one-third">
            <span className="is-size-4 has-text-weight-bold">Type:</span>
          </div>
          <div className="column is-two-thirds">
            <div className="select is-medium" style={{ width: "100%" }}>
              <select
                ref={typeRef}
                name="indicator"
                className="has-text-weight-bold"
                style={{ width: "100%" }}
                onChange={onChangeSelection}
              >
                <option>Yearly</option>
                <option>Monthly</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="column is-one-third is-centered is-vcentered">
        <div className="columns is-desktop is-centered is-vcentered">
          <div className="column is-one-third">
            <label className="is-size-4 has-text-weight-bold">Data asof:</label>
          </div>
          <div className="column is-two-thirds">
            <input
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
  );
}
