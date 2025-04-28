"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const schedule_1 = require("@nestjs/schedule");
let SchedulerService = SchedulerService_1 = class SchedulerService {
    schedulerRegistry;
    eventEmitter;
    logger = new common_1.Logger(SchedulerService_1.name);
    constructor(schedulerRegistry, eventEmitter) {
        this.schedulerRegistry = schedulerRegistry;
        this.eventEmitter = eventEmitter;
    }
    scheduleTransferKTTimeout(noOrder) {
        const callback = () => {
            this.logger.log(`Transfer timeout for order ${noOrder} on cs to kepala teknisi`);
            this.eventEmitter.emit('order.transfer_timeout_kt', noOrder);
            this.deleteTransferKTTimeout(noOrder);
        };
        const timeout = setTimeout(callback, 10 * 60 * 1000);
        this.schedulerRegistry.addTimeout(`transfer_kt_${noOrder}`, timeout);
    }
    deleteTransferKTTimeout(noOrder) {
        const timeoutKey = `transfer_kt_${noOrder}`;
        try {
            this.schedulerRegistry.deleteTimeout(timeoutKey);
        }
        catch (error) {
            this.logger.error(`Failed to delete timeout: ${timeoutKey}`, error);
        }
    }
    scheduleBongkarTimeout(noOrder) {
        const callback = () => {
            this.logger.log(`Bongkar timeout for order ${noOrder}`);
            this.eventEmitter.emit('order.bongkar_timeout', noOrder);
            this.deleteBongkarTimeout(noOrder);
        };
        const timeout = setTimeout(callback, 30 * 60 * 1000);
        this.schedulerRegistry.addTimeout(`bongkar_${noOrder}`, timeout);
    }
    deleteBongkarTimeout(noOrder) {
        const timeoutKey = `bongkar_${noOrder}`;
        try {
            this.schedulerRegistry.deleteTimeout(timeoutKey);
        }
        catch (error) {
            this.logger.error(`Failed to delete timeout: ${timeoutKey}`, error);
        }
    }
    schedulePerbaikanTimeout(noOrder) {
        const callback = () => {
            this.logger.log(`Perbaikan timeout for order ${noOrder}`);
            this.eventEmitter.emit('order.perbaikan_timeout', noOrder);
            this.deletePerbaikanTimeout(noOrder);
        };
        const timeout = setTimeout(callback, 3 * 24 * 60 * 60 * 1000);
        this.schedulerRegistry.addTimeout(`perbaikan_${noOrder}`, timeout);
    }
    deletePerbaikanTimeout(noOrder) {
        const timeoutKey = `perbaikan_${noOrder}`;
        try {
            this.schedulerRegistry.deleteTimeout(timeoutKey);
        }
        catch (error) {
            this.logger.error(`Failed to delete timeout: ${timeoutKey}`, error);
        }
    }
};
exports.SchedulerService = SchedulerService;
exports.SchedulerService = SchedulerService = SchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [schedule_1.SchedulerRegistry,
        event_emitter_1.EventEmitter2])
], SchedulerService);
//# sourceMappingURL=scheduler.service.js.map