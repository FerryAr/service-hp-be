import { Order } from "@prisma/client";
import { SchedulerService } from "src/scheduler/scheduler.service";
export declare class OrderDeletedListener {
    private schedulerService;
    constructor(schedulerService: SchedulerService);
    handleOrderDeletedEvent(payload: Order): Promise<void>;
}
