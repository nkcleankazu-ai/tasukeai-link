export const categoryLabels: Record<string, string> = {
  money: "お金の支援",
  goods: "物資・食料",
  work: "作業の支援",
  shopping: "買い物",
  cleaning: "掃除",
  cooking: "料理",
  errands: "用事",
  other: "その他"
};

export type HelpRequest = {
  id?: string;
  user_id?: string;
  title?: string;
  description?: string;
  category?: string;
  created_at?: string;
  [key: string]: unknown;
};
