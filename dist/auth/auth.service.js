"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const bcryptjs_1 = require("bcryptjs");
const jwt_1 = require("@nestjs/jwt");
const jsonwebtoken_1 = require("jsonwebtoken");
const config_1 = require("@nestjs/config");
let AuthService = class AuthService {
    usersService;
    jwtService;
    configService;
    constructor(usersService, jwtService, configService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async validateUser(username, password) {
        const user = await this.usersService.user({ username });
        if (!user) {
            return null;
        }
        const checkPassword = await (0, bcryptjs_1.compare)(password, user.password);
        if (!checkPassword) {
            return null;
        }
        const { password: _, ...result } = user;
        return result;
    }
    async refresh(refreshToken) {
        try {
            const refreshSecret = this.configService.get('REFRESH_SECRET');
            if (!refreshSecret) {
                throw new Error('REFRESH_SECRET not configured');
            }
            const decoded = await this.jwtService.verifyAsync(refreshToken, { secret: refreshSecret, ignoreExpiration: false });
            const user = await this.usersService.user({ username: decoded["username"] });
            if (!user) {
                throw new common_1.HttpException('User not found', 404);
            }
            return this.jwtService.sign({
                username: decoded["username"],
                userId: decoded["userId"],
                role: decoded["role"]
            });
        }
        catch (error) {
            throw new common_1.HttpException('Invalid refresh token', 418);
        }
    }
    async setRefreshToken(username, userId) {
        const user = await this.usersService.user({ username });
        if (!user) {
            return null;
        }
        if (user.refreshToken != null) {
            try {
                const refreshSecret = this.configService.get('REFRESH_SECRET');
                if (!refreshSecret) {
                    throw new Error('REFRESH_SECRET not configured');
                }
                const decoded = (0, jsonwebtoken_1.verify)(user.refreshToken, refreshSecret);
                if (Date.now() < decoded["exp"] * 1000) {
                    return user.refreshToken;
                }
            }
            catch (error) { }
        }
        const refreshToken = this.jwtService.sign({
            username: user.username,
            userId: user.id,
            role: user.role
        }, {
            secret: this.configService.get('REFRESH_SECRET'),
            expiresIn: '7d'
        });
        await this.usersService.updateUser({
            where: { id: userId },
            data: { refreshToken }
        });
        return refreshToken;
    }
    async login(user) {
        return {
            access_token: this.jwtService.sign({
                username: user.username,
                sub: user.id,
                role: user.role
            }),
            refresh_token: await this.setRefreshToken(user.username, user.id)
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService, jwt_1.JwtService, config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map