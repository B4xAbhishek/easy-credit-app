export type MobileAuthResponse = {
  ok: true;
  token: string;
  expiresAt: number;
  redirectTo: 'home' | 'orders';
  user: {
    userId: string;
    phone: string | null;
    email: string | null;
    repeatCustomer: boolean;
  };
};

export type MeResponse = {
  userId: string | null;
  phone: string | null;
  email: string | null;
  repeatCustomer: boolean;
  accountLabel: string;
};

export type HomeRecommendation = {
  id: string;
  detailProductId?: string;
  detail_product_id?: string;
  productName: string;
  amountRupees: number;
  status: string;
  statusVariant: 'settled' | 'active' | 'pending';
};

export type HomeResponse = {
  featuredAmountRange: string;
  recommendations: HomeRecommendation[];
};

export type OrdersLoan = {
  id: string;
  /** Prefer this for GET `/api/mobile/orders/:id` when the API provides it. */
  detailProductId?: string;
  /** Some APIs expose this as snake_case; prefer over `id` for detail fetch when present. */
  detail_product_id?: string;
  productName: string;
  amountRupees: number;
  status: string;
  statusVariant: 'settled' | 'active' | 'pending';
  paymentAmountRupees?: number;
};

export type OrdersResponse = {
  loans: OrdersLoan[];
};

export type OrderDetailResponse = {
  productId: string;
  productName: string;
  loanAmountRupees: number;
  interestFeeRupees: number;
  unpaidAmountRupees: number;
  dueDateDisplay: string;
};

export type PaymentConfigResponse = {
  paymentReceiveUpi: string | null;
};

export type SessionState = {
  token: string;
  expiresAt: number;
  user: MobileAuthResponse['user'];
};

export type AuthContextValue = {
  session: SessionState | null;
  isBootstrapping: boolean;
  signInWithFirebaseToken: (phoneE164: string, idToken: string) => Promise<void>;
  signInWithFallbackCode: (phoneE164: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
};
