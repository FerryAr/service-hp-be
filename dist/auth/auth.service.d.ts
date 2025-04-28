import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
export declare class AuthService {
    private usersService;
    private jwtService;
    private configService;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigService);
    validateUser(username: string, password: string): Promise<any>;
    refresh(refreshToken: string): Promise<string>;
    setRefreshToken(username: string, userId: number): Promise<string | null>;
    login(user: User): Promise<{
        access_token: string;
        refresh_token: string | null;
    }>;
}
