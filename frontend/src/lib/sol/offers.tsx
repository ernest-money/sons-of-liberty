export interface SendOfferBody {
  contract_input: any; // Replace with actual contract input type
  counter_party: string;
  oracle_announcements: any[]; // Replace with actual oracle announcement type
}

export interface AcceptOfferBody {
  offer_id: string;
}

export interface AcceptOfferResponse {
  contract_id: string;
  counter_party: string;
  accept_dlc: any; // Replace with actual accept dlc type
}
