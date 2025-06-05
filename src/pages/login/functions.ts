import { supabase } from "@/config/supabase";
import React from "react";
import { NavigateFunction } from "react-router-dom";

export const handleSubmit = async (e: React.FormEvent, 
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>, 
    setError: React.Dispatch<React.SetStateAction<string>>,
    email: string,
    password: string,
    navigate: NavigateFunction) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log("Attempting to sign in user:", email);

      if (!email.trim() || !password.trim()) {
        setError("Please enter both email and password");
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      console.log("Sign in response:", { data, error });

      if (error) {
        console.error("Sign in error:", error.message);
        
        // Provide user-friendly error messages
        let userMessage = "Login failed. Please try again.";
        if (error.message.includes("Invalid login credentials")) {
          userMessage = "Invalid email or password. Please check your credentials and try again.";
        } else if (error.message.includes("Email not confirmed")) {
          userMessage = "Please check your email and confirm your account before logging in.";
        } else if (error.message.includes("Too many requests")) {
          userMessage = "Too many login attempts. Please wait a few minutes and try again.";
        }
        
        setError(userMessage);
        return;
      }

      if (data.user) {
        console.log("Login successful, redirecting to dashboard");
        navigate("/dashboard");
      } else {
        console.error("No user data received");
        setError("Login failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Unexpected error during login:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };