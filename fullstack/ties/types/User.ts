export interface User {
  id: number;
  username: string | null;
  email: string;
  role: 'admin' | 'editor' | 'user';
  password_hash: string | null;
  provider: string | null;
  provider_id: string | null;
  company?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface AuthPayload {
  id: number;
  email: string;
  role: 'admin' | 'editor' | 'user';
  company?: number; // Aggiungi l'azienda al payload per gli editor
}

export interface Company {
  id: number;
  name: string;
  p_iva: string;
  vip: boolean;
}

export interface UserWithCompany extends User {
  company_name: string;
}