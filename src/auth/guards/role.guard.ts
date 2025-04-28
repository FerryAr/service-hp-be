import {Role} from '@prisma/client';
import { CanActivate, ExecutionContext, Injectable, mixin, Type } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { verify, TokenExpiredError } from 'jsonwebtoken';

const RoleGuard = (role: Role ): Type<CanActivate> => {
    @Injectable()
    class RoleGuardMixin extends JwtAuthGuard {
        constructor(
            private configService: ConfigService,
            private usersService: UsersService
        ) {
            super();
        }

        async canActivate(context: ExecutionContext): Promise<boolean> {
            const request = context.switchToHttp().getRequest();

            if(!request.headers.authorization)  return false;
            
            const token = request.headers.authorization.split(' ')[1];

            try {
                const secret = this.configService.get<string>('JWT_SECRET');
                if (!secret) throw new Error('JWT_SECRET is not defined');
                const decoded = verify(token, secret);
                const user = await this.usersService.user({ username: decoded['username'] });

                if(!user) return false;

                return user.role === role;
            } catch (error) {
                if(error instanceof TokenExpiredError) {
                    context.switchToHttp().getResponse().status(401);
                } else {
                    context.switchToHttp().getResponse().status(500);
                }

                return false;
            }
        }
    }

    return mixin(RoleGuardMixin);
};

export default RoleGuard;