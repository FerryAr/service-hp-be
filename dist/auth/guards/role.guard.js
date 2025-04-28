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
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const config_1 = require("@nestjs/config");
const users_service_1 = require("../../users/users.service");
const jsonwebtoken_1 = require("jsonwebtoken");
const RoleGuard = (role) => {
    let RoleGuardMixin = class RoleGuardMixin extends jwt_auth_guard_1.JwtAuthGuard {
        configService;
        usersService;
        constructor(configService, usersService) {
            super();
            this.configService = configService;
            this.usersService = usersService;
        }
        async canActivate(context) {
            const request = context.switchToHttp().getRequest();
            if (!request.headers.authorization)
                return false;
            const token = request.headers.authorization.split(' ')[1];
            try {
                const secret = this.configService.get('JWT_SECRET');
                if (!secret)
                    throw new Error('JWT_SECRET is not defined');
                const decoded = (0, jsonwebtoken_1.verify)(token, secret);
                const user = await this.usersService.user({ username: decoded['username'] });
                if (!user)
                    return false;
                return user.role === role;
            }
            catch (error) {
                if (error instanceof jsonwebtoken_1.TokenExpiredError) {
                    context.switchToHttp().getResponse().status(401);
                }
                else {
                    context.switchToHttp().getResponse().status(500);
                }
                return false;
            }
        }
    };
    RoleGuardMixin = __decorate([
        (0, common_1.Injectable)(),
        __metadata("design:paramtypes", [config_1.ConfigService,
            users_service_1.UsersService])
    ], RoleGuardMixin);
    return (0, common_1.mixin)(RoleGuardMixin);
};
exports.default = RoleGuard;
//# sourceMappingURL=role.guard.js.map