import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validateConfirmPassword, validatePassword } from "@/lib/validation";
import React from "react";

interface PasswordProps {
    text: {
        passwordLabel: string;
        passwordPlaceholder: string;
    };
    password: string;
    setPassword: React.Dispatch<React.SetStateAction<string>>;
    setPasswordError: React.Dispatch<React.SetStateAction<string | null>>;
    confirmPassword?: string;
    passwordError: string | null;
    setConfirmPasswordError?: React.Dispatch<React.SetStateAction<string | null>>;
}

export const Password = ({text, password, setPassword, setPasswordError, confirmPassword, passwordError, setConfirmPasswordError} : PasswordProps) => (
    <div className="space-y-2">
        <Label htmlFor="name" className="text-xl">
            {text.passwordLabel}
        </Label>
        <Input
            id="name"
            type="password"
            placeholder={text.passwordPlaceholder}
            className="h-14 text-lg rounded-xl border-2 border-saath-light-gray"
            required
            value={password}
            onChange={(e) => {
            const newPassword = e.target.value;
            setPassword(newPassword);
            setPasswordError(validatePassword(newPassword));

            if (confirmPassword) {
                setConfirmPasswordError(validateConfirmPassword(newPassword, confirmPassword))
            }
            }}
            onBlur={(e) => {
            setPasswordError(validatePassword(e.target.value));
            }}
        />
        {passwordError && (
            <ul className="text-sm text-red-500 mt-1 list-disc pl-5">
            {passwordError.split("\n").map((error, index) => (
                <li key={index}>{error}</li>
            ))}
            </ul>
        )}
    </div>
)