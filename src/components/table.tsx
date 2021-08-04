import { useState, useEffect, SetStateAction, Dispatch } from "react";
import { allBondDate, allReturnsDefault, monthString } from "../lib/calcreturn";

export default function MainTable({
  isPulling,
  setIsPulling,
  type,
  setType,
  date,
  setDate,
}: {
  isPulling: boolean;
  setIsPulling: Dispatch<SetStateAction<boolean>>;
  type: string;
  setType: Dispatch<SetStateAction<string>>;
  date: Date;
  setDate: Dispatch<SetStateAction<Date>>;
}): JSX.Element {
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
  const [tableData, setTableData] = useState<{ [k: string]: number }[]>([]);
  const [monthYear, setMonthYear] = useState<string>("");

  if (isPulling) {
    const day: string = String(date.getDate()).padStart(2, "0");
    const month: string = String(date.getMonth() + 1).padStart(2, "0");
    const year: string = date.getFullYear().toString();
    allReturnsDefault({
      indicator: type,
      asof: `${year}-${month}-${day}`,
    }).then((data: { [k: string]: any }) => {
      setTableData(data.return);
      setMonthYear(data.monthYear);
      setIsPulling(false);
    });
  }
  useEffect(() => {
    allBondDate().then((data: string[]) => {
      const dateString: string = data.slice(-1)[0];
      allReturnsDefault({
        indicator: "yearly",
        asof: dateString,
      }).then((data: { [k: string]: any }) => {
        setTableData(data.return);
        setMonthYear(data.monthYear);
        setDate(new Date(dateString));
        setIsFirstLoad(false);
      });
    });
  }, []);
  return (
    <div className="columns is-desktop is-multiline is-centered is-vcentered">
      <div
        className="loader-wrapper"
        style={{ position: "relative", width: "80%" }}
      >
        <div className="column">
          {isPulling && (
            <div
              className="is-overlay"
              style={{ backgroundColor: "rgba(255,255,255,0.8)" }}
            >
              <div style={{ position: "absolute", top: "40%", width: "100%" }}>
                <h3 className="is-size-2 has-text-weight-bold has-text-centered">
                  Now Loading...
                </h3>
                <progress className="progress is-medium is-primary" max="100">
                  15%
                </progress>
              </div>
            </div>
          )}
          <table className="table is-fullwidth is-hoverable has-text-centered">
            <thead key="tableHead">
              <tr>
                {!isFirstLoad &&
                  Object.keys(tableData[0]).map((head) => {
                    return <th key={head}>{head}</th>;
                  })}
              </tr>
            </thead>
            <tbody key="tableBody">
              {!isFirstLoad &&
                Object.values(tableData).map((data) => {
                  return (
                    <tr key={data.Period}>
                      {Object.entries(data).map((cell) => {
                        if (cell[0] === "Period") {
                          return <td key={cell[0]}>{cell[1]}</td>;
                        } else {
                          return (
                            <td key={cell[0]}>{`${cell[1].toFixed(2)}%`}</td>
                          );
                        }
                      })}
                    </tr>
                  );
                })}
            </tbody>
            {!isFirstLoad && (
              <tfoot className="has-text-weight-bold">
                <tr>
                  <td colSpan={3}>
                    Market Return Date from SET asof: {monthYear}
                  </td>
                  <td colSpan={2}>
                    Bond Data from ThaiBMA asof:{" "}
                    {String(date.getDate()).padStart(2, "0")}-
                    {monthString[date.getMonth()]}-{date.getFullYear()}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
