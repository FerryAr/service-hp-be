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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("./orders.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const client_1 = require("@prisma/client");
const role_guard_1 = require("../auth/guards/role.guard");
const create_order_dto_1 = require("./dto/create-order.dto");
const platform_express_1 = require("@nestjs/platform-express");
const fs_1 = require("fs");
let OrdersController = class OrdersController {
    ordersService;
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    async getOrdersDefault() {
        return this.ordersService.order({});
    }
    async getOrders(status) {
        const orderStatus = client_1.Status[status] || client_1.Status.draft;
        return this.ordersService.order({
            status: orderStatus,
        });
    }
    async createOrder(req, res, data, fotoHp) {
        if (!(await this.ordersService.createOrder(data, req, res, fotoHp))) {
            fotoHp.forEach((file) => {
                (0, fs_1.unlinkSync)('./assets/foto-hp/' + file.filename);
            });
            return res.status(500).send();
        }
        return res.status(201).send();
    }
    async deleteOrder(res, id) {
        return await this.ordersService.deleteOrder({
            id: parseInt(id)
        }) ? res.status(200).send() : res.status(400).send();
    }
    async kepalaTeknisiTakeover(req, res, id) {
        if (!(await this.ordersService.kepalaTeknisiTakeover(req.user.userId, parseInt(id)))) {
            return res.status(500).send();
        }
        return res.status(200).send();
    }
    async assignTeknisi(req, res, id, fotoBongkar, teknisiId) {
        if (!(await this.ordersService.assignToTeknisi(req, parseInt(id), fotoBongkar, parseInt(teknisiId)))) {
            fotoBongkar.forEach((file) => {
                (0, fs_1.unlinkSync)('./assets/media-hp/bongkar/' + file.filename);
            });
            return res.status(500).send();
        }
        return res.status(200).send();
    }
    async inProgress(req, res, id, fotoBefore) {
        if (!(await this.ordersService.inProgress(req, parseInt(id), fotoBefore))) {
            fotoBefore.forEach((file) => {
                (0, fs_1.unlinkSync)('./assets/media-hp/before/' + file.filename);
            });
            return res.status(500).send();
        }
        return res.status(200).send();
    }
    async finished(req, res, id, fotoAfter, videoAfter) {
        if (!await this.ordersService.finished(req, parseInt(id), fotoAfter, videoAfter)) {
            fotoAfter.forEach((file) => {
                (0, fs_1.unlinkSync)('./assets/media-hp/after/' + file.filename);
            });
            (0, fs_1.unlinkSync)('./assets/media-hp/video/' + videoAfter.filename);
            return res.status(500).send();
        }
        return res.status(200).send();
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrdersDefault", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('/:status'),
    __param(0, (0, common_1.Param)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrders", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, (0, role_guard_1.default)('CS')),
    (0, common_1.Post)('/'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('fotoHp[]', 5)),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Response)()),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.UploadedFiles)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({
                maxSize: 5 * 1024 * 1024
            }),
            new common_1.FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ })
        ]
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, create_order_dto_1.CreateOrderDto,
        Array]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "createOrder", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, (0, role_guard_1.default)('CS')),
    (0, common_1.Delete)('/:id'),
    __param(0, (0, common_1.Response)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "deleteOrder", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, (0, role_guard_1.default)('KEPALA_TEKNISI')),
    (0, common_1.Put)('/kt/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Response)()),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "kepalaTeknisiTakeover", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, (0, role_guard_1.default)('KEPALA_TEKNISI')),
    (0, common_1.Post)('/kt/assignTeknisi/:id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('fotoBongkar[]', 5)),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Response)()),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.UploadedFiles)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({
                maxSize: 5 * 1024 * 1024
            }),
            new common_1.FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ })
        ]
    }))),
    __param(4, (0, common_1.Body)('teknisiId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, Array, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "assignTeknisi", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, (0, role_guard_1.default)('TEKNISI')),
    (0, common_1.Post)('/inProgress/:id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('fotoBefore[]', 5)),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Response)()),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.UploadedFiles)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({
                maxSize: 5 * 1024 * 1024
            }),
            new common_1.FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ })
        ]
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, Array]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "inProgress", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, (0, role_guard_1.default)('TEKNISI')),
    (0, common_1.Post)('/finished/:id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('fotoAfter[]', 5)),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('videoAfter', 1)),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Response)()),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.UploadedFiles)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({
                maxSize: 5 * 1024 * 1024
            }),
            new common_1.FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ })
        ]
    }))),
    __param(4, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({
                maxSize: 50 * 1024 * 1024
            }),
            new common_1.FileTypeValidator({ fileType: /(mp4|mkv)$/ })
        ]
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, Array, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "finished", null);
exports.OrdersController = OrdersController = __decorate([
    (0, common_1.Controller)('orders'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map