import { z, ZodType } from "zod";

export class UserValidation {
    static readonly REGISTER: ZodType = z.object({
        email: z.string().email("Invalid email format"),
        password: z.string().min(6, "Password must be at least 6 characters long"),
        confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters long"),
        name: z.string().min(1, "Name is required").optional(),
        provider: z.enum(["LOCAL", "GOOGLE", "FACEBOOK", "GITHUB"]).default("LOCAL").optional(),
        isActive: z.boolean().default(true).optional(),
    });
}
