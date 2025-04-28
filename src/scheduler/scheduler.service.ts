import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SchedulerRegistry } from '@nestjs/schedule';

@Injectable()
export class SchedulerService {
    private readonly logger = new Logger(SchedulerService.name);

    constructor(
        private schedulerRegistry: SchedulerRegistry,
        private eventEmitter: EventEmitter2,
    ) {}

    scheduleTransferKTTimeout(noOrder: string) {
        const callback = () => {
            this.logger.log(`Transfer timeout for order ${noOrder} on cs to kepala teknisi`);
            this.eventEmitter.emit('order.transfer_timeout_kt', noOrder);
            this.deleteTransferKTTimeout(noOrder);
        }

        // timeout 10 minutes
        const timeout = setTimeout(callback, 10 * 60 * 1000);
        
        this.schedulerRegistry.addTimeout(`transfer_kt_${noOrder}`, timeout);
    }

    deleteTransferKTTimeout(noOrder: string) {
        const timeoutKey = `transfer_kt_${noOrder}`;
        try {
            this.schedulerRegistry.deleteTimeout(timeoutKey);
        } catch (error) {
            this.logger.error(`Failed to delete timeout: ${timeoutKey}`, error);
        }
    }

    scheduleBongkarTimeout(noOrder: string) {
        const callback = () => {
            this.logger.log(`Bongkar timeout for order ${noOrder}`);
            this.eventEmitter.emit('order.bongkar_timeout', noOrder);
            this.deleteBongkarTimeout(noOrder);
        }

        // timeout 30 minutes
        const timeout = setTimeout(callback, 30 * 60 * 1000);
        
        this.schedulerRegistry.addTimeout(`bongkar_${noOrder}`, timeout);
    }

    deleteBongkarTimeout(noOrder: string) {
        const timeoutKey = `bongkar_${noOrder}`;
        try {
            this.schedulerRegistry.deleteTimeout(timeoutKey);
        } catch (error) {
            this.logger.error(`Failed to delete timeout: ${timeoutKey}`, error);
        }
    }

    schedulePerbaikanTimeout(noOrder: string) {
        const callback = () => {
            this.logger.log(`Perbaikan timeout for order ${noOrder}`);
            this.eventEmitter.emit('order.perbaikan_timeout', noOrder);
            this.deletePerbaikanTimeout(noOrder);
        }

        // timeout 3 days
        const timeout = setTimeout(callback, 3 * 24 * 60 * 60 * 1000);
        
        this.schedulerRegistry.addTimeout(`perbaikan_${noOrder}`, timeout);
    }

    deletePerbaikanTimeout(noOrder: string) {
        const timeoutKey = `perbaikan_${noOrder}`;
        try {
            this.schedulerRegistry.deleteTimeout(timeoutKey);
        } catch (error) {
            this.logger.error(`Failed to delete timeout: ${timeoutKey}`, error);
        }
    }
}
