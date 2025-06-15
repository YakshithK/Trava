import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validateConfirmPassword } from "@/lib/validation";

interface ConfirmPasswordProps {
    password: string;
    confirmPassword: string;
    setConfirmPassword: React.Dispatch<React.SetStateAction<string>>;
    setConfirmPasswordError: React.Dispatch<React.SetStateAction<string | null>>;
    confirmPasswordError: string | null;
}

export const ConfirmPassword = ({
    password,
    confirmPassword,
    setConfirmPassword,
    setConfirmPasswordError,
    confirmPasswordError,
    } : ConfirmPasswordProps) => ( 
    <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-xl">
        Confirm Password
        </Label>
        <Input
        id="confirmPassword"
        type="password"
        placeholder="Confirm your password"
        className="h-14 text-lg rounded-xl border-2 border-saath-light-gray"
        required
        value={confirmPassword}
        onChange={(e) => {
            const newConfirmPassword = e.target.value;
            setConfirmPassword(newConfirmPassword);
            setConfirmPasswordError(validateConfirmPassword(password, newConfirmPassword));
        }}
        onBlur={(e) => {
            setConfirmPasswordError(validateConfirmPassword(password, e.target.value));
        }}
        />
        {confirmPasswordError && (
        <p className="text-sm text-red-500 mt-1">{confirmPasswordError}</p>
        )}
    </div>
    )