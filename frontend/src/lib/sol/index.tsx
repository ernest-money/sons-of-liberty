import {
  RegisterParams,
  LoginParams,
  ForgotParams,
  ResetParams,
  MagicLinkParams,
  LoginResponse,
  CurrentResponse,
} from "./auth";
import { InfoResponse } from "./info";
import { Peer } from "./peers";
import { SendOfferBody, AcceptOfferBody, AcceptOfferResponse } from "./offers";
import { WalletAddress, Transaction, UTXO } from "./wallet";
import { ContractFilter } from "./contracts";

export class SolClient {
  private baseUrl: string;
  private token?: string;

  constructor(baseUrl: string, token?: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      credentials: "include",
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth Methods
  async register(params: RegisterParams): Promise<void> {
    return this.fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  async login(params: LoginParams): Promise<LoginResponse> {
    return this.fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  async verify(token: string): Promise<void> {
    return this.fetch(`/api/auth/verify/${token}`);
  }

  async forgot(params: ForgotParams): Promise<void> {
    return this.fetch("/api/auth/forgot", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  async reset(params: ResetParams): Promise<void> {
    return this.fetch("/api/auth/reset", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  async current(): Promise<CurrentResponse> {
    return this.fetch("/api/auth/current");
  }

  async magicLink(params: MagicLinkParams): Promise<void> {
    return this.fetch("/api/auth/magic-link", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  async magicLinkVerify(token: string): Promise<LoginResponse> {
    return this.fetch(`/api/auth/magic-link/${token}`);
  }

  // Info Methods
  async getInfo(): Promise<InfoResponse> {
    return this.fetch("/api/info");
  }

  // Peers Methods
  async getPeers(): Promise<Peer[]> {
    return this.fetch("/api/peers");
  }

  // Offers Methods
  async getOffers(offerId?: string): Promise<any> {
    const endpoint = offerId ? `/api/offers?id=${offerId}` : "/api/offers";
    return this.fetch(endpoint);
  }

  async sendOffer(body: SendOfferBody): Promise<any> {
    return this.fetch("/api/offers", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async acceptOffer(body: AcceptOfferBody): Promise<AcceptOfferResponse> {
    return this.fetch("/api/offers/accept", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  // Wallet Methods
  async getNewAddress(): Promise<WalletAddress> {
    return this.fetch("/api/wallet/address", {
      method: "POST",
    });
  }

  async getTransactions(): Promise<Transaction[]> {
    return this.fetch("/api/wallet/transactions");
  }

  async getUtxos(): Promise<UTXO[]> {
    return this.fetch("/api/wallet/utxos");
  }

  // Balance Methods
  async getBalance(): Promise<any> {
    return this.fetch("/api/balance");
  }

  // Contracts Methods
  async getContracts(params?: {
    id?: string;
    filter?: ContractFilter;
  }): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params?.id) searchParams.append("id", params.id);
    if (params?.filter) searchParams.append("filter", params.filter);

    const endpoint = `/api/contracts${searchParams.toString() ? "?" + searchParams.toString() : ""
      }`;
    return this.fetch(endpoint);
  }
}
