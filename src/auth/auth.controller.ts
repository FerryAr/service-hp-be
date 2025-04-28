import { Controller, Request, Post, UseGuards, Get, UnauthorizedException } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() req) {
        return  this.authService.login(req.user);
    }

    @Get('refresh')
    async refresh(@Request() req) {
        const authHeader = req.headers['authorization'];

        if (!authHeader) {
            throw new UnauthorizedException({ message: 'Token tidak ada' });
        }

        const token = authHeader.replace('Bearer ', '');
        return this.authService.refresh(token);
    }
}
