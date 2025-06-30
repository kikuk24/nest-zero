// src/auth/auth.controller.ts
import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequest, LoginResponse, MeResponse } from 'src/model/auth.model';
import { WebResponse } from 'src/model/web.model';
import { Request } from 'express';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { User } from 'src/common/user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { AuthProvider } from 'generated/prisma';

// Extend Express Request interface to include 'user'
declare module 'express' {
    interface Request {
        user?: any;
    }
}

@Controller('api/auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @HttpCode(200)
    async login(
        @Body() request: LoginRequest,
    ): Promise<WebResponse<LoginResponse>> {
        const result = await this.authService.login(request);
        return {
            data: result,
            message: 'Login successful',
        };
    }

    @Post('refresh')
    @HttpCode(200)
    async refresh(@Body() body: { refreshToken: string }): Promise<WebResponse<LoginResponse>> {
        const result = await this.authService.refreshToken(body.refreshToken);
        return {
            data: result,
            message: 'Token refreshed successfully',
        };
    }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth() {
    }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleCallback(
        @User() user: { email: string; name: string; avatarUrl?: string },
    ): Promise<WebResponse<LoginResponse>> {
        const result = await this.authService.validateOAuthLogin({
            email: user.email,
            name: user.name,
            avatarUrl: user.avatarUrl,
            provider: AuthProvider.GOOGLE,
        });

        return {
            data: result,
            message: 'Login with Google successful',
        };
    }


    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getMe(@User() user: any): Promise<WebResponse<MeResponse>> {
        const result = await this.authService.getMe(user.userId);
        return {
            message: 'User profile fetched successfully',
            data: result,
        };
    }




    @UseGuards(JwtAuthGuard)
    @Post('logout')
    @HttpCode(200)
    async logout(@Req() req: Request): Promise<WebResponse<void>> {
        const user = req.user as any;
        await this.authService.logout(user.userId);
        return {
            message: 'Logout successful',
        };
    }

}
