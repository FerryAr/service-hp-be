import { Controller, Request, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import RoleGuard from 'src/auth/guards/role.guard';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    async findOne(@Request() req) {
        const user = await this.usersService.user({ id: req.user.userId});
        if(!user) {
            return null;
        }
        // omit password and refresh token
        const { password: _, refreshToken: __, ...result } = user;
        return result;
    }

    @UseGuards(JwtAuthGuard, RoleGuard('KEPALA_TEKNISI'))
    @Get('/teknisi')
    async findTeknisi(@Request() req) {
        const teknisi = await this.usersService.users({
            role: 'TEKNISI',
            NOT: {
                id: req.user.userId
            }
        })
        if(!teknisi) {
            return null;
        }
        return teknisi.map((teknisi) => {
            const { password: _, refreshToken: __, ...result } = teknisi;
            return result;
        });
    }
}
