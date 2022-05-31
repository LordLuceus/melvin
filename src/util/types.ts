export interface RollSettings {
  [key: string]: {
    [key: string]: string;
  };
}

export interface TrackerItem {
  name: string;
  value: number;
  tied?: boolean;
  tieBreaker?: number;
  current?: boolean;
}

export interface Tracker {
  entries: TrackerItem[];
  sorted?: boolean;
}
