export const validationUtils = {
  // Validate name (only letters, spaces, hyphens, and apostrophes allowed, length 2-50)
  validateName(name: string): boolean {
    const nameRegex = /^[a-zA-Z\s\-\']{2,50}$/;
    return nameRegex.test(name.trim());
  },

  // Validate phone number (optional + and 10-15 digits)
  validatePhone(phone: string): boolean {
    // If empty, return true (assuming phone is optional in some places, 
    // but if required, we check for emptiness before calling this)
    if (!phone.trim()) return true; 
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    return phoneRegex.test(phone.trim().replace(/[\s\-\(\)]/g, ''));
  },

  // Validate username (alphanumeric and underscores only, length 3-20)
  validateUsername(username: string): boolean {
    if (!username.trim()) return true; // Optional field check
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username.trim());
  },

  // Validate title or general text input (no completely empty or just special chars, length 2-50)
  validateText(text: string): boolean {
    if (!text.trim()) return false;
    return text.trim().length >= 2 && text.trim().length <= 50;
  },

  // Validate positive amount
  validateAmount(amount: string | number): boolean {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return !isNaN(num) && num > 0;
  },

  // Validate date string (DD/MM/YYYY or DD-MM-YYYY)
  validateDate(dateStr: string): boolean {
    if (!dateStr.trim()) return true; // Optional field
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])[\/\-](0[1-9]|1[012])[\/\-]\d{4}$/;
    if (!dateRegex.test(dateStr.trim())) return false;
    
    // Additional logical validation
    const parts = dateStr.trim().split(/[\/\-]/);
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  }
};
