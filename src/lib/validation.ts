export const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
    if (!email) {
      return "Email is required";
    }
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address.";
    }
    return null;
  };
  
  export const validatePhoneNumber = (phone: string) => {
    // If phone is empty or undefined, it's valid (optional)
    if (!phone) {
      return null;
    }
  
    const digitsOnly = phone.replace(/\D/g, '');
  
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      return "Phone number must be between 10 and 15 digits and can only have numbers";
    }
  
    return null;
  };
  
  export const validatePassword = (password: string) => {
    if (!password) {
      return "Password is required";
    }
  
    const errors = [];
  
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
  
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
  
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase character");
    }
  
    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number");
    }
  
    if (!/[_!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }
  
    return errors.length > 0 ? errors.join("\n") : null;
  };
  
  export const validateConfirmPassword = (password: string, confirmPassword: string) => {
    if (!confirmPassword) {
      return "Please confirm your password";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match";
    }
  
    return null;
  };