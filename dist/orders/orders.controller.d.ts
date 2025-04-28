import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
export declare class OrdersController {
    private ordersService;
    constructor(ordersService: OrdersService);
    getOrdersDefault(): Promise<any[]>;
    getOrders(status: string): Promise<any[]>;
    createOrder(req: any, res: any, data: CreateOrderDto, fotoHp: Array<Express.Multer.File>): Promise<any>;
    deleteOrder(res: any, id: string): Promise<any>;
    kepalaTeknisiTakeover(req: any, res: any, id: string): Promise<any>;
    assignTeknisi(req: any, res: any, id: string, fotoBongkar: Array<Express.Multer.File>, teknisiId: string): Promise<any>;
    inProgress(req: any, res: any, id: string, fotoBefore: Array<Express.Multer.File>): Promise<any>;
    finished(req: any, res: any, id: string, fotoAfter: Array<Express.Multer.File>, videoAfter: Express.Multer.File): Promise<any>;
}
