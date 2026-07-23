// Embedded SVG Data URIs for reliable offline & online airline logo rendering

export const DEFAULT_AIRLINE_LOGO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='%230066cc'%3E%3Cpath d='M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z'/%3E%3C/svg%3E";

export const AIRLINE_LOGOS = {
  "Air India": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%23E31837'/%3E%3Cpath d='M20 55 C35 30 65 30 80 50 C65 45 45 45 30 65 Z' fill='%23FFB81C'/%3E%3Cpath d='M45 25 L55 25 L65 50 L35 50 Z' fill='%23FFFFFF'/%3E%3C/svg%3E",
  
  "IndiGo": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%23002B66'/%3E%3Ccircle cx='35' cy='40' r='8' fill='%23FFFFFF'/%3E%3Ccircle cx='50' cy='40' r='8' fill='%23FF6B00'/%3E%3Ccircle cx='65' cy='40' r='8' fill='%23FFFFFF'/%3E%3Cpath d='M25 65 L75 65 L65 75 L35 75 Z' fill='%23FFFFFF'/%3E%3C/svg%3E",
  
  "Emirates": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%23D71921'/%3E%3Ctext x='50' y='62' font-family='Arial, sans-serif' font-weight='900' font-size='22' fill='%23FFFFFF' text-anchor='middle'%3EEmirates%3C/text%3E%3C/svg%3E",
  
  "Qatar Airways": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%235C0632'/%3E%3Ccircle cx='50' cy='45' r='25' fill='none' stroke='%23FFFFFF' stroke-width='4'/%3E%3Cpath d='M40 55 L65 30 M45 35 L60 50' stroke='%23FFFFFF' stroke-width='5' stroke-linecap='round'/%3E%3Ctext x='50' y='82' font-family='Arial, sans-serif' font-weight='bold' font-size='13' fill='%23FFFFFF' text-anchor='middle'%3EQATAR%3C/text%3E%3C/svg%3E",
  
  "Singapore Airlines": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%2300205B'/%3E%3Cpath d='M20 60 Q 50 20 80 40 Q 50 45 20 60 Z' fill='%23FFB81C'/%3E%3Cpath d='M30 65 L70 65' stroke='%23FFB81C' stroke-width='4'/%3E%3C/svg%3E",
  
  "Garuda Indonesia": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%23007680'/%3E%3Cpath d='M20 50 C40 30 70 30 85 45 C65 45 45 55 30 70 Z' fill='%2300A3E0'/%3E%3Ccircle cx='70' cy='40' r='5' fill='%23FFD100'/%3E%3C/svg%3E",
  
  "British Airways": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%23EBF3FA'/%3E%3Cpath d='M15 45 Q 50 35 85 40' stroke='%23EB2226' stroke-width='8' fill='none' stroke-linecap='round'/%3E%3Cpath d='M25 60 Q 55 50 85 55' stroke='%2307529A' stroke-width='8' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"
};

export const getAirlineLogo = (airlineName, rawLogoUrl) => {
  if (airlineName && AIRLINE_LOGOS[airlineName]) {
    return AIRLINE_LOGOS[airlineName];
  }
  if (rawLogoUrl && !rawLogoUrl.includes('icons8') && !rawLogoUrl.includes('wikimedia')) {
    return rawLogoUrl;
  }
  return DEFAULT_AIRLINE_LOGO;
};
