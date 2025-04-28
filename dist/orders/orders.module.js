"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersModule = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("./orders.service");
const orders_controller_1 = require("./orders.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const users_module_1 = require("../users/users.module");
const scheduler_module_1 = require("../scheduler/scheduler.module");
const notifications_module_1 = require("../notifications/notifications.module");
const order_created_listener_1 = require("./listeners/order-created.listener");
const order_deleted_listener_1 = require("./listeners/order-deleted.listener");
const order_status_listener_1 = require("./listeners/order-status.listener");
let OrdersModule = class OrdersModule {
};
exports.OrdersModule = OrdersModule;
exports.OrdersModule = OrdersModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, users_module_1.UsersModule, scheduler_module_1.SchedulerModule, notifications_module_1.NotificationsModule],
        providers: [orders_service_1.OrdersService, order_created_listener_1.OrderCreatedListener, order_deleted_listener_1.OrderDeletedListener, order_status_listener_1.OrderStatusListener],
        controllers: [orders_controller_1.OrdersController]
    })
], OrdersModule);
//# sourceMappingURL=orders.module.js.map