import { createClient, SupabaseClient } from "@supabase/supabase-js";

// interface
import type { SETReturn, BondYield } from "./dbtypes";
import type {
  QueryLastAvailable,
  QueryAvgMktReturns,
  QueryAllReturnsDefault,
  LastAvailable,
} from "./datafeed";

const [SUPABASEURL, SUPABASEAPI] = [
  process.env.REACT_APP_SUPABASEURL || "",
  process.env.REACT_APP_SUPABASEAPI || "",
];

const supabase: SupabaseClient = createClient(SUPABASEURL, SUPABASEAPI);

const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const initSETData = async (): Promise<SETReturn[]> => {
  const { data } = await supabase
    .from<SETReturn>("SET_Return")
    .select("id,year,month");
  const allSETRecordsObj: SETReturn[] = Object.assign(data || []);
  return allSETRecordsObj;
};

const selectMissing = (type: string): number => {
  if (type === "yearly") {
    return yearlyMissing;
  } else if (type === "monthly") {
    return monthlyMissing;
  } else {
    console.log("errortype");
    return yearlyMissing;
  }
};

const defaultInterval: number[] = [1, 3, 5, 10, 17, 19, 20, 25, 30, 35, 40, 42, 46];
export const monthString: string[] = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const yearlyMissing = 12;
const monthlyMissing = 1;

const averageMktReturns = (
  query: QueryAvgMktReturns,
  allReturnObjSend: { [k: string]: number }[],
  allSETRecordsObj: SETReturn[]
): { [k: string]: number } => {
  const lastSETRecordsObj: SETReturn = allSETRecordsObj.find(
    (records) => records.month === query.month && records.year === query.year
  ) || { id: 0 };
  const periodId: number = lastSETRecordsObj.id;
  const missingValue = selectMissing(query.indicator);
  const maxInterval = Math.min(periodId - missingValue, query.interval * 12);
  const offset = Math.max(periodId - query.interval * 12, missingValue);
  const allReturnObj: { [k: string]: number }[] = allReturnObjSend.slice(
    offset,
    periodId
  );
  let dataset_return = 0;
  let dataset_tri = 0;
  for (let i = 0; i < maxInterval; i++) {
    dataset_return += allReturnObj[i][`${query.indicator}_return`];
    dataset_tri += allReturnObj[i][`${query.indicator}_tri`];
  }
  const average_return: number = dataset_return / maxInterval;
  const average_tri: number = dataset_tri / maxInterval;
  const div_yield: number = average_tri - average_return;
  const retKey = `${capitalize(query.indicator)} Return`;
  const triKey = `${capitalize(query.indicator)} Tri`;
  const divKey = "Dividend Yield";
  const retObj = {
    Period: query.interval,
    [retKey]: average_return,
    [divKey]: div_yield,
    [triKey]: average_tri,
  };
  return retObj;
};

const bondYieldReturn = async (asof: string): Promise<BondYield> => {
  const asofString = asof.slice(0, 10);
  const { data } = await supabase
    .from<BondYield>("Bond_Yield")
    .select("*")
    .match({ asof: asofString });
  const bondYieldObjects: BondYield[] = Object.assign(data || []);
  return bondYieldObjects[0];
};

export const allBondDate = async (): Promise<string[]> => {
  const { data } = await supabase
    .from<{ asof: Date }>("Bond_Yield")
    .select("asof");
  const dataObj: { asof: string }[] = Object.assign(data || []);
  const records: string[] = dataObj.map(({ asof }: { asof: string }) => {
    return asof;
  });
  return records;
};

const getLastAvailable = async (
  type: QueryLastAvailable
): Promise<LastAvailable> => {
  const missing: number = selectMissing(type.type) || yearlyMissing;
  const allSETRecordsObj: SETReturn[] = await initSETData();
  const lastSETRecordsObj: SETReturn = allSETRecordsObj.slice(-1).pop() || {
    id: 0,
    year: 0,
    month: "",
    yearly_return: 0,
    monthly_return: 0,
    yearly_tri: 0,
    monthly_tri: 0,
  };
  const endYear: number = lastSETRecordsObj.year || 0;
  const endMonth: string = lastSETRecordsObj.month || "";

  const shiftYear: number = Math.floor(
    (allSETRecordsObj.length - missing) / 12
  );
  const shiftMonth: number = (allSETRecordsObj.length - missing) % 12;
  const startYear: number = endYear - shiftYear;

  let index: number = monthString.findIndex((month) => month === endMonth);
  index -= shiftMonth;
  if (index < 0) {
    index += monthString.length;
  }
  const startMonth: string = monthString[index];

  const data: LastAvailable = {
    startMonth,
    startYear,
    endMonth,
    endYear,
  };
  return data;
};

export const allReturnsDefault = async (
  query: QueryAllReturnsDefault
): Promise<{ [k: string]: number }> => {
  const lastReturnAvailable: LastAvailable = await getLastAvailable({
    type: query.indicator,
  });
  const asofDate = new Date(query.asof);
  const year: number = asofDate.getFullYear();
  const month: string = monthString[asofDate.getMonth()];
  let endYear = year;
  let endMonth = month;
  if (year > lastReturnAvailable.endYear) {
    endYear = lastReturnAvailable.endYear;
    endMonth = lastReturnAvailable.endMonth;
  } else if (year === lastReturnAvailable.endYear) {
    const monthIndex = monthString.indexOf(month);
    const lastReturnAvailableIndex = monthString.indexOf(
      lastReturnAvailable.endMonth
    );
    if (monthIndex > lastReturnAvailableIndex) {
      endMonth = lastReturnAvailable.endMonth;
    }
  }
  const queryPrep = {
    indicator: query.indicator,
    year: endYear,
    month: endMonth,
  };
  const bondYield = await bondYieldReturn(
    `${String(asofDate.getFullYear())}-${String(
      asofDate.getMonth() + 1
    ).padStart(2, "0")}-${String(asofDate.getDate()).padStart(2, "0")}`
  );
  const bondYieldHead = "Bond Yield";
  const bondYieldObj = Object.assign(bondYield);
  const allSETRecordsObj: SETReturn[] = await initSETData();
  const indicator = `${query.indicator}_return,${query.indicator}_tri`;
  const { data } = await supabase
    .from<SETReturn>("SET_Return")
    .select(indicator);
  const allReturnObj: [] = Object.assign(data || []);
  const ret: { [k: string]: number }[] = [];
  for (const interval of defaultInterval) {
    // console.log(`start loop test ${interval}`);
    const querySend = Object.assign(queryPrep, { interval: interval });
    let mktReturns = await averageMktReturns(
      querySend,
      allReturnObj,
      allSETRecordsObj
    );
    const bondSlice = `${mktReturns.Period}Y`;
    const bondYieldSingle = {
      [bondYieldHead]: bondYieldObj[bondSlice],
    };
    mktReturns = { ...mktReturns, ...bondYieldSingle };
    ret.push(mktReturns);
  }
  const fullRet: { [k: string]: any } = {
    return: ret,
    monthYear: `${endMonth}-${endYear}`,
  };
  return fullRet;
};
