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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderStatusListener = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const scheduler_service_1 = require("../../scheduler/scheduler.service");
let OrderStatusListener = class OrderStatusListener {
    schedulerService;
    constructor(schedulerService) {
        this.schedulerService = schedulerService;
    }
    async handleKepalaTeknisiTakeover(noOrder) {
        this.schedulerService.scheduleBongkarTimeout(noOrder);
    }
    async handleInProgress(noOrder) {
        this.schedulerService.deleteBongkarTimeout(noOrder);
        this.schedulerService.schedulePerbaikanTimeout(noOrder);
    }
    async handleFinished(noOrder) {
        this.schedulerService.deletePerbaikanTimeout(noOrder);
    }
};
exports.OrderStatusListener = OrderStatusListener;
__decorate([
    (0, event_emitter_1.OnEvent)('order.kepalaTeknisiTakeover'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderStatusListener.prototype, "handleKepalaTeknisiTakeover", null);
__decorate([
    (0, event_emitter_1.OnEvent)('order.inProgress'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderStatusListener.prototype, "handleInProgress", null);
__decorate([
    (0, event_emitter_1.OnEvent)('order.finished'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderStatusListener.prototype, "handleFinished", null);
exports.OrderStatusListener = OrderStatusListener = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [scheduler_service_1.SchedulerService])
], OrderStatusListener);
//# sourceMappingURL=order-status.listener.js.map