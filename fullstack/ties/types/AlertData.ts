export type EnrichmentData = {
  ip: string | null;
  port: number;
  user: string | null;
  hostname: string | null;
  email: string | null;
  domain: string | null;
  useragent: string | null;
  hash: string | null;
  urlscan: string | null;
  process: string | null;
};

export interface AlertData {
    id: number;
    timestamp: string;
    rule: string;
    category: string;
    severity: number;
    enrichment: string;
    raw_data: string;
    status: number; 
    soc_id: number | null;
    taken_ts: string | null;
    resolved_ts: string | null;
    report: string | null;
    isTakingCharge: boolean;
    isResolving: boolean;
}



