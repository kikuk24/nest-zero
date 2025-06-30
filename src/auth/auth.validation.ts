import { z, ZodType } from "zod";

export class AuthValidation {
    static readonly LOGIN: ZodType = z.object({
        email: z.string().email("Invalid email format"),
        password: z.string().min(6, "Password must be at least 6 characters"),
    });
}
