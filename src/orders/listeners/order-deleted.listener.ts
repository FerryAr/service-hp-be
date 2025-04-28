import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { Order } from "@prisma/client";
import { SchedulerService } from "src/scheduler/scheduler.service";

@Injectable()
export class OrderDeletedListener {
    constructor(
        private schedulerService: SchedulerService,
    ) { }

    @OnEvent('order.deleted')
    async handleOrderDeletedEvent(payload: Order) {
        this.schedulerService.deleteTransferKTTimeout(payload.no_order);
    }
}