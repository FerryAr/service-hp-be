import { OrderMedia, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class OrdersService {
    private prismaService;
    private usersService;
    private eventEmitter;
    constructor(prismaService: PrismaService, usersService: UsersService, eventEmitter: EventEmitter2);
    private readonly logger;
    order(orderWhereInput: Prisma.OrderWhereInput): Promise<any[]>;
    orderMedia(orderMediaWhereInput: Prisma.OrderMediaWhereInput): Promise<OrderMedia[]>;
    createOrder(data: CreateOrderDto, req: any, res: any, fotoHp: Express.Multer.File[]): Promise<boolean>;
    kepalaTeknisiTakeover(userId: number, orderId: number): Promise<boolean>;
    deleteOrder(orderWhereUniqueInput: Prisma.OrderWhereUniqueInput): Promise<boolean>;
    assignToTeknisi(req: any, orderId: number, fotoBongkar: Express.Multer.File[], teknisiId: number): Promise<boolean>;
    inProgress(req: any, orderId: number, fotoBefore: Express.Multer.File[]): Promise<boolean>;
    finished(req: any, orderId: number, fotoAfter: Express.Multer.File[], videoAfter: Express.Multer.File): Promise<boolean>;
}
