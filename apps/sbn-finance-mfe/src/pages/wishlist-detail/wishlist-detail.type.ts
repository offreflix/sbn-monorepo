export type WishlistDetailPriceForm = {
  cashPrice: number;
  store: string;
  storeUrl: string;
  date: string;
  notes: string;
  currency: string;
  installmentCount: number;
  installmentValue: number;
};

export type WishlistDetailPriorityForm = {
  priority: "LOW" | "MEDIUM" | "HIGH";
  date: string;
  notes: string;
};

export type WishlistDetailEditForm = {
  name: string;
  description: string;
  imageUrl: string;
  url: string;
  tags: string;
  notes: string;
};
