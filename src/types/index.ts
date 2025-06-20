export interface Language {
  code: 'en' | 'yo' | 'ig' | 'ha';
  name: string;
  nativeName: string;
}

export interface SpokenWordContent {
  id: string;
  title: Record<string, string>;
  description: Record<string, string>;
  audioUrl: string;
  duration: string;
  language: string;
  theme: string;
  scriptureRef: string;
  transcript: Record<string, string>;
  date: string;
}

export interface DonationTier {
  amount: number;
  title: Record<string, string>;
  description: Record<string, string>;
  impact: Record<string, string>;
}

export interface TeamMember {
  name: string;
  role: Record<string, string>;
  bio: Record<string, string>;
  image: string;
}