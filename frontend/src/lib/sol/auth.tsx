export interface RegisterParams {
  email: string;
  password: string;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface ForgotParams {
  email: string;
}

export interface ResetParams {
  token: string;
  password: string;
}

export interface MagicLinkParams {
  email: string;
}

export interface LoginResponse {
  token: string;
}

export interface CurrentResponse {
  id: string;
  email: string;
}
