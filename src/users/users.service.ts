import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prismaService: PrismaService) {}

    async user(
        userWhereUniqueInput: Prisma.UserWhereUniqueInput
    ): Promise<User | null> {
        return this.prismaService.user.findUnique({
            where: userWhereUniqueInput,
        });
    }

    async users(
        userWhereInput: Prisma.UserWhereInput
    ): Promise<User[]> {
        return this.prismaService.user.findMany({
            where: userWhereInput,
        });
    }

    async updateUser(params: {
        where: Prisma.UserWhereUniqueInput;
        data: Prisma.UserUpdateInput;
    }): Promise<User> {
        return this.prismaService.user.update({
            data: params.data,
            where: params.where,
        });
    }
}
