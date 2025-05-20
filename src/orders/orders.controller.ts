import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Body,
  Request,
  Response,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
  UploadedFiles,
  Delete,
  Put,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Status } from '@prisma/client';
import RoleGuard from 'src/auth/guards/role.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  FileFieldsInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { unlink, unlinkSync } from 'fs';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getOrdersDefault() {
    return this.ordersService.order({});
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:status')
  async getOrders(@Param('status') status: string) {
    const orderStatus: Status = Status[status] || Status.draft;
    return this.ordersService.order({
      status: orderStatus,
    });
  }

  @Get('/details/:noOrder')
  async getByNoOrder(@Param('noOrder') noOrder: string) {
    return await this.ordersService.orderByNoOrder(noOrder);
  }

  @UseGuards(JwtAuthGuard, RoleGuard('CS'))
  @Post('/')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'csShot', maxCount: 1 },
      { name: 'fotoHp', maxCount: 5 },
    ]),
  )
  async createOrder(
    @Request() req,
    @Response() res,
    @Body() data: CreateOrderDto,
    @UploadedFiles()
    files: {
      fotoHp: Array<Express.Multer.File>;
      csShot: Array<Express.Multer.File>;
    },
  ) {
    const fotoHp = files.fotoHp;
    const csShot = files.csShot;
    if (
      !(await this.ordersService.createOrder(data, req, res, fotoHp, csShot[0]))
    ) {
      fotoHp.forEach((file) => {
        unlinkSync('./assets/foto-hp/' + file.filename);
      });
      unlinkSync('./assets/cs-shot/' + csShot[0].filename);

      return res.status(500).send();
    }

    return res.status(201).send();
  }

  @UseGuards(JwtAuthGuard, RoleGuard('CS'))
  @Delete('/:id')
  async deleteOrder(@Response() res: any, @Param('id') id: string) {
    return (await this.ordersService.deleteOrder({
      id: parseInt(id),
    }))
      ? res.status(200).send()
      : res.status(400).send();
  }

  @UseGuards(JwtAuthGuard, RoleGuard('KEPALA_TEKNISI'))
  @Put('/kt/:id')
  async kepalaTeknisiTakeover(
    @Request() req,
    @Response() res,
    @Param('id') id: string,
  ) {
    if (
      !(await this.ordersService.kepalaTeknisiTakeover(
        req.user.userId,
        parseInt(id),
      ))
    ) {
      return res.status(500).send();
    }

    return res.status(200).send();
  }

  @UseGuards(JwtAuthGuard, RoleGuard('KEPALA_TEKNISI'))
  @Post('/kt/assignTeknisi/:id')
  @UseInterceptors(FilesInterceptor('fotoBongkar[]', 5))
  async assignTeknisi(
    @Request() req,
    @Response() res,
    @Param('id') id: string,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 5 * 1024 * 1024,
          }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
        ],
      }),
    )
    fotoBongkar: Array<Express.Multer.File>,
    @Body('teknisiId') teknisiId: string,
  ) {
    if (
      !(await this.ordersService.assignToTeknisi(
        req,
        parseInt(id),
        fotoBongkar,
        parseInt(teknisiId),
      ))
    ) {
      fotoBongkar.forEach((file) => {
        unlinkSync('./assets/media-hp/bongkar/' + file.filename);
      });

      return res.status(500).send();
    }

    return res.status(200).send();
  }

  @UseGuards(JwtAuthGuard, RoleGuard('TEKNISI'))
  @Post('/inProgress/:id')
  @UseInterceptors(FilesInterceptor('fotoBefore[]', 5))
  async inProgress(
    @Request() req,
    @Response() res,
    @Param('id') id: string,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 5 * 1024 * 1024,
          }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
        ],
      }),
    )
    fotoBefore: Array<Express.Multer.File>,
  ) {
    if (!(await this.ordersService.inProgress(req, parseInt(id), fotoBefore))) {
      fotoBefore.forEach((file) => {
        unlinkSync('./assets/media-hp/before/' + file.filename);
      });

      return res.status(500).send();
    }

    return res.status(200).send();
  }

  @UseGuards(JwtAuthGuard, RoleGuard('TEKNISI'))
  @Post('/finished/:id')
  @UseInterceptors(FilesInterceptor('fotoAfter[]', 5))
  @UseInterceptors(FilesInterceptor('videoAfter', 1))
  async finished(
    @Request() req,
    @Response() res,
    @Param('id') id: string,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 5 * 1024 * 1024,
          }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
        ],
      }),
    )
    fotoAfter: Array<Express.Multer.File>,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 50 * 1024 * 1024,
          }),
          new FileTypeValidator({ fileType: /(mp4|mkv)$/ }),
        ],
      }),
    )
    videoAfter: Express.Multer.File,
  ) {
    if (
      !(await this.ordersService.finished(
        req,
        parseInt(id),
        fotoAfter,
        videoAfter,
      ))
    ) {
      fotoAfter.forEach((file) => {
        unlinkSync('./assets/media-hp/after/' + file.filename);
      });

      unlinkSync('./assets/media-hp/video/' + videoAfter.filename);

      return res.status(500).send();
    }

    return res.status(200).send();
  }
}
