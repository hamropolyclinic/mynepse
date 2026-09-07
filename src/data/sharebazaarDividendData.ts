import { DividendRecord } from '../types/nepse';

export interface ShareBazaarDividendInfo {
  symbol: string;
  tickerName: string;
  source: 'ShareBazaar Community API';
  lastUpdated: string;
  latestFiscalYear: string;
  latestCashPercent: number;
  latestBonusPercent: number;
  latestTotalPercent: number;
  cashDividendYield: number; // % (Cash DPS / Current Price)
  totalDividendYield: number; // % (Total DPS / Current Price)
  bookClosureDate?: string;
  hasDividendHistory: boolean;
  history: DividendRecord[];
}

export const SHAREBAZAAR_DIVIDENDS: Record<string, ShareBazaarDividendInfo> = {
  'AHPC': {
    symbol: 'AHPC',
    tickerName: "Arun Valley Hydropower Development",
    source: 'ShareBazaar Community API',
    lastUpdated: '2081/82 NEPSE Recorded',
    latestFiscalYear: "2081/82",
    latestCashPercent: 0.263,
    latestBonusPercent: 5.0,
    latestTotalPercent: 5.263,
    cashDividendYield: 0.11,
    totalDividendYield: 2.12,
    bookClosureDate: "2026-01-02",
    hasDividendHistory: true,
    history: [
      {
        fiscalYear: "2081/82",
        bonusDividendPercent: 5.0,
        cashDividendPercent: 0.263,
        totalDividendPercent: 5.263,
        bookClosureDate: "2026-01-02",
        status: "Distributed"
      },
      {
        fiscalYear: "2080/81",
        bonusDividendPercent: 3.0,
        cashDividendPercent: 0.157,
        totalDividendPercent: 3.157,
        bookClosureDate: "2024-10-21",
        status: "Distributed"
      },
      {
        fiscalYear: "2078/79",
        bonusDividendPercent: 8.0,
        cashDividendPercent: 0.421,
        totalDividendPercent: 8.421,
        bookClosureDate: "2023-02-01",
        status: "Distributed"
      },
      {
        fiscalYear: "2077/78",
        bonusDividendPercent: 10.0,
        cashDividendPercent: 0.526,
        totalDividendPercent: 10.526,
        bookClosureDate: "2021-09-27",
        status: "Distributed"
      },
      {
        fiscalYear: "2076/77",
        bonusDividendPercent: 5.0,
        cashDividendPercent: 0.263,
        totalDividendPercent: 5.263,
        bookClosureDate: "2020-12-11",
        status: "Distributed"
      },
      {
        fiscalYear: "2075/76",
        bonusDividendPercent: 7.0,
        cashDividendPercent: 0.37,
        totalDividendPercent: 7.37,
        bookClosureDate: "2019-12-26",
        status: "Distributed"
      },
      {
        fiscalYear: "2073/74",
        bonusDividendPercent: 10.0,
        cashDividendPercent: 0.526,
        totalDividendPercent: 10.526,
        bookClosureDate: "2017-08-25",
        status: "Distributed"
      },
      {
        fiscalYear: "2072/73",
        bonusDividendPercent: 10.0,
        cashDividendPercent: 0.53,
        totalDividendPercent: 10.53,
        bookClosureDate: "2016-08-15",
        status: "Distributed"
      },
      {
        fiscalYear: "2071/72",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 11.0,
        totalDividendPercent: 11.0,
        bookClosureDate: "2015-08-27",
        status: "Distributed"
      },
      {
        fiscalYear: "2070/71",
        bonusDividendPercent: 10.0,
        cashDividendPercent: 0.53,
        totalDividendPercent: 10.53,
        bookClosureDate: "2014-08-22",
        status: "Distributed"
      }
    ]
  },
  'CBBL': {
    symbol: 'CBBL',
    tickerName: "Chhimek Laghubitta Bikas Bank",
    source: 'ShareBazaar Community API',
    lastUpdated: '2081/82 NEPSE Recorded',
    latestFiscalYear: "2081/82",
    latestCashPercent: 12.5,
    latestBonusPercent: 12.5,
    latestTotalPercent: 25.0,
    cashDividendYield: 1.34,
    totalDividendYield: 2.68,
    bookClosureDate: "2025-12-31",
    hasDividendHistory: true,
    history: [
      {
        fiscalYear: "2081/82",
        bonusDividendPercent: 12.5,
        cashDividendPercent: 12.5,
        totalDividendPercent: 25.0,
        bookClosureDate: "2025-12-31",
        status: "Distributed"
      },
      {
        fiscalYear: "2080/81",
        bonusDividendPercent: 8.0,
        cashDividendPercent: 7.0,
        totalDividendPercent: 15.0,
        bookClosureDate: "2024-12-31",
        status: "Distributed"
      },
      {
        fiscalYear: "2079/80",
        bonusDividendPercent: 5.0,
        cashDividendPercent: 10.0,
        totalDividendPercent: 15.0,
        bookClosureDate: "2024-01-02",
        status: "Distributed"
      },
      {
        fiscalYear: "2078/79",
        bonusDividendPercent: 22.0,
        cashDividendPercent: 3.26,
        totalDividendPercent: 25.26,
        bookClosureDate: "2023-03-09",
        status: "Distributed"
      },
      {
        fiscalYear: "2077/78",
        bonusDividendPercent: 27.0,
        cashDividendPercent: 3.0,
        totalDividendPercent: 30.0,
        bookClosureDate: "2021-12-22",
        status: "Distributed"
      },
      {
        fiscalYear: "2076/77",
        bonusDividendPercent: 22.0,
        cashDividendPercent: 7.0,
        totalDividendPercent: 29.0,
        bookClosureDate: "2020-12-30",
        status: "Distributed"
      },
      {
        fiscalYear: "2075/76",
        bonusDividendPercent: 27.1186,
        cashDividendPercent: 17.2168,
        totalDividendPercent: 44.3354,
        bookClosureDate: "2019-12-02",
        status: "Distributed"
      },
      {
        fiscalYear: "2074/75",
        bonusDividendPercent: 18.0,
        cashDividendPercent: 22.0,
        totalDividendPercent: 40.0,
        bookClosureDate: "2019-04-29",
        status: "Distributed"
      },
      {
        fiscalYear: "2073/74",
        bonusDividendPercent: 19.89,
        cashDividendPercent: 25.11,
        totalDividendPercent: 45.0,
        bookClosureDate: "2017-10-23",
        status: "Distributed"
      },
      {
        fiscalYear: "2072/73",
        bonusDividendPercent: 40.0,
        cashDividendPercent: 12.7,
        totalDividendPercent: 52.7,
        bookClosureDate: "2016-12-11",
        status: "Distributed"
      }
    ]
  },
  'CFCL': {
    symbol: 'CFCL',
    tickerName: "Central Finance",
    source: 'ShareBazaar Community API',
    lastUpdated: '2081/82 NEPSE Recorded',
    latestFiscalYear: "2078/79",
    latestCashPercent: 5.0,
    latestBonusPercent: 0.0,
    latestTotalPercent: 5.0,
    cashDividendYield: 0.84,
    totalDividendYield: 0.84,
    bookClosureDate: "2023-01-01",
    hasDividendHistory: true,
    history: [
      {
        fiscalYear: "2078/79",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 5.0,
        totalDividendPercent: 5.0,
        bookClosureDate: "2023-01-01",
        status: "Distributed"
      },
      {
        fiscalYear: "2077/78",
        bonusDividendPercent: 7.7,
        cashDividendPercent: 3.3,
        totalDividendPercent: 11.0,
        bookClosureDate: "2022-01-02",
        status: "Distributed"
      },
      {
        fiscalYear: "2076/77",
        bonusDividendPercent: 7.0,
        cashDividendPercent: 3.0,
        totalDividendPercent: 10.0,
        bookClosureDate: "2021-01-25",
        status: "Distributed"
      },
      {
        fiscalYear: "2075/76",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 7.0,
        totalDividendPercent: 7.0,
        bookClosureDate: "2020-02-11",
        status: "Distributed"
      },
      {
        fiscalYear: "2074/75",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 7.0,
        totalDividendPercent: 7.0,
        bookClosureDate: "2019-03-07",
        status: "Distributed"
      },
      {
        fiscalYear: "2073/74",
        bonusDividendPercent: 8.76,
        cashDividendPercent: 0.0,
        totalDividendPercent: 8.76,
        bookClosureDate: "2018-10-31",
        status: "Distributed"
      },
      {
        fiscalYear: "2072/73",
        bonusDividendPercent: 22.5,
        cashDividendPercent: 1.74,
        totalDividendPercent: 24.24,
        bookClosureDate: "2017-06-15",
        status: "Distributed"
      },
      {
        fiscalYear: "2071/72",
        bonusDividendPercent: 33.0,
        cashDividendPercent: 1.74,
        totalDividendPercent: 34.74,
        bookClosureDate: "2016-01-03",
        status: "Distributed"
      },
      {
        fiscalYear: "2069/70",
        bonusDividendPercent: 10.0,
        cashDividendPercent: 0.0,
        totalDividendPercent: 10.0,
        bookClosureDate: "2014-07-03",
        status: "Distributed"
      }
    ]
  },
  'CHCL': {
    symbol: 'CHCL',
    tickerName: "Chilime Hydropower",
    source: 'ShareBazaar Community API',
    lastUpdated: '2081/82 NEPSE Recorded',
    latestFiscalYear: "2081/82",
    latestCashPercent: 4.0,
    latestBonusPercent: 8.0,
    latestTotalPercent: 12.0,
    cashDividendYield: 1.1,
    totalDividendYield: 3.31,
    bookClosureDate: "2026-01-01",
    hasDividendHistory: true,
    history: [
      {
        fiscalYear: "2081/82",
        bonusDividendPercent: 8.0,
        cashDividendPercent: 4.0,
        totalDividendPercent: 12.0,
        bookClosureDate: "2026-01-01",
        status: "Distributed"
      },
      {
        fiscalYear: "2080/81",
        bonusDividendPercent: 10.0,
        cashDividendPercent: 2.0,
        totalDividendPercent: 12.0,
        bookClosureDate: "2024-12-31",
        status: "Distributed"
      },
      {
        fiscalYear: "2079/80",
        bonusDividendPercent: 10.0,
        cashDividendPercent: 5.0,
        totalDividendPercent: 15.0,
        bookClosureDate: "2023-12-24",
        status: "Distributed"
      },
      {
        fiscalYear: "2078/79",
        bonusDividendPercent: 7.5,
        cashDividendPercent: 7.5,
        totalDividendPercent: 15.0,
        bookClosureDate: "2022-12-18",
        status: "Distributed"
      },
      {
        fiscalYear: "2077/78",
        bonusDividendPercent: 7.5,
        cashDividendPercent: 7.5,
        totalDividendPercent: 15.0,
        bookClosureDate: "2021-12-30",
        status: "Distributed"
      },
      {
        fiscalYear: "2076/77",
        bonusDividendPercent: 10.0,
        cashDividendPercent: 10.0,
        totalDividendPercent: 20.0,
        bookClosureDate: "2020-12-14",
        status: "Distributed"
      },
      {
        fiscalYear: "2075/76",
        bonusDividendPercent: 20.0,
        cashDividendPercent: 5.0,
        totalDividendPercent: 25.0,
        bookClosureDate: "2019-11-13",
        status: "Distributed"
      },
      {
        fiscalYear: "2074/75",
        bonusDividendPercent: 20.0,
        cashDividendPercent: 5.0,
        totalDividendPercent: 25.0,
        bookClosureDate: "2019-01-03",
        status: "Distributed"
      },
      {
        fiscalYear: "2073/74",
        bonusDividendPercent: 15.0,
        cashDividendPercent: 10.0,
        totalDividendPercent: 25.0,
        bookClosureDate: "2017-10-23",
        status: "Distributed"
      },
      {
        fiscalYear: "2072/73",
        bonusDividendPercent: 10.0,
        cashDividendPercent: 10.0,
        totalDividendPercent: 20.0,
        bookClosureDate: "2016-12-26",
        status: "Distributed"
      }
    ]
  },
  'CIT': {
    symbol: 'CIT',
    tickerName: "Citizen Investment Trust",
    source: 'ShareBazaar Community API',
    lastUpdated: '2081/82 NEPSE Recorded',
    latestFiscalYear: "2081/82",
    latestCashPercent: 8.0,
    latestBonusPercent: 5.0,
    latestTotalPercent: 13.0,
    cashDividendYield: 0.47,
    totalDividendYield: 0.76,
    bookClosureDate: "2026-01-05",
    hasDividendHistory: true,
    history: [
      {
        fiscalYear: "2081/82",
        bonusDividendPercent: 5.0,
        cashDividendPercent: 8.0,
        totalDividendPercent: 13.0,
        bookClosureDate: "2026-01-05",
        status: "Distributed"
      },
      {
        fiscalYear: "2080/81",
        bonusDividendPercent: 7.0,
        cashDividendPercent: 6.0,
        totalDividendPercent: 13.0,
        bookClosureDate: "2025-01-06",
        status: "Distributed"
      },
      {
        fiscalYear: "2079/80",
        bonusDividendPercent: 14.0,
        cashDividendPercent: 0.7368,
        totalDividendPercent: 14.7368,
        bookClosureDate: "2024-07-04",
        status: "Distributed"
      },
      {
        fiscalYear: "2078/79",
        bonusDividendPercent: 25.0,
        cashDividendPercent: 1.3158,
        totalDividendPercent: 26.3158,
        bookClosureDate: "2023-07-04",
        status: "Distributed"
      },
      {
        fiscalYear: "2077/78",
        bonusDividendPercent: 30.0,
        cashDividendPercent: 1.578,
        totalDividendPercent: 31.578,
        bookClosureDate: "2022-08-10",
        status: "Distributed"
      },
      {
        fiscalYear: "2076/77",
        bonusDividendPercent: 9.0,
        cashDividendPercent: 8.8947,
        totalDividendPercent: 17.8947,
        bookClosureDate: "2021-06-22",
        status: "Distributed"
      },
      {
        fiscalYear: "2075/76",
        bonusDividendPercent: 22.0,
        cashDividendPercent: 1.16,
        totalDividendPercent: 23.16,
        bookClosureDate: "2020-06-24",
        status: "Distributed"
      },
      {
        fiscalYear: "2074/75",
        bonusDividendPercent: 22.0,
        cashDividendPercent: 1.16,
        totalDividendPercent: 23.16,
        bookClosureDate: "2019-09-05",
        status: "Distributed"
      },
      {
        fiscalYear: "2073/74",
        bonusDividendPercent: 22.06,
        cashDividendPercent: 1.16,
        totalDividendPercent: 23.22,
        bookClosureDate: "2018-12-02",
        status: "Distributed"
      },
      {
        fiscalYear: "2072/73",
        bonusDividendPercent: 22.0,
        cashDividendPercent: 1.15,
        totalDividendPercent: 23.15,
        bookClosureDate: "2018-04-05",
        status: "Distributed"
      }
    ]
  },
  'EBL': {
    symbol: 'EBL',
    tickerName: "Everest Bank",
    source: 'ShareBazaar Community API',
    lastUpdated: '2081/82 NEPSE Recorded',
    latestFiscalYear: "2082/83",
    latestCashPercent: 10.0,
    latestBonusPercent: 5.0,
    latestTotalPercent: 15.0,
    cashDividendYield: 1.4,
    totalDividendYield: 2.09,
    bookClosureDate: "",
    hasDividendHistory: true,
    history: [
      {
        fiscalYear: "2082/83",
        bonusDividendPercent: 5.0,
        cashDividendPercent: 10.0,
        totalDividendPercent: 15.0,
        bookClosureDate: "",
        status: "Proposed"
      },
      {
        fiscalYear: "2081/82",
        bonusDividendPercent: 6.0,
        cashDividendPercent: 14.0,
        totalDividendPercent: 20.0,
        bookClosureDate: "2025-10-10",
        status: "Distributed"
      },
      {
        fiscalYear: "2080/81",
        bonusDividendPercent: 10.0,
        cashDividendPercent: 5.53,
        totalDividendPercent: 15.53,
        bookClosureDate: "2024-09-24",
        status: "Distributed"
      },
      {
        fiscalYear: "2079/80",
        bonusDividendPercent: 10.0,
        cashDividendPercent: 10.53,
        totalDividendPercent: 20.53,
        bookClosureDate: "2023-10-03",
        status: "Distributed"
      },
      {
        fiscalYear: "2078/79",
        bonusDividendPercent: 13.0,
        cashDividendPercent: 7.68,
        totalDividendPercent: 20.68,
        bookClosureDate: "2022-11-29",
        status: "Distributed"
      },
      {
        fiscalYear: "2077/78",
        bonusDividendPercent: 6.0,
        cashDividendPercent: 4.32,
        totalDividendPercent: 10.32,
        bookClosureDate: "2021-12-03",
        status: "Distributed"
      },
      {
        fiscalYear: "2076/77",
        bonusDividendPercent: 5.0,
        cashDividendPercent: 5.53,
        totalDividendPercent: 10.53,
        bookClosureDate: "2020-12-25",
        status: "Distributed"
      },
      {
        fiscalYear: "2075/76",
        bonusDividendPercent: 5.0,
        cashDividendPercent: 20.0,
        totalDividendPercent: 25.0,
        bookClosureDate: "2019-12-20",
        status: "Distributed"
      },
      {
        fiscalYear: "2074/75",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 20.0,
        totalDividendPercent: 20.0,
        bookClosureDate: "2018-12-12",
        status: "Distributed"
      },
      {
        fiscalYear: "2073/74",
        bonusDividendPercent: 33.0,
        cashDividendPercent: 1.74,
        totalDividendPercent: 34.74,
        bookClosureDate: "2017-12-28",
        status: "Distributed"
      }
    ]
  },
  'GBBL': {
    symbol: 'GBBL',
    tickerName: "Garima Bikas Bank",
    source: 'ShareBazaar Community API',
    lastUpdated: '2081/82 NEPSE Recorded',
    latestFiscalYear: "2081/82",
    latestCashPercent: 4.53,
    latestBonusPercent: 6.0,
    latestTotalPercent: 10.53,
    cashDividendYield: 1.04,
    totalDividendYield: 2.42,
    bookClosureDate: "2025-11-04",
    hasDividendHistory: true,
    history: [
      {
        fiscalYear: "2081/82",
        bonusDividendPercent: 6.0,
        cashDividendPercent: 4.53,
        totalDividendPercent: 10.53,
        bookClosureDate: "2025-11-04",
        status: "Distributed"
      },
      {
        fiscalYear: "2080/81",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 5.0,
        totalDividendPercent: 5.0,
        bookClosureDate: "2025-01-02",
        status: "Distributed"
      },
      {
        fiscalYear: "2079/80",
        bonusDividendPercent: 9.5,
        cashDividendPercent: 0.5,
        totalDividendPercent: 10.0,
        bookClosureDate: "2024-01-02",
        status: "Distributed"
      },
      {
        fiscalYear: "2078/79",
        bonusDividendPercent: 13.0,
        cashDividendPercent: 1.5,
        totalDividendPercent: 14.5,
        bookClosureDate: "2022-12-23",
        status: "Distributed"
      },
      {
        fiscalYear: "2077/78",
        bonusDividendPercent: 16.0,
        cashDividendPercent: 0.0,
        totalDividendPercent: 16.0,
        bookClosureDate: "2022-03-18",
        status: "Distributed"
      },
      {
        fiscalYear: "2076/77",
        bonusDividendPercent: 13.5,
        cashDividendPercent: 0.71,
        totalDividendPercent: 14.21,
        bookClosureDate: "2021-01-25",
        status: "Distributed"
      },
      {
        fiscalYear: "2075/76",
        bonusDividendPercent: 16.15,
        cashDividendPercent: 0.85,
        totalDividendPercent: 17.0,
        bookClosureDate: "2019-11-29",
        status: "Distributed"
      },
      {
        fiscalYear: "2074/75",
        bonusDividendPercent: 10.0,
        cashDividendPercent: 3.75,
        totalDividendPercent: 13.75,
        bookClosureDate: "2018-09-28",
        status: "Distributed"
      },
      {
        fiscalYear: "2073/74",
        bonusDividendPercent: 15.0,
        cashDividendPercent: 0.0,
        totalDividendPercent: 15.0,
        bookClosureDate: "2017-12-31",
        status: "Distributed"
      },
      {
        fiscalYear: "2072/73",
        bonusDividendPercent: 20.0,
        cashDividendPercent: 0.0,
        totalDividendPercent: 20.0,
        bookClosureDate: "2017-02-05",
        status: "Distributed"
      }
    ]
  },
  'GBIME': {
    symbol: 'GBIME',
    tickerName: "Global Ime Bank",
    source: 'ShareBazaar Community API',
    lastUpdated: '2081/82 NEPSE Recorded',
    latestFiscalYear: "2081/82",
    latestCashPercent: 8.0,
    latestBonusPercent: 0.0,
    latestTotalPercent: 8.0,
    cashDividendYield: 3.2,
    totalDividendYield: 3.2,
    bookClosureDate: "2025-11-02",
    hasDividendHistory: true,
    history: [
      {
        fiscalYear: "2081/82",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 8.0,
        totalDividendPercent: 8.0,
        bookClosureDate: "2025-11-02",
        status: "Distributed"
      },
      {
        fiscalYear: "2080/81",
        bonusDividendPercent: 5.5,
        cashDividendPercent: 0.0,
        totalDividendPercent: 5.5,
        bookClosureDate: "2024-11-24",
        status: "Distributed"
      },
      {
        fiscalYear: "2079/80",
        bonusDividendPercent: 1.0,
        cashDividendPercent: 8.0,
        totalDividendPercent: 9.0,
        bookClosureDate: "2023-11-29",
        status: "Distributed"
      },
      {
        fiscalYear: "2078/79",
        bonusDividendPercent: 3.0,
        cashDividendPercent: 10.6,
        totalDividendPercent: 13.6,
        bookClosureDate: "2022-11-23",
        status: "Distributed"
      },
      {
        fiscalYear: "2075/76",
        bonusDividendPercent: 12.75,
        cashDividendPercent: 12.75,
        totalDividendPercent: 25.5,
        bookClosureDate: "2019-11-07",
        status: "Distributed"
      },
      {
        fiscalYear: "2077/78",
        bonusDividendPercent: 10.0,
        cashDividendPercent: 3.5,
        totalDividendPercent: 13.5,
        bookClosureDate: "2021-11-29",
        status: "Distributed"
      },
      {
        fiscalYear: "2076/77",
        bonusDividendPercent: 14.0,
        cashDividendPercent: 2.0,
        totalDividendPercent: 16.0,
        bookClosureDate: "2020-12-30",
        status: "Distributed"
      },
      {
        fiscalYear: "2074/75",
        bonusDividendPercent: 16.0,
        cashDividendPercent: 0.0,
        totalDividendPercent: 16.0,
        bookClosureDate: "2018-12-28",
        status: "Distributed"
      },
      {
        fiscalYear: "2073/74",
        bonusDividendPercent: 10.0,
        cashDividendPercent: 10.0,
        totalDividendPercent: 20.0,
        bookClosureDate: "2017-10-25",
        status: "Distributed"
      },
      {
        fiscalYear: "2072/73",
        bonusDividendPercent: 16.0,
        cashDividendPercent: 0.0,
        totalDividendPercent: 16.0,
        bookClosureDate: "2017-03-20",
        status: "Distributed"
      }
    ]
  },
  'HDL': {
    symbol: 'HDL',
    tickerName: "Himalayan Distillery",
    source: 'ShareBazaar Community API',
    lastUpdated: '2081/82 NEPSE Recorded',
    latestFiscalYear: "2081/82",
    latestCashPercent: 5.0,
    latestBonusPercent: 20.0,
    latestTotalPercent: 25.0,
    cashDividendYield: 0.43,
    totalDividendYield: 2.14,
    bookClosureDate: "2025-11-06",
    hasDividendHistory: true,
    history: [
      {
        fiscalYear: "2081/82",
        bonusDividendPercent: 20.0,
        cashDividendPercent: 5.0,
        totalDividendPercent: 25.0,
        bookClosureDate: "2025-11-06",
        status: "Distributed"
      },
      {
        fiscalYear: "2080/81",
        bonusDividendPercent: 15.0,
        cashDividendPercent: 5.0,
        totalDividendPercent: 20.0,
        bookClosureDate: "2025-01-03",
        status: "Distributed"
      },
      {
        fiscalYear: "2079/80",
        bonusDividendPercent: 10.0,
        cashDividendPercent: 15.0,
        totalDividendPercent: 25.0,
        bookClosureDate: "2023-12-29",
        status: "Distributed"
      },
      {
        fiscalYear: "2078/79",
        bonusDividendPercent: 60.0,
        cashDividendPercent: 10.0,
        totalDividendPercent: 70.0,
        bookClosureDate: "2023-01-04",
        status: "Distributed"
      },
      {
        fiscalYear: "2077/78",
        bonusDividendPercent: 75.0,
        cashDividendPercent: 25.0,
        totalDividendPercent: 100.0,
        bookClosureDate: "2021-12-31",
        status: "Distributed"
      },
      {
        fiscalYear: "2076/77",
        bonusDividendPercent: 50.0,
        cashDividendPercent: 50.0,
        totalDividendPercent: 100.0,
        bookClosureDate: "2021-01-01",
        status: "Distributed"
      },
      {
        fiscalYear: "2075/76",
        bonusDividendPercent: 50.0,
        cashDividendPercent: 52.63,
        totalDividendPercent: 102.63,
        bookClosureDate: "2019-12-01",
        status: "Distributed"
      },
      {
        fiscalYear: "2075/76",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 68.42,
        totalDividendPercent: 68.42,
        bookClosureDate: "2019-05-31",
        status: "Distributed"
      },
      {
        fiscalYear: "2074/75",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 21.05,
        totalDividendPercent: 21.05,
        bookClosureDate: "2018-12-19",
        status: "Distributed"
      },
      {
        fiscalYear: "2073/74",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 21.05,
        totalDividendPercent: 21.05,
        bookClosureDate: "2017-12-04",
        status: "Distributed"
      }
    ]
  },
  'HIDCL': {
    symbol: 'HIDCL',
    tickerName: "Hydroelectricity Investment and Development Company",
    source: 'ShareBazaar Community API',
    lastUpdated: '2081/82 NEPSE Recorded',
    latestFiscalYear: "2081/82",
    latestCashPercent: 2.0,
    latestBonusPercent: 1.5,
    latestTotalPercent: 3.5,
    cashDividendYield: 0.84,
    totalDividendYield: 1.46,
    bookClosureDate: "2025-12-23",
    hasDividendHistory: true,
    history: [
      {
        fiscalYear: "2081/82",
        bonusDividendPercent: 1.5,
        cashDividendPercent: 2.0,
        totalDividendPercent: 3.5,
        bookClosureDate: "2025-12-23",
        status: "Distributed"
      },
      {
        fiscalYear: "2080/81",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 5.25,
        totalDividendPercent: 5.25,
        bookClosureDate: "2024-12-27",
        status: "Distributed"
      },
      {
        fiscalYear: "2079/80",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 5.263,
        totalDividendPercent: 5.263,
        bookClosureDate: "2024-01-03",
        status: "Distributed"
      },
      {
        fiscalYear: "2078/79",
        bonusDividendPercent: 5.0,
        cashDividendPercent: 0.263,
        totalDividendPercent: 5.263,
        bookClosureDate: "2022-12-29",
        status: "Distributed"
      },
      {
        fiscalYear: "2077/78",
        bonusDividendPercent: 8.0,
        cashDividendPercent: 0.421,
        totalDividendPercent: 8.421,
        bookClosureDate: "2021-12-20",
        status: "Distributed"
      },
      {
        fiscalYear: "2075/76",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 12.0,
        totalDividendPercent: 12.0,
        bookClosureDate: "2020-01-02",
        status: "Distributed"
      },
      {
        fiscalYear: "2074/75",
        bonusDividendPercent: 10.0,
        cashDividendPercent: 0.21,
        totalDividendPercent: 10.21,
        bookClosureDate: "2019-01-01",
        status: "Distributed"
      },
      {
        fiscalYear: "2073/74",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 5.0,
        totalDividendPercent: 5.0,
        bookClosureDate: "2017-12-27",
        status: "Distributed"
      }
    ]
  },
  'HRL': {
    symbol: 'HRL',
    tickerName: "Himalayan Reinsurance Limited",
    source: 'ShareBazaar Community API',
    lastUpdated: '2081/82 NEPSE Recorded',
    latestFiscalYear: "2080/81",
    latestCashPercent: 0.24,
    latestBonusPercent: 4.5,
    latestTotalPercent: 4.74,
    cashDividendYield: 0.05,
    totalDividendYield: 0.91,
    bookClosureDate: "2025-05-25",
    hasDividendHistory: true,
    history: [
      {
        fiscalYear: "2080/81",
        bonusDividendPercent: 4.5,
        cashDividendPercent: 0.24,
        totalDividendPercent: 4.74,
        bookClosureDate: "2025-05-25",
        status: "Distributed"
      },
      {
        fiscalYear: "2079/80",
        bonusDividendPercent: 4.0,
        cashDividendPercent: 0.21,
        totalDividendPercent: 4.21,
        bookClosureDate: "2024-02-19",
        status: "Distributed"
      }
    ]
  },
  'LEC': {
    symbol: 'LEC',
    tickerName: "Liberty Energy Company Limited",
    source: 'ShareBazaar Community API',
    lastUpdated: '2081/82 NEPSE Recorded',
    latestFiscalYear: "None",
    latestCashPercent: 0.0,
    latestBonusPercent: 0.0,
    latestTotalPercent: 0.0,
    cashDividendYield: 0.0,
    totalDividendYield: 0.0,
    bookClosureDate: "",
    hasDividendHistory: false,
    history: [

    ]
  },
  'MFIL': {
    symbol: 'MFIL',
    tickerName: "Manjushree Financial Institution",
    source: 'ShareBazaar Community API',
    lastUpdated: '2081/82 NEPSE Recorded',
    latestFiscalYear: "2081/82",
    latestCashPercent: 15.0,
    latestBonusPercent: 0.0,
    latestTotalPercent: 15.0,
    cashDividendYield: 2.05,
    totalDividendYield: 2.05,
    bookClosureDate: "2025-10-08",
    hasDividendHistory: true,
    history: [
      {
        fiscalYear: "2081/82",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 15.0,
        totalDividendPercent: 15.0,
        bookClosureDate: "2025-10-08",
        status: "Distributed"
      },
      {
        fiscalYear: "2080/81",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 6.35,
        totalDividendPercent: 6.35,
        bookClosureDate: "2024-12-26",
        status: "Distributed"
      },
      {
        fiscalYear: "2079/80",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 5.263,
        totalDividendPercent: 5.263,
        bookClosureDate: "2023-12-27",
        status: "Distributed"
      },
      {
        fiscalYear: "2070/71",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 7.5,
        totalDividendPercent: 7.5,
        bookClosureDate: "2014-10-09",
        status: "Distributed"
      },
      {
        fiscalYear: "2077/78",
        bonusDividendPercent: 40.0,
        cashDividendPercent: 6.0,
        totalDividendPercent: 46.0,
        bookClosureDate: "2021-12-30",
        status: "Distributed"
      },
      {
        fiscalYear: "2076/77",
        bonusDividendPercent: 18.0,
        cashDividendPercent: 5.5,
        totalDividendPercent: 23.5,
        bookClosureDate: "2020-12-30",
        status: "Distributed"
      },
      {
        fiscalYear: "2075/76",
        bonusDividendPercent: 1.75,
        cashDividendPercent: 9.8,
        totalDividendPercent: 11.55,
        bookClosureDate: "2019-12-31",
        status: "Distributed"
      },
      {
        fiscalYear: "2074/75",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 2.9,
        totalDividendPercent: 2.9,
        bookClosureDate: "2018-12-18",
        status: "Distributed"
      },
      {
        fiscalYear: "2073/74",
        bonusDividendPercent: 5.71,
        cashDividendPercent: 0.3008,
        totalDividendPercent: 6.0108,
        bookClosureDate: "2018-06-18",
        status: "Distributed"
      },
      {
        fiscalYear: "2074/75",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 0.0,
        totalDividendPercent: 0.0,
        bookClosureDate: "2018-02-21",
        status: "Distributed"
      }
    ]
  },
  'MNBBL': {
    symbol: 'MNBBL',
    tickerName: "Muktinath Bikas Bank",
    source: 'ShareBazaar Community API',
    lastUpdated: '2081/82 NEPSE Recorded',
    latestFiscalYear: "2081/82",
    latestCashPercent: 4.67,
    latestBonusPercent: 13.53,
    latestTotalPercent: 18.2,
    cashDividendYield: 1.31,
    totalDividendYield: 5.1,
    bookClosureDate: "2025-10-17",
    hasDividendHistory: true,
    history: [
      {
        fiscalYear: "2081/82",
        bonusDividendPercent: 13.53,
        cashDividendPercent: 4.67,
        totalDividendPercent: 18.2,
        bookClosureDate: "2025-10-17",
        status: "Distributed"
      },
      {
        fiscalYear: "2079/80",
        bonusDividendPercent: 9.75,
        cashDividendPercent: 0.5132,
        totalDividendPercent: 10.2632,
        bookClosureDate: "2024-01-04",
        status: "Distributed"
      },
      {
        fiscalYear: "2078/79",
        bonusDividendPercent: 13.5,
        cashDividendPercent: 0.7105,
        totalDividendPercent: 14.2105,
        bookClosureDate: "2023-01-04",
        status: "Distributed"
      },
      {
        fiscalYear: "2077/78",
        bonusDividendPercent: 17.575,
        cashDividendPercent: 0.925,
        totalDividendPercent: 18.5,
        bookClosureDate: "2021-12-01",
        status: "Distributed"
      },
      {
        fiscalYear: "2076/77",
        bonusDividendPercent: 11.25,
        cashDividendPercent: 4.2574,
        totalDividendPercent: 15.5074,
        bookClosureDate: "2020-12-28",
        status: "Distributed"
      },
      {
        fiscalYear: "2075/76",
        bonusDividendPercent: 17.6,
        cashDividendPercent: 0.93,
        totalDividendPercent: 18.53,
        bookClosureDate: "2019-12-09",
        status: "Distributed"
      },
      {
        fiscalYear: "2074/75",
        bonusDividendPercent: 18.25,
        cashDividendPercent: 0.96,
        totalDividendPercent: 19.21,
        bookClosureDate: "2018-12-04",
        status: "Distributed"
      },
      {
        fiscalYear: "2073/74",
        bonusDividendPercent: 20.0,
        cashDividendPercent: 1.05,
        totalDividendPercent: 21.05,
        bookClosureDate: "2017-12-22",
        status: "Distributed"
      },
      {
        fiscalYear: "2072/73",
        bonusDividendPercent: 34.0,
        cashDividendPercent: 0.0,
        totalDividendPercent: 34.0,
        bookClosureDate: "2016-11-09",
        status: "Distributed"
      },
      {
        fiscalYear: "2071/72",
        bonusDividendPercent: 31.0,
        cashDividendPercent: 1.63,
        totalDividendPercent: 32.63,
        bookClosureDate: "2015-12-28",
        status: "Distributed"
      }
    ]
  },
  'NABIL': {
    symbol: 'NABIL',
    tickerName: "Nabil Bank",
    source: 'ShareBazaar Community API',
    lastUpdated: '2081/82 NEPSE Recorded',
    latestFiscalYear: "2081/82",
    latestCashPercent: 12.5,
    latestBonusPercent: 0.0,
    latestTotalPercent: 12.5,
    cashDividendYield: 2.31,
    totalDividendYield: 2.31,
    bookClosureDate: "2025-12-31",
    hasDividendHistory: true,
    history: [
      {
        fiscalYear: "2081/82",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 12.5,
        totalDividendPercent: 12.5,
        bookClosureDate: "2025-12-31",
        status: "Distributed"
      },
      {
        fiscalYear: "2080/81",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 10.0,
        totalDividendPercent: 10.0,
        bookClosureDate: "2024-11-25",
        status: "Distributed"
      },
      {
        fiscalYear: "2079/80",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 11.0,
        totalDividendPercent: 11.0,
        bookClosureDate: "2023-12-15",
        status: "Distributed"
      },
      {
        fiscalYear: "2078/79",
        bonusDividendPercent: 18.5,
        cashDividendPercent: 11.5,
        totalDividendPercent: 30.0,
        bookClosureDate: "2023-01-02",
        status: "Distributed"
      },
      {
        fiscalYear: "2077/78",
        bonusDividendPercent: 33.6,
        cashDividendPercent: 4.4,
        totalDividendPercent: 38.0,
        bookClosureDate: "2021-12-31",
        status: "Distributed"
      },
      {
        fiscalYear: "2076/77",
        bonusDividendPercent: 33.5,
        cashDividendPercent: 1.76,
        totalDividendPercent: 35.26,
        bookClosureDate: "2020-12-30",
        status: "Distributed"
      },
      {
        fiscalYear: "2075/76",
        bonusDividendPercent: 12.0,
        cashDividendPercent: 22.0,
        totalDividendPercent: 34.0,
        bookClosureDate: "2019-12-24",
        status: "Distributed"
      },
      {
        fiscalYear: "2074/75",
        bonusDividendPercent: 12.0,
        cashDividendPercent: 22.0,
        totalDividendPercent: 34.0,
        bookClosureDate: "2019-02-26",
        status: "Distributed"
      },
      {
        fiscalYear: "2073/74",
        bonusDividendPercent: 30.0,
        cashDividendPercent: 18.0,
        totalDividendPercent: 48.0,
        bookClosureDate: "2017-09-12",
        status: "Distributed"
      },
      {
        fiscalYear: "2072/73",
        bonusDividendPercent: 30.0,
        cashDividendPercent: 15.0,
        totalDividendPercent: 45.0,
        bookClosureDate: "2016-09-21",
        status: "Distributed"
      }
    ]
  },
  'NIBLPF': {
    symbol: 'NIBLPF',
    tickerName: "NIBLPF",
    source: 'ShareBazaar Community API',
    lastUpdated: '2081/82 NEPSE Recorded',
    latestFiscalYear: "2079/80",
    latestCashPercent: 6.8,
    latestBonusPercent: 0.0,
    latestTotalPercent: 6.8,
    cashDividendYield: 6.8,
    totalDividendYield: 6.8,
    bookClosureDate: "2023-09-19",
    hasDividendHistory: true,
    history: [
      {
        fiscalYear: "2079/80",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 6.8,
        totalDividendPercent: 6.8,
        bookClosureDate: "2023-09-19",
        status: "Distributed"
      },
      {
        fiscalYear: "2077/78",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 4.2,
        totalDividendPercent: 4.2,
        bookClosureDate: "2022-09-14",
        status: "Distributed"
      },
      {
        fiscalYear: "2078/79",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 50.0,
        totalDividendPercent: 50.0,
        bookClosureDate: "2021-08-13",
        status: "Distributed"
      }
    ]
  },
  'NICA': {
    symbol: 'NICA',
    tickerName: "NIC Asia Bank",
    source: 'ShareBazaar Community API',
    lastUpdated: '2081/82 NEPSE Recorded',
    latestFiscalYear: "2079/80",
    latestCashPercent: 1.5263,
    latestBonusPercent: 29.0,
    latestTotalPercent: 30.5263,
    cashDividendYield: 0.49,
    totalDividendYield: 9.85,
    bookClosureDate: "2023-10-03",
    hasDividendHistory: true,
    history: [
      {
        fiscalYear: "2079/80",
        bonusDividendPercent: 29.0,
        cashDividendPercent: 1.5263,
        totalDividendPercent: 30.5263,
        bookClosureDate: "2023-10-03",
        status: "Distributed"
      },
      {
        fiscalYear: "2076/77",
        bonusDividendPercent: 19.0,
        cashDividendPercent: 1.0,
        totalDividendPercent: 20.0,
        bookClosureDate: "2020-11-25",
        status: "Distributed"
      },
      {
        fiscalYear: "2075/76",
        bonusDividendPercent: 10.0,
        cashDividendPercent: 11.0526,
        totalDividendPercent: 21.0526,
        bookClosureDate: "2019-09-15",
        status: "Distributed"
      },
      {
        fiscalYear: "2074/75",
        bonusDividendPercent: 10.0,
        cashDividendPercent: 0.526,
        totalDividendPercent: 10.526,
        bookClosureDate: "2018-12-05",
        status: "Distributed"
      },
      {
        fiscalYear: "2073/74",
        bonusDividendPercent: 20.0,
        cashDividendPercent: 1.05,
        totalDividendPercent: 21.05,
        bookClosureDate: "2017-09-01",
        status: "Distributed"
      },
      {
        fiscalYear: "2072/73",
        bonusDividendPercent: 26.0,
        cashDividendPercent: 1.37,
        totalDividendPercent: 27.37,
        bookClosureDate: "2016-09-21",
        status: "Distributed"
      },
      {
        fiscalYear: "2071/72",
        bonusDividendPercent: 39.0,
        cashDividendPercent: 2.05,
        totalDividendPercent: 41.05,
        bookClosureDate: "2016-01-10",
        status: "Distributed"
      },
      {
        fiscalYear: "2070/71",
        bonusDividendPercent: 15.0,
        cashDividendPercent: 15.0,
        totalDividendPercent: 30.0,
        bookClosureDate: "2014-12-15",
        status: "Distributed"
      },
      {
        fiscalYear: "2069/70",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 20.0,
        totalDividendPercent: 20.0,
        bookClosureDate: "2014-02-05",
        status: "Distributed"
      },
      {
        fiscalYear: "2068/69",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 25.0,
        totalDividendPercent: 25.0,
        bookClosureDate: "2012-06-29",
        status: "Distributed"
      }
    ]
  },
  'NLIC': {
    symbol: 'NLIC',
    tickerName: "Nepal Life Insurance",
    source: 'ShareBazaar Community API',
    lastUpdated: '2081/82 NEPSE Recorded',
    latestFiscalYear: "2081/82",
    latestCashPercent: 16.05,
    latestBonusPercent: 5.0,
    latestTotalPercent: 21.05,
    cashDividendYield: 2.31,
    totalDividendYield: 3.02,
    bookClosureDate: "2025-12-22",
    hasDividendHistory: true,
    history: [
      {
        fiscalYear: "2081/82",
        bonusDividendPercent: 5.0,
        cashDividendPercent: 16.05,
        totalDividendPercent: 21.05,
        bookClosureDate: "2025-12-22",
        status: "Distributed"
      },
      {
        fiscalYear: "2080/81",
        bonusDividendPercent: 10.0,
        cashDividendPercent: 11.05,
        totalDividendPercent: 21.05,
        bookClosureDate: "2025-01-23",
        status: "Distributed"
      },
      {
        fiscalYear: "2079/80",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 21.05,
        totalDividendPercent: 21.05,
        bookClosureDate: "2024-06-18",
        status: "Distributed"
      },
      {
        fiscalYear: "2077/78",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 15.7895,
        totalDividendPercent: 15.7895,
        bookClosureDate: "2022-11-04",
        status: "Distributed"
      },
      {
        fiscalYear: "2076/77",
        bonusDividendPercent: 14.0,
        cashDividendPercent: 0.7368,
        totalDividendPercent: 14.7368,
        bookClosureDate: "2022-03-21",
        status: "Distributed"
      },
      {
        fiscalYear: "2075/76",
        bonusDividendPercent: 31.0,
        cashDividendPercent: 20.0,
        totalDividendPercent: 51.0,
        bookClosureDate: "2021-01-27",
        status: "Distributed"
      },
      {
        fiscalYear: "2074/75",
        bonusDividendPercent: 25.0,
        cashDividendPercent: 23.5,
        totalDividendPercent: 48.5,
        bookClosureDate: "2019-05-02",
        status: "Distributed"
      },
      {
        fiscalYear: "2073/74",
        bonusDividendPercent: 42.0,
        cashDividendPercent: 28.53,
        totalDividendPercent: 70.53,
        bookClosureDate: "2018-03-28",
        status: "Distributed"
      },
      {
        fiscalYear: "2072/73",
        bonusDividendPercent: 25.0,
        cashDividendPercent: 1.32,
        totalDividendPercent: 26.32,
        bookClosureDate: "2017-03-13",
        status: "Distributed"
      },
      {
        fiscalYear: "2071/72",
        bonusDividendPercent: 25.0,
        cashDividendPercent: 1.32,
        totalDividendPercent: 26.32,
        bookClosureDate: "2016-04-28",
        status: "Distributed"
      }
    ]
  },
  'NTC': {
    symbol: 'NTC',
    tickerName: "Nepal Doorsanchar Company",
    source: 'ShareBazaar Community API',
    lastUpdated: '2081/82 NEPSE Recorded',
    latestFiscalYear: "2081/82",
    latestCashPercent: 30.0,
    latestBonusPercent: 0.0,
    latestTotalPercent: 30.0,
    cashDividendYield: 3.41,
    totalDividendYield: 3.41,
    bookClosureDate: "2026-01-04",
    hasDividendHistory: true,
    history: [
      {
        fiscalYear: "2081/82",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 30.0,
        totalDividendPercent: 30.0,
        bookClosureDate: "2026-01-04",
        status: "Distributed"
      },
      {
        fiscalYear: "2080/81",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 30.0,
        totalDividendPercent: 30.0,
        bookClosureDate: "2025-01-02",
        status: "Distributed"
      },
      {
        fiscalYear: "2079/80",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 40.0,
        totalDividendPercent: 40.0,
        bookClosureDate: "2024-01-04",
        status: "Distributed"
      },
      {
        fiscalYear: "2078/79",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 40.0,
        totalDividendPercent: 40.0,
        bookClosureDate: "2023-01-02",
        status: "Distributed"
      },
      {
        fiscalYear: "2077/78",
        bonusDividendPercent: 20.0,
        cashDividendPercent: 20.0,
        totalDividendPercent: 40.0,
        bookClosureDate: "2022-03-25",
        status: "Distributed"
      },
      {
        fiscalYear: "2076/77",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 40.0,
        totalDividendPercent: 40.0,
        bookClosureDate: "2021-03-12",
        status: "Distributed"
      },
      {
        fiscalYear: "2075/76",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 45.0,
        totalDividendPercent: 45.0,
        bookClosureDate: "2019-12-31",
        status: "Distributed"
      },
      {
        fiscalYear: "2074/75",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 55.0,
        totalDividendPercent: 55.0,
        bookClosureDate: "2018-12-30",
        status: "Distributed"
      },
      {
        fiscalYear: "2073/74",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 55.0,
        totalDividendPercent: 55.0,
        bookClosureDate: "2017-12-31",
        status: "Distributed"
      },
      {
        fiscalYear: "2072/73",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 51.0,
        totalDividendPercent: 51.0,
        bookClosureDate: "2017-02-26",
        status: "Distributed"
      }
    ]
  },
  'SALICO': {
    symbol: 'SALICO',
    tickerName: "Sagarmatha Lumbini Insurance Co. Limited",
    source: 'ShareBazaar Community API',
    lastUpdated: '2081/82 NEPSE Recorded',
    latestFiscalYear: "2081/82",
    latestCashPercent: 15.0,
    latestBonusPercent: 0.0,
    latestTotalPercent: 15.0,
    cashDividendYield: 2.85,
    totalDividendYield: 2.85,
    bookClosureDate: "2026-01-04",
    hasDividendHistory: true,
    history: [
      {
        fiscalYear: "2081/82",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 15.0,
        totalDividendPercent: 15.0,
        bookClosureDate: "2026-01-04",
        status: "Distributed"
      },
      {
        fiscalYear: "2080/81",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 15.0,
        totalDividendPercent: 15.0,
        bookClosureDate: "2025-04-30",
        status: "Distributed"
      },
      {
        fiscalYear: "2079/80",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 5.0,
        totalDividendPercent: 5.0,
        bookClosureDate: "2024-03-26",
        status: "Distributed"
      },
      {
        fiscalYear: "2078/79",
        bonusDividendPercent: 12.4,
        cashDividendPercent: 0.6526,
        totalDividendPercent: 13.0526,
        bookClosureDate: "2023-02-10",
        status: "Distributed"
      },
      {
        fiscalYear: "2077/78",
        bonusDividendPercent: 20.0,
        cashDividendPercent: 1.0526,
        totalDividendPercent: 21.0526,
        bookClosureDate: "2022-04-29",
        status: "Distributed"
      },
      {
        fiscalYear: "2076/77",
        bonusDividendPercent: 11.0,
        cashDividendPercent: 0.5789,
        totalDividendPercent: 11.5789,
        bookClosureDate: "2021-07-01",
        status: "Distributed"
      },
      {
        fiscalYear: "2074/75",
        bonusDividendPercent: 86.0,
        cashDividendPercent: 0.0,
        totalDividendPercent: 86.0,
        bookClosureDate: "2019-06-16",
        status: "Distributed"
      },
      {
        fiscalYear: "2072/73",
        bonusDividendPercent: 22.0,
        cashDividendPercent: 1.1579,
        totalDividendPercent: 23.1579,
        bookClosureDate: "2016-12-28",
        status: "Distributed"
      },
      {
        fiscalYear: "2071/72",
        bonusDividendPercent: 23.75,
        cashDividendPercent: 1.25,
        totalDividendPercent: 25.0,
        bookClosureDate: "2016-06-30",
        status: "Distributed"
      },
      {
        fiscalYear: "2070/71",
        bonusDividendPercent: 15.0,
        cashDividendPercent: 0.79,
        totalDividendPercent: 15.79,
        bookClosureDate: "2015-07-01",
        status: "Distributed"
      }
    ]
  },
  'SCB': {
    symbol: 'SCB',
    tickerName: "Standard Chartered Bank",
    source: 'ShareBazaar Community API',
    lastUpdated: '2081/82 NEPSE Recorded',
    latestFiscalYear: "2081/82",
    latestCashPercent: 19.0,
    latestBonusPercent: 0.0,
    latestTotalPercent: 19.0,
    cashDividendYield: 2.95,
    totalDividendYield: 2.95,
    bookClosureDate: "2025-12-02",
    hasDividendHistory: true,
    history: [
      {
        fiscalYear: "2081/82",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 19.0,
        totalDividendPercent: 19.0,
        bookClosureDate: "2025-12-02",
        status: "Distributed"
      },
      {
        fiscalYear: "2080/81",
        bonusDividendPercent: 6.5,
        cashDividendPercent: 19.0,
        totalDividendPercent: 25.5,
        bookClosureDate: "2024-11-27",
        status: "Distributed"
      },
      {
        fiscalYear: "2079/80",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 19.0,
        totalDividendPercent: 19.0,
        bookClosureDate: "2023-11-23",
        status: "Distributed"
      },
      {
        fiscalYear: "2078/79",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 16.15,
        totalDividendPercent: 16.15,
        bookClosureDate: "2022-11-23",
        status: "Distributed"
      },
      {
        fiscalYear: "2077/78",
        bonusDividendPercent: 10.0,
        cashDividendPercent: 3.06,
        totalDividendPercent: 13.06,
        bookClosureDate: "2021-11-26",
        status: "Distributed"
      },
      {
        fiscalYear: "2076/77",
        bonusDividendPercent: 7.0,
        cashDividendPercent: 4.84,
        totalDividendPercent: 11.84,
        bookClosureDate: "2020-12-24",
        status: "Distributed"
      },
      {
        fiscalYear: "2075/76",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 22.5,
        totalDividendPercent: 22.5,
        bookClosureDate: "2019-11-25",
        status: "Distributed"
      },
      {
        fiscalYear: "2074/75",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 17.5,
        totalDividendPercent: 17.5,
        bookClosureDate: "2019-01-13",
        status: "Distributed"
      },
      {
        fiscalYear: "2073/74",
        bonusDividendPercent: 100.0,
        cashDividendPercent: 5.26,
        totalDividendPercent: 105.26,
        bookClosureDate: "2017-12-31",
        status: "Distributed"
      },
      {
        fiscalYear: "2072/73",
        bonusDividendPercent: 33.33,
        cashDividendPercent: 0.0,
        totalDividendPercent: 33.33,
        bookClosureDate: "2016-12-07",
        status: "Distributed"
      }
    ]
  },
  'SHIVM': {
    symbol: 'SHIVM',
    tickerName: "Shivam Cements Ltd",
    source: 'ShareBazaar Community API',
    lastUpdated: '2081/82 NEPSE Recorded',
    latestFiscalYear: "2081/82",
    latestCashPercent: 10.0,
    latestBonusPercent: 2.5,
    latestTotalPercent: 12.5,
    cashDividendYield: 1.51,
    totalDividendYield: 1.89,
    bookClosureDate: "2025-11-27",
    hasDividendHistory: true,
    history: [
      {
        fiscalYear: "2081/82",
        bonusDividendPercent: 2.5,
        cashDividendPercent: 10.0,
        totalDividendPercent: 12.5,
        bookClosureDate: "2025-11-27",
        status: "Distributed"
      },
      {
        fiscalYear: "2080/81",
        bonusDividendPercent: 8.55,
        cashDividendPercent: 0.45,
        totalDividendPercent: 9.0,
        bookClosureDate: "2025-01-01",
        status: "Distributed"
      },
      {
        fiscalYear: "2079/80",
        bonusDividendPercent: 14.25,
        cashDividendPercent: 0.75,
        totalDividendPercent: 15.0,
        bookClosureDate: "2024-01-04",
        status: "Distributed"
      },
      {
        fiscalYear: "2078/79",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 10.53,
        totalDividendPercent: 10.53,
        bookClosureDate: "2023-01-04",
        status: "Distributed"
      },
      {
        fiscalYear: "2077/78",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 29.0,
        totalDividendPercent: 29.0,
        bookClosureDate: "2021-10-25",
        status: "Distributed"
      },
      {
        fiscalYear: "2076/77",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 24.21,
        totalDividendPercent: 24.21,
        bookClosureDate: "2020-10-29",
        status: "Distributed"
      },
      {
        fiscalYear: "2075/76",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 15.7895,
        totalDividendPercent: 15.7895,
        bookClosureDate: "2019-10-16",
        status: "Distributed"
      },
      {
        fiscalYear: "2074/75",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 15.7895,
        totalDividendPercent: 15.7895,
        bookClosureDate: "2019-04-09",
        status: "Distributed"
      }
    ]
  },
  'SHL': {
    symbol: 'SHL',
    tickerName: "Soaltee Hotel",
    source: 'ShareBazaar Community API',
    lastUpdated: '2081/82 NEPSE Recorded',
    latestFiscalYear: "2081/82",
    latestCashPercent: 16.5789,
    latestBonusPercent: 15.0,
    latestTotalPercent: 31.5789,
    cashDividendYield: 3.3,
    totalDividendYield: 6.29,
    bookClosureDate: "2025-11-21",
    hasDividendHistory: true,
    history: [
      {
        fiscalYear: "2081/82",
        bonusDividendPercent: 15.0,
        cashDividendPercent: 16.5789,
        totalDividendPercent: 31.5789,
        bookClosureDate: "2025-11-21",
        status: "Distributed"
      },
      {
        fiscalYear: "2080/81",
        bonusDividendPercent: 10.0,
        cashDividendPercent: 26.8421,
        totalDividendPercent: 36.8421,
        bookClosureDate: "2024-11-28",
        status: "Distributed"
      },
      {
        fiscalYear: "2079/80",
        bonusDividendPercent: 5.0,
        cashDividendPercent: 26.5789,
        totalDividendPercent: 31.5789,
        bookClosureDate: "2023-12-21",
        status: "Distributed"
      },
      {
        fiscalYear: "2078/79",
        bonusDividendPercent: 5.0,
        cashDividendPercent: 21.315,
        totalDividendPercent: 26.315,
        bookClosureDate: "2022-12-22",
        status: "Distributed"
      },
      {
        fiscalYear: "2075/76",
        bonusDividendPercent: 15.0,
        cashDividendPercent: 11.3157,
        totalDividendPercent: 26.3157,
        bookClosureDate: "2019-12-11",
        status: "Distributed"
      },
      {
        fiscalYear: "2074/75",
        bonusDividendPercent: 10.0,
        cashDividendPercent: 16.3158,
        totalDividendPercent: 26.3158,
        bookClosureDate: "2018-12-12",
        status: "Distributed"
      },
      {
        fiscalYear: "2073/74",
        bonusDividendPercent: 15.0,
        cashDividendPercent: 6.0526,
        totalDividendPercent: 21.0526,
        bookClosureDate: "2017-11-20",
        status: "Distributed"
      },
      {
        fiscalYear: "2072/73",
        bonusDividendPercent: 10.0,
        cashDividendPercent: 11.0526,
        totalDividendPercent: 21.0526,
        bookClosureDate: "2016-12-12",
        status: "Distributed"
      },
      {
        fiscalYear: "2071/72",
        bonusDividendPercent: 25.0,
        cashDividendPercent: 65.8,
        totalDividendPercent: 90.8,
        bookClosureDate: "2015-12-16",
        status: "Distributed"
      },
      {
        fiscalYear: "2070/71",
        bonusDividendPercent: 40.0,
        cashDividendPercent: 17.89,
        totalDividendPercent: 57.89,
        bookClosureDate: "2014-12-14",
        status: "Distributed"
      }
    ]
  },
  'SKBBL': {
    symbol: 'SKBBL',
    tickerName: "Sana Kisan Bikas Bank",
    source: 'ShareBazaar Community API',
    lastUpdated: '2081/82 NEPSE Recorded',
    latestFiscalYear: "2081/82",
    latestCashPercent: 0.75,
    latestBonusPercent: 14.25,
    latestTotalPercent: 15.0,
    cashDividendYield: 0.1,
    totalDividendYield: 2.02,
    bookClosureDate: "2025-12-24",
    hasDividendHistory: true,
    history: [
      {
        fiscalYear: "2081/82",
        bonusDividendPercent: 14.25,
        cashDividendPercent: 0.75,
        totalDividendPercent: 15.0,
        bookClosureDate: "2025-12-24",
        status: "Distributed"
      },
      {
        fiscalYear: "2080/81",
        bonusDividendPercent: 13.3,
        cashDividendPercent: 0.7,
        totalDividendPercent: 14.0,
        bookClosureDate: "2025-01-01",
        status: "Distributed"
      },
      {
        fiscalYear: "2079/80",
        bonusDividendPercent: 14.25,
        cashDividendPercent: 0.75,
        totalDividendPercent: 15.0,
        bookClosureDate: "2024-01-01",
        status: "Distributed"
      },
      {
        fiscalYear: "2078/79",
        bonusDividendPercent: 26.0,
        cashDividendPercent: 1.3684,
        totalDividendPercent: 27.3684,
        bookClosureDate: "2023-03-12",
        status: "Distributed"
      },
      {
        fiscalYear: "2077/78",
        bonusDividendPercent: 25.0,
        cashDividendPercent: 1.315,
        totalDividendPercent: 26.315,
        bookClosureDate: "2021-12-20",
        status: "Distributed"
      },
      {
        fiscalYear: "2076/77",
        bonusDividendPercent: 25.0,
        cashDividendPercent: 1.315,
        totalDividendPercent: 26.315,
        bookClosureDate: "2020-12-31",
        status: "Distributed"
      },
      {
        fiscalYear: "2075/76",
        bonusDividendPercent: 27.25,
        cashDividendPercent: 1.434,
        totalDividendPercent: 28.684,
        bookClosureDate: "2019-12-30",
        status: "Distributed"
      },
      {
        fiscalYear: "2074/75",
        bonusDividendPercent: 25.0,
        cashDividendPercent: 1.317,
        totalDividendPercent: 26.317,
        bookClosureDate: "2019-01-17",
        status: "Distributed"
      },
      {
        fiscalYear: "2073/74",
        bonusDividendPercent: 25.0,
        cashDividendPercent: 1.316,
        totalDividendPercent: 26.316,
        bookClosureDate: "2017-11-26",
        status: "Distributed"
      },
      {
        fiscalYear: "2072/73",
        bonusDividendPercent: 25.0,
        cashDividendPercent: 1.316,
        totalDividendPercent: 26.316,
        bookClosureDate: "2016-12-29",
        status: "Distributed"
      }
    ]
  },
  'SONA': {
    symbol: 'SONA',
    tickerName: "Sonapur Minerals And Oil Limited",
    source: 'ShareBazaar Community API',
    lastUpdated: '2081/82 NEPSE Recorded',
    latestFiscalYear: "None",
    latestCashPercent: 0.0,
    latestBonusPercent: 0.0,
    latestTotalPercent: 0.0,
    cashDividendYield: 0.0,
    totalDividendYield: 0.0,
    bookClosureDate: "",
    hasDividendHistory: false,
    history: [

    ]
  },
  'STC': {
    symbol: 'STC',
    tickerName: "Salt Trading Corporation",
    source: 'ShareBazaar Community API',
    lastUpdated: '2081/82 NEPSE Recorded',
    latestFiscalYear: "2081/82",
    latestCashPercent: 0.5,
    latestBonusPercent: 9.5,
    latestTotalPercent: 10.0,
    cashDividendYield: 0.01,
    totalDividendYield: 0.19,
    bookClosureDate: "2026-05-27",
    hasDividendHistory: true,
    history: [
      {
        fiscalYear: "2081/82",
        bonusDividendPercent: 9.5,
        cashDividendPercent: 0.5,
        totalDividendPercent: 10.0,
        bookClosureDate: "2026-05-27",
        status: "Distributed"
      },
      {
        fiscalYear: "2080/81",
        bonusDividendPercent: 0.0,
        cashDividendPercent: 10.0,
        totalDividendPercent: 10.0,
        bookClosureDate: "2025-03-14",
        status: "Distributed"
      },
      {
        fiscalYear: "2079/80",
        bonusDividendPercent: 15.0,
        cashDividendPercent: 0.79,
        totalDividendPercent: 15.79,
        bookClosureDate: "2024-03-22",
        status: "Distributed"
      },
      {
        fiscalYear: "2078/79",
        bonusDividendPercent: 10.0,
        cashDividendPercent: 5.0,
        totalDividendPercent: 15.0,
        bookClosureDate: "2023-03-10",
        status: "Distributed"
      },
      {
        fiscalYear: "2077/78",
        bonusDividendPercent: 10.0,
        cashDividendPercent: 0.526,
        totalDividendPercent: 10.526,
        bookClosureDate: "2022-03-29",
        status: "Distributed"
      },
      {
        fiscalYear: "2076/77",
        bonusDividendPercent: 20.0,
        cashDividendPercent: 5.0,
        totalDividendPercent: 25.0,
        bookClosureDate: "2021-10-19",
        status: "Distributed"
      },
      {
        fiscalYear: "2075/76",
        bonusDividendPercent: 25.0,
        cashDividendPercent: 10.0,
        totalDividendPercent: 35.0,
        bookClosureDate: "2020-11-30",
        status: "Distributed"
      },
      {
        fiscalYear: "2074/75",
        bonusDividendPercent: 25.0,
        cashDividendPercent: 10.0,
        totalDividendPercent: 35.0,
        bookClosureDate: "2019-03-08",
        status: "Distributed"
      },
      {
        fiscalYear: "2073/74",
        bonusDividendPercent: 25.0,
        cashDividendPercent: 10.0,
        totalDividendPercent: 35.0,
        bookClosureDate: "2018-02-20",
        status: "Distributed"
      },
      {
        fiscalYear: "2072/73",
        bonusDividendPercent: 20.0,
        cashDividendPercent: 5.0,
        totalDividendPercent: 25.0,
        bookClosureDate: "2017-06-28",
        status: "Distributed"
      }
    ]
  },
  'UPPER': {
    symbol: 'UPPER',
    tickerName: "Upper Tamakoshi Hydropower Ltd",
    source: 'ShareBazaar Community API',
    lastUpdated: '2081/82 NEPSE Recorded',
    latestFiscalYear: "None",
    latestCashPercent: 0.0,
    latestBonusPercent: 0.0,
    latestTotalPercent: 0.0,
    cashDividendYield: 0.0,
    totalDividendYield: 0.0,
    bookClosureDate: "",
    hasDividendHistory: false,
    history: [

    ]
  },
};

