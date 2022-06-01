export interface RollSettings {
  [key: string]: {
    [key: string]: string;
  };
}

export interface Condition {
  value: string;
  duration: number;
  end: "eot" | "eor";
}

export interface TrackerItem {
  name: string;
  value: number;
  current?: boolean;
  conditions?: Condition[];
}

export interface Tracker {
  entries: TrackerItem[];
  sorted?: boolean;
}
