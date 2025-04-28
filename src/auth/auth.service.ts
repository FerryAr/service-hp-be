import { HttpException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { compare } from "bcryptjs";
import { JwtService } from '@nestjs/jwt';
import { verify } from "jsonwebtoken";
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService, private configService: ConfigService) {}

    async validateUser(username: string, password: string): Promise<any> {
        const user = await this.usersService.user({ username });
       
        if(!user) {
            return null;
        }

        const checkPassword = await compare(password, user.password);

        if(!checkPassword) {
            return null;
        }

        const { password: _, ...result } = user;

        return result;
    }

    async refresh(refreshToken: string) {
        try {
            const refreshSecret = this.configService.get<string>('REFRESH_SECRET');
            if (!refreshSecret) {
                throw new Error('REFRESH_SECRET not configured');
            }
            const decoded = await this.jwtService.verifyAsync(refreshToken, { secret: refreshSecret, ignoreExpiration: false });

            const user = await this.usersService.user({ username: decoded["username"] });

            if(!user) {
                throw new HttpException('User not found', 404);
            }

            return this.jwtService.sign({
                username: decoded["username"],
                userId: decoded["userId"],
                role: decoded["role"]
            });
        } catch (error) {
            throw new HttpException('Invalid refresh token', 418);
        }
    }

    async setRefreshToken(username: string, userId: number) {
        const user = await this.usersService.user({ username });

        if(!user) {
            return null;
        }

        if(user.refreshToken != null) {
            try {
                const refreshSecret = this.configService.get<string>('REFRESH_SECRET');
                if (!refreshSecret) {
                    throw new Error('REFRESH_SECRET not configured');
                }
                const decoded = verify(user.refreshToken, refreshSecret);

                if(Date.now()  < decoded["exp"] * 1000) {
                    return user.refreshToken;
                }
            } catch (error) {}
        }

        const refreshToken = this.jwtService.sign({
            username: user.username,
            userId: user.id,
            role: user.role
        }, {
            secret: this.configService.get<string>('REFRESH_SECRET'),
            expiresIn: '7d'
        });

        await this.usersService.updateUser({
            where: { id: userId },
            data: { refreshToken }
        });

        return refreshToken;
    }

    async login(user: User) {
        return {
            access_token: this.jwtService.sign({
                username: user.username,
                sub: user.id,
                role: user.role
            }),
            refresh_token: await this.setRefreshToken(user.username, user.id)
        };
    }
}
