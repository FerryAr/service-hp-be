import { EventEmitter2 } from '@nestjs/event-emitter';
import { SchedulerRegistry } from '@nestjs/schedule';
export declare class SchedulerService {
    private schedulerRegistry;
    private eventEmitter;
    private readonly logger;
    constructor(schedulerRegistry: SchedulerRegistry, eventEmitter: EventEmitter2);
    scheduleTransferKTTimeout(noOrder: string): void;
    deleteTransferKTTimeout(noOrder: string): void;
    scheduleBongkarTimeout(noOrder: string): void;
    deleteBongkarTimeout(noOrder: string): void;
    schedulePerbaikanTimeout(noOrder: string): void;
    deletePerbaikanTimeout(noOrder: string): void;
}
