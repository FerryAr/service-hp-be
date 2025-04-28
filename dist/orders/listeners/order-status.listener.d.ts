import { SchedulerService } from "src/scheduler/scheduler.service";
export declare class OrderStatusListener {
    private schedulerService;
    constructor(schedulerService: SchedulerService);
    handleKepalaTeknisiTakeover(noOrder: string): Promise<void>;
    handleInProgress(noOrder: string): Promise<void>;
    handleFinished(noOrder: string): Promise<void>;
}