/**
 * Returns ShareBazaar Community API verified dividend info for a given symbol
 */
export function getShareBazaarDividend(symbol: string): ShareBazaarDividendInfo | undefined {
  const upper = symbol.toUpperCase().trim();
  return SHAREBAZAAR_DIVIDENDS[upper];
}

/**
 * Computes exact dividend yield based on live market price and ShareBazaar data
 */
export function calculateLiveDividendYield(
  symbol: string, 
  currentPrice: number, 
  faceValue = 100
): { cashYield: number; totalYield: number; cashPercent: number; bonusPercent: number; fiscalYear: string } {
  const info = getShareBazaarDividend(symbol);
  if (!info || currentPrice <= 0 || !info.hasDividendHistory) {
    return { cashYield: 0, totalYield: 0, cashPercent: 0, bonusPercent: 0, fiscalYear: 'N/A' };
  }

  const effectiveFaceValue = symbol === 'NIBLPF' ? 10 : faceValue;
  const cashDps = (info.latestCashPercent * effectiveFaceValue) / 100;
  const totalDps = ((info.latestCashPercent + info.latestBonusPercent) * effectiveFaceValue) / 100;

  return {
    cashYield: Number(((cashDps / currentPrice) * 100).toFixed(2)),
    totalYield: Number(((totalDps / currentPrice) * 100).toFixed(2)),
    cashPercent: info.latestCashPercent,
    bonusPercent: info.latestBonusPercent,
    fiscalYear: info.latestFiscalYear
  };
}
