import React, { createContext, useContext, useMemo, useState, FC, useEffect } from 'react';
import axios from 'axios';
import { SolBalance, Contract } from '@/types';
import { ForgotParams, LoginParams, LoginResponse, MagicLinkParams, RegisterParams, ResetParams } from '@/lib/sol/auth';
import { InfoResponse } from '@/lib/sol/info';
import { MarketStats } from '@/lib/sol/market';
import { Peer } from '@/lib/sol/peers';
import { ContractFilter } from '@/lib/sol/contracts';
import init from '@dlcdevkit/ddk-wasm';
interface SendOfferBody {
  counterparty: string;
  collateral: number;
  offer_amount: number;
  event_ids: string[];
}

interface AcceptOfferBody {
  contract_id: string;
  accept_amount: number;
}

export interface SolContextType {
  wasmInitialized: boolean;
  setToken: (token?: string) => void;
  register: (params: RegisterParams) => Promise<void>;
  login: (params: LoginParams) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  verify: () => Promise<void>;
  forgot: (params: ForgotParams) => Promise<void>;
  reset: (params: ResetParams) => Promise<void>;
  current: () => Promise<any>;
  magicLink: (params: MagicLinkParams) => Promise<void>;
  magicLinkVerify: (token: string) => Promise<LoginResponse>;
  getInfo: () => Promise<InfoResponse>;
  getPeers: () => Promise<Peer[]>;
  getOffers: (offerId?: string) => Promise<any>;
  sendOffer: (body: SendOfferBody) => Promise<any>;
  acceptOffer: (body: AcceptOfferBody) => Promise<any>;
  getNewAddress: () => Promise<{ address: string }>;
  getTransactions: () => Promise<any>;
  getUtxos: () => Promise<any>;
  getBalance: () => Promise<SolBalance>;
  getContracts: (params?: { id?: string; filter?: ContractFilter }) => Promise<Contract[]>;
  getMarketStats: () => Promise<MarketStats[]>;
}

interface SolProviderProps {
  children: React.ReactNode;
  baseUrl: string;
}

const SolContext = createContext<SolContextType | null>(null);

export const useSol = () => {
  const context = useContext(SolContext);
  if (!context) {
    throw new Error('useSol must be used within a SolProvider');
  }
  return context;
};

export const SolProvider: FC<SolProviderProps> = ({ children, baseUrl }) => {
  const [initialized, setInitialized] = useState(false);
  const [token, setToken] = useState<string>();
  useEffect(() => {
    const initWasm = async () => {
      await init();
      setInitialized(true);
    }
    initWasm();
  }, []);

  const instance = useMemo(() => {
    const axiosInstance = axios.create({
      baseURL: "/",
      withCredentials: true,
    });

    axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          throw new Error('Unauthorized');
        }
        throw error;
      }
    );

    return axiosInstance;
  }, [baseUrl, token]);


  const value: SolContextType = useMemo(() => ({
    wasmInitialized: initialized,
    setToken,
    register: async (params: RegisterParams) => {
      await instance.post('/api/auth/register', params);
    },
    login: async (params: LoginParams) => {
      const data = await instance.post<LoginResponse>('/api/auth/login', params);
      return data.data;
    },
    logout: async () => {
      await instance.post('/api/auth/logout');
    },
    verify: async () => {
      await instance.get('/api/auth/verify');
    },
    forgot: async (params: ForgotParams) => {
      await instance.post('/api/auth/forgot', params);
    },
    reset: async (params: ResetParams) => {
      await instance.post('/api/auth/reset', params);
    },
    current: async () => {
      const { data } = await instance.get('/api/auth/current');
      return data;
    },
    magicLink: async (params: MagicLinkParams) => {
      await instance.post('/api/auth/magic-link', params);
    },
    magicLinkVerify: async (token: string) => {
      const { data } = await instance.get<LoginResponse>(`/api/auth/magic-link/${token}`);
      return data;
    },
    getInfo: async () => {
      const { data } = await instance.get<InfoResponse>('/api/info');
      return data;
    },
    getPeers: async () => {
      const { data } = await instance.get<Peer[]>('/api/peers');
      return data;
    },
    getOffers: async (offerId?: string) => {
      const endpoint = offerId ? `/api/offers?id=${offerId}` : '/api/offers';
      const { data } = await instance.get(endpoint);
      return data;
    },
    sendOffer: async (body: SendOfferBody) => {
      const { data } = await instance.post('/api/offers', body);
      return data;
    },
    acceptOffer: async (body: AcceptOfferBody) => {
      const { data } = await instance.post('/api/offers/accept', body);
      return data;
    },
    getNewAddress: async () => {
      const { data } = await instance.post('/api/wallet/address');
      return data;
    },
    getTransactions: async () => {
      const { data } = await instance.get('/api/wallet/transactions');
      return data;
    },
    getUtxos: async () => {
      const { data } = await instance.get('/api/wallet/utxos');
      return data;
    },
    getBalance: async () => {
      const { data } = await instance.get<SolBalance>('/api/balance');
      return data;
    },
    getContracts: async (params?: { id?: string; filter?: ContractFilter }) => {
      const searchParams = new URLSearchParams();
      if (params?.id) searchParams.append('id', params.id);
      if (params?.filter) searchParams.append('filter', JSON.stringify(params.filter));
      const { data } = await instance.get<Contract[]>(`/api/contracts`);
      return data;
    },
    getMarketStats: async () => {
      const { data } = await instance.get<MarketStats[]>('/api/market/hashrates');
      return data;
    },
  }), [instance, token]);

  return <SolContext.Provider value={value}>{children}</SolContext.Provider>;
};
