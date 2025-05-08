import React, { createContext, useContext, useMemo, useState, FC, useEffect } from 'react';
import axios from 'axios';
import { SolBalance, Contract, EnumerationContractParams, CreateEnumerationContractResponse, NostrCounterparty, TimePeriod, BalanceHistory } from '@/types';
import { ForgotParams, LoginParams, LoginResponse, MagicLinkParams, RegisterParams, ResetParams } from '@/lib/sol/auth';
import { InfoResponse } from '@/lib/sol/info';
import { MarketStats } from '@/lib/sol/market';
import { Peer } from '@/lib/sol/peers';
import { ContractFilter } from '@/lib/sol/contracts';
import { ParlayParameter } from '@/contexts/ParlayContext';
import { CombinationMethod } from '@/types/chart-data-types';
import config from '@/config';

interface SendOfferBody {
  counterparty: string;
  collateral: number;
  offer_amount: number;
  event_ids: string[];
}

interface AcceptOfferBody {
  offer_id: string;
}

interface CreateParlayContractParams {
  parlayParameters: ParlayParameter[];
  combinationMethod: CombinationMethod;
  eventMaturityEpoch: number;
  counterparty: string;
  offerCollateral: number;
  acceptCollateral: number;
  feeRate: number;
}

interface CreateParlayContractResponse {
  id: string;
}

export interface SolContextType {
  register: (params: RegisterParams) => Promise<void>;
  login: (params: LoginParams) => Promise<LoginResponse>;
  logout: () => Promise<{ success: boolean }>;
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
  getBalanceHistory: (timePeriod: TimePeriod, referenceDate?: Date) => Promise<BalanceHistory[]>;
  getContracts: (filter?: ContractFilter) => Promise<Contract[]>;
  getContract: (id: string) => Promise<Contract>;
  getMarketStats: () => Promise<MarketStats[]>;
  createEnumerationContract: (params: EnumerationContractParams) => Promise<CreateEnumerationContractResponse>;
  getCounterparties: () => Promise<NostrCounterparty[]>;
  createProfile: (params: { name: string; about: string }) => Promise<void>;
  createParlayContract: (params: CreateParlayContractParams) => Promise<CreateParlayContractResponse>;
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
  const instance = useMemo(() => {
    const axiosInstance = axios.create({
      baseURL: config.apiBaseUrl,
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
  }, [baseUrl]);


  const value: SolContextType = useMemo(() => ({
    register: async (params: RegisterParams) => {
      await instance.post('/auth/register', params);
    },
    login: async (params: LoginParams) => {
      const data = await instance.post<LoginResponse>('/auth/login', params);
      return data.data;
    },
    logout: async (): Promise<{ success: boolean }> => {
      const { data } = await instance.post('/auth/logout');
      return data;
    },
    verify: async () => {
      await instance.get('/auth/verify');
    },
    forgot: async (params: ForgotParams) => {
      await instance.post('/auth/forgot', params);
    },
    reset: async (params: ResetParams) => {
      await instance.post('/auth/reset', params);
    },
    current: async () => {
      const { data } = await instance.get('/auth/current');
      return data;
    },
    magicLink: async (params: MagicLinkParams) => {
      await instance.post('/auth/magic-link', params);
    },
    magicLinkVerify: async (token: string) => {
      const { data } = await instance.get<LoginResponse>(`/auth/magic-link/${token}`);
      return data;
    },
    getInfo: async () => {
      const { data } = await instance.get<InfoResponse>('/info');
      return data;
    },
    getPeers: async () => {
      const { data } = await instance.get<Peer[]>('/peers');
      return data;
    },
    getOffers: async (offerId?: string) => {
      const endpoint = offerId ? `/offers?id=${offerId}` : '/offers';
      const { data } = await instance.get(endpoint);
      return data;
    },
    sendOffer: async (body: SendOfferBody) => {
      const { data } = await instance.post('/offers', body);
      return data;
    },
    acceptOffer: async (body: AcceptOfferBody) => {
      const { data } = await instance.post('/offers/accept', body);
      return data;
    },
    getNewAddress: async () => {
      const { data } = await instance.post('/wallet/address');
      return data;
    },
    getTransactions: async () => {
      const { data } = await instance.get('/wallet/transactions');
      return data;
    },
    getUtxos: async () => {
      const { data } = await instance.get('/wallet/utxos');
      return data;
    },
    getBalance: async () => {
      const { data } = await instance.get<SolBalance>('/balance');
      return data;
    },
    getBalanceHistory: async (timePeriod: TimePeriod, referenceDate?: Date) => {
      const params = new URLSearchParams();
      params.append('time_period', timePeriod);
      if (referenceDate) {
        params.append('reference_date', referenceDate.toISOString());
      }
      const { data } = await instance.get<BalanceHistory[]>(`/balance/history?${params.toString()}`);
      return data;
    },
    getContracts: async (filter?: ContractFilter) => {
      const { data } = await instance.get<Contract[]>(`/contracts?filter=${filter}`);
      return data;
    },
    getContract: async (id: string) => {
      const { data } = await instance.get<Contract>(`/contracts?id=${id}`);
      return data;
    },
    getMarketStats: async () => {
      const { data } = await instance.get<MarketStats[]>('/market/hashrates');
      return data;
    },
    createEnumerationContract: async (params: EnumerationContractParams) => {
      const { data } = await instance.post<CreateEnumerationContractResponse>('/create/enum', params);
      return data;
    },
    getCounterparties: async () => {
      const { data } = await instance.get<NostrCounterparty[]>('/nostr/counterparties');
      return data;
    },
    createProfile: async (params: { name: string; about: string }) => {
      await instance.post('/nostr/create-profile', params);
    },
    createParlayContract: async (params: CreateParlayContractParams) => {
      const { data } = await instance.post<CreateParlayContractResponse>('/create/parlay', params);
      return data;
    },
  }), [instance]);

  return <SolContext.Provider value={value}>{children}</SolContext.Provider>;
};
