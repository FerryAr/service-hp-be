import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { SchedulerService } from "src/scheduler/scheduler.service";

@Injectable()
export class OrderStatusListener {
    constructor(
        private schedulerService: SchedulerService,
    ) {}

    @OnEvent('order.kepalaTeknisiTakeover')
    async handleKepalaTeknisiTakeover(noOrder: string) {
        this.schedulerService.scheduleBongkarTimeout(noOrder);
    }

    @OnEvent('order.inProgress')
    async handleInProgress(noOrder: string) {
        this.schedulerService.deleteBongkarTimeout(noOrder);
        this.schedulerService.schedulePerbaikanTimeout(noOrder);
    }

    @OnEvent('order.finished')
    async handleFinished(noOrder: string) {
        this.schedulerService.deletePerbaikanTimeout(noOrder);
    }
}