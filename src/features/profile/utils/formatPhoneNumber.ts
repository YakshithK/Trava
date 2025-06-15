export const formatPhoneNumber = (phone: string): string => {
    const digitsOnly = phone.replace(/\D/g, '');
  
    // Check if the number has more than 10 digits (i.e., has a country code)
    if (digitsOnly.length > 10) {
      const countryCode = digitsOnly.slice(0, digitsOnly.length - 10);
      const areaCode = digitsOnly.slice(-10, -7);
      const prefix = digitsOnly.slice(-7, -4);
      const lineNumber = digitsOnly.slice(-4);
      return `+${countryCode} (${areaCode}) ${prefix}-${lineNumber}`;
    }
  
    // Fallback: assume US-style local number if exactly 10 digits
    const match = digitsOnly.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
  
    // If none of the above match, return original
    return phone;
  };
