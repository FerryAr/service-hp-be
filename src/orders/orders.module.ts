import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';
import { SchedulerModule } from 'src/scheduler/scheduler.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { OrderCreatedListener } from './listeners/order-created.listener';
import { OrderDeletedListener } from './listeners/order-deleted.listener';
import { OrderStatusListener } from './listeners/order-status.listener';

@Module({
  imports: [PrismaModule, UsersModule, SchedulerModule, NotificationsModule],
  providers: [OrdersService, OrderCreatedListener, OrderDeletedListener, OrderStatusListener],
  controllers: [OrdersController]
})
export class OrdersModule {}
