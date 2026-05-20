export interface Log {
  timestamp: string;
  user: string;
  actionType: string;
  resource: string;
  details: string;
  severity: 'Info' | 'Warning' | 'Critical';
}