import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    nama_pelanggan: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    alamat_pelanggan: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    no_hp_pelanggan: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    merk_hp: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    seri_hp: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    model_hp: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    imei_hp: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    keterangan: string;
}