import { z } from "zod";

export const profileFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  phoneNumber: z.string(),
  age: z.string(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export type Toast = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: string;
  action?: React.ReactNode;
  [key: string]: any;
};