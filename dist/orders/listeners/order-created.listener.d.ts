import { Order } from "@prisma/client";
import { SchedulerService } from "src/scheduler/scheduler.service";
export declare class OrderCreatedListener {
    private schedulerService;
    constructor(schedulerService: SchedulerService);
    handleOrderCreatedEvent(payload: Order): Promise<void>;
}
