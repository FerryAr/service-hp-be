import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { Order } from "@prisma/client";
import { NotificationsGateway } from "src/notifications/notifications.gateway";
import { SchedulerService } from "src/scheduler/scheduler.service";

@Injectable()
export class OrderCreatedListener {
    constructor(
        private schedulerService: SchedulerService,
    ) { }

    @OnEvent('order.created')
    async handleOrderCreatedEvent(payload: Order) {
        this.schedulerService.scheduleTransferKTTimeout(payload.no_order);
    }
}