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
var OrdersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const users_service_1 = require("../users/users.service");
const fs_1 = require("fs");
const luxon_1 = require("luxon");
const event_emitter_1 = require("@nestjs/event-emitter");
let OrdersService = OrdersService_1 = class OrdersService {
    prismaService;
    usersService;
    eventEmitter;
    constructor(prismaService, usersService, eventEmitter) {
        this.prismaService = prismaService;
        this.usersService = usersService;
        this.eventEmitter = eventEmitter;
    }
    logger = new common_1.Logger(OrdersService_1.name);
    async order(orderWhereInput) {
        const order = await this.prismaService.order.findMany({
            select: {
                id: true,
                no_order: true,
                nama_pelanggan: true,
                alamat_pelanggan: true,
                no_hp_pelanggan: true,
                keterangan: true,
                cs_transfer_deadline: true,
                bongkar_deadline: true,
                perbaikan_deadline: true,
                qc_kepala_deadline: true,
                qc_cs_deadline: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                kepala_teknisi: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
                teknisi: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
                cs: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
            where: orderWhereInput,
        });
        const orderMediaList = await this.orderMedia({
            order_id: {
                in: order.map(o => o.id),
            },
        });
        const categorizedOrderMedia = orderMediaList.reduce((acc, media) => {
            if (!acc[media.order_id]) {
                acc[media.order_id] = {};
            }
            if (!acc[media.order_id][media.type]) {
                acc[media.order_id][media.type] = [];
            }
            acc[media.order_id][media.type].push(media);
            return acc;
        }, {});
        const ordersRes = order.map(o => ({
            ...o,
            fotoHp: categorizedOrderMedia[o.id] || {},
        }));
        return ordersRes;
    }
    async orderMedia(orderMediaWhereInput) {
        const orderMedia = await this.prismaService.orderMedia.findMany({
            where: orderMediaWhereInput
        });
        return orderMedia;
    }
    async createOrder(data, req, res, fotoHp) {
        const userId = req.user.userId;
        const user = await this.usersService.user({ id: userId });
        if (!user) {
            res.status(404).send({ message: 'User not found' });
        }
        const no_order = Math.random().toString(36).substring(7);
        const now = luxon_1.DateTime.now();
        const cs_transfer_deadline = now.plus({ minutes: 10 }).toISO();
        try {
            const order = await this.prismaService.order.create({
                data: {
                    no_order: no_order,
                    nama_pelanggan: data.nama_pelanggan,
                    alamat_pelanggan: data.alamat_pelanggan,
                    no_hp_pelanggan: data.no_hp_pelanggan,
                    keterangan: data.keterangan,
                    cs_id: user.id,
                    cs_transfer_deadline: cs_transfer_deadline,
                },
            });
            console.log(fotoHp);
            for (let i = 0; i < fotoHp.length; i++) {
                let ext = fileMimeType[fotoHp[i].mimetype];
                const buffer = fotoHp[i].buffer;
                const fileName = `./assets/media-hp/arrival/${order.no_order}-${i + 1}.${ext}`;
                (0, fs_1.writeFile)(fileName, buffer, (err) => {
                    if (err) {
                        this.logger.error(err);
                    }
                });
                const relativePath = fileName.replace(/^\.\/+/, '');
                await this.prismaService.orderMedia.create({
                    data: {
                        order_id: order.id,
                        type: 'arrival',
                        path: relativePath,
                        file_size: fotoHp[i].size,
                    }
                });
            }
            await this.prismaService.orderTimeline.create({
                data: {
                    order_id: order.id,
                    action: 'Order Masuk',
                    user_id: userId,
                    start_time: now.toISO(),
                    notes: 'Order masuk ke sistem dengan no order ' + order.no_order,
                },
            });
            await this.prismaService.orderTimeline.create({
                data: {
                    order_id: order.id,
                    action: 'CS Transfer',
                    user_id: userId,
                    start_time: now.toISO(),
                    end_time: cs_transfer_deadline,
                    notes: 'Order di transfer ke kepala teknisi',
                },
            });
            this.eventEmitter.emit('order.created', order);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    async kepalaTeknisiTakeover(userId, orderId) {
        const order = await this.prismaService.order.findUnique({
            where: {
                id: orderId,
                kepala_teknisi_id: null,
                status: 'draft'
            }
        });
        if (!order) {
            return false;
        }
        const bongkar_deadline = luxon_1.DateTime.now().plus({ minutes: 30 }).toISO();
        await this.prismaService.order.update({
            where: {
                id: orderId
            },
            data: {
                kepala_teknisi_id: userId,
                status: 'waiting_bongkar',
                bongkar_deadline: bongkar_deadline
            }
        });
        await this.prismaService.orderTimeline.create({
            data: {
                order_id: order.id,
                action: 'Kepala Teknisi Takeover',
                user_id: userId,
                start_time: luxon_1.DateTime.now().toISO(),
                notes: 'Order diambil alih oleh kepala teknisi',
            },
        });
        await this.prismaService.orderTimeline.create({
            data: {
                order_id: order.id,
                action: 'Menunggu Bongkar',
                user_id: userId,
                start_time: luxon_1.DateTime.now().toISO(),
                end_time: bongkar_deadline,
                notes: 'Menunggu kepala teknisi untuk bongkar',
            },
        });
        this.eventEmitter.emit('order.kepalaTeknisiTakeover', order);
        return true;
    }
    async deleteOrder(orderWhereUniqueInput) {
        const order = await this.prismaService.order.findUnique({
            where: orderWhereUniqueInput,
        });
        if (!order) {
            return false;
        }
        if (order.status !== 'draft' || order.kepala_teknisi_id || order.teknisi_id) {
            return false;
        }
        try {
            await this.prismaService.order.delete({
                where: orderWhereUniqueInput,
            });
            const fotoHp = await this.orderMedia({
                order_id: order.id,
            });
            for (let i = 0; i < fotoHp.length; i++) {
                const absPath = `./${fotoHp[i].path}`;
                (0, fs_1.unlink)(absPath, (err) => {
                    if (err) {
                        this.logger.error(err);
                    }
                });
            }
            this.eventEmitter.emit('order.deleted', order);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    async assignToTeknisi(req, orderId, fotoBongkar, teknisiId) {
        const order = await this.prismaService.order.findUnique({
            where: {
                id: orderId,
            },
        });
        if (!order) {
            return false;
        }
        if (order.status !== 'waiting_bongkar') {
            return false;
        }
        console.log(fotoBongkar);
        for (let i = 0; i < fotoBongkar.length; i++) {
            let ext = fileMimeType[fotoBongkar[i].mimetype];
            const buffer = fotoBongkar[i].buffer;
            const fileName = `./assets/media-hp/bongkar/${order.no_order}-${i + 1}.${ext}`;
            try {
                (0, fs_1.writeFileSync)(fileName, buffer);
            }
            catch (err) {
                this.logger.error(err);
            }
            const relativePath = fileName.replace(/^\.\/+/, '');
            await this.prismaService.orderMedia.create({
                data: {
                    order_id: order.id,
                    type: 'bongkar',
                    path: relativePath,
                    file_size: fotoBongkar[i].size,
                }
            });
        }
        const now = luxon_1.DateTime.now();
        const perbaikan_deadline = now.plus({ days: 3 }).toISO();
        await this.prismaService.order.update({
            where: {
                id: orderId,
            },
            data: {
                teknisi_id: teknisiId,
                status: 'waiting_teknisi',
                perbaikan_deadline: perbaikan_deadline,
            },
        });
        await this.prismaService.orderTimeline.create({
            data: {
                order_id: order.id,
                action: 'Teknisi Assign',
                user_id: req.user.userId,
                start_time: now.toISO(),
                notes: 'Order di assign ke teknisi',
            },
        });
        await this.prismaService.orderTimeline.create({
            data: {
                order_id: order.id,
                action: 'Menunggu Teknisi',
                user_id: req.user.userId,
                start_time: now.toISO(),
                end_time: perbaikan_deadline,
                notes: 'Menunggu teknisi untuk memperbaiki',
            },
        });
        return true;
    }
    async inProgress(req, orderId, fotoBefore) {
        const order = await this.prismaService.order.findUnique({
            where: {
                id: orderId,
            },
        });
        if (!order) {
            return false;
        }
        if (order.status !== 'waiting_teknisi') {
            return false;
        }
        console.log(fotoBefore);
        for (let i = 0; i < fotoBefore.length; i++) {
            let ext = fileMimeType[fotoBefore[i].mimetype];
            const buffer = fotoBefore[i].buffer;
            const fileName = `./assets/media-hp/before/${order.no_order}-${i + 1}.${ext}`;
            (0, fs_1.writeFile)(fileName, buffer, (err) => {
                if (err) {
                    this.logger.error(err);
                }
            });
            const relativePath = fileName.replace(/^\.\/+/, '');
            await this.prismaService.orderMedia.create({
                data: {
                    order_id: order.id,
                    type: 'before',
                    path: relativePath,
                    file_size: fotoBefore[i].size,
                }
            });
        }
        await this.prismaService.order.update({
            where: {
                id: orderId,
            },
            data: {
                status: 'in_progress',
            },
        });
        await this.prismaService.orderTimeline.create({
            data: {
                order_id: order.id,
                action: 'Teknisi Mulai Perbaikan',
                user_id: req.user.userId,
                start_time: luxon_1.DateTime.now().toISO(),
                end_time: order.perbaikan_deadline,
                notes: 'Teknisi mulai memperbaiki',
            },
        });
        this.eventEmitter.emit('order.inProgress', order);
        return true;
    }
    async finished(req, orderId, fotoAfter, videoAfter) {
        const order = await this.prismaService.order.findUnique({
            where: {
                id: orderId,
            },
        });
        if (!order) {
            return false;
        }
        if (order.status !== 'in_progress') {
            return false;
        }
        console.log(fotoAfter);
        console.log(videoAfter);
        if (!fotoAfter || fotoAfter.length === 0) {
            return false;
        }
        if (!videoAfter || videoAfter.size === 0) {
            return false;
        }
        for (let i = 0; i < fotoAfter.length; i++) {
            let ext = fileMimeType[fotoAfter[i].mimetype];
            const buffer = fotoAfter[i].buffer;
            const fileName = `./assets/media-hp/after/${order.no_order}-${i + 1}.${ext}`;
            (0, fs_1.writeFile)(fileName, buffer, (err) => {
                if (err) {
                    this.logger.error(err);
                }
            });
            const relativePath = fileName.replace(/^\.\/+/, '');
            await this.prismaService.orderMedia.create({
                data: {
                    order_id: order.id,
                    type: 'after',
                    path: relativePath,
                    file_size: fotoAfter[i].size,
                },
            });
        }
        let ext = fileMimeType[videoAfter.mimetype];
        const buffer = videoAfter.buffer;
        const fileName = `./assets/media-hp/video/${order.no_order}.${ext}`;
        (0, fs_1.writeFile)(fileName, buffer, (err) => {
            if (err) {
                this.logger.error(err);
            }
        });
        const relativePath = fileName.replace(/^\.\/+/, '');
        await this.prismaService.orderMedia.create({
            data: {
                order_id: order.id,
                type: 'video',
                path: relativePath,
                file_size: videoAfter.size,
            },
        });
        await this.prismaService.order.update({
            where: {
                id: orderId,
            },
            data: {
                status: 'waiting_qc_kepala',
            },
        });
        await this.prismaService.orderTimeline.create({
            data: {
                order_id: order.id,
                action: 'Teknisi Selesai Perbaikan',
                user_id: req.user.userId,
                start_time: luxon_1.DateTime.now().toISO(),
                end_time: order.perbaikan_deadline,
                notes: 'Teknisi selesai memperbaiki',
            },
        });
        await this.prismaService.orderTimeline.create({
            data: {
                order_id: order.id,
                action: 'Menunggu QC Kepala',
                user_id: req.user.userId,
                start_time: luxon_1.DateTime.now().toISO(),
                end_time: order.perbaikan_deadline,
                notes: 'Menunggu QC Kepala untuk memeriksa',
            },
        });
        this.eventEmitter.emit('order.finished', order);
        return true;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = OrdersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        users_service_1.UsersService,
        event_emitter_1.EventEmitter2])
], OrdersService);
const fileMimeType = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'video/mp4': 'mp4',
    'video/x-matroska': 'mkv',
};
//# sourceMappingURL=orders.service.js.map