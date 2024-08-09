import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('Products Service');
  onModuleInit() {
    this.$connect();
    this.logger.log('Prisma connected');
  }
  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto,
    });
  }

  async findAll(paginatioDto: PaginationDto) {
    const { limit, page } = paginatioDto;
    const totalPages = await this.product.count({
      where: {
        available: true,
      },
    });
    const lastPage = Math.ceil(totalPages / limit);
    return {
      data: await this.product.findMany({
        take: limit,
        skip: limit * (page - 1),
        where: {
          available: true,
        },
      }),
      meta: {
        totalPages,
        page,
        lastPage,
      },
    };
  }

  async findOne(id: number) {
    const product = await this.product.findFirst({
      where: { id, available: true },
    });

    if (!product) {
      throw new NotFoundException(`Product not found with id ${id}`);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const { id: _unused, ...data } = updateProductDto;
    await this.findOne(id);
    return this.product.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    /*  return this.product.delete({
      where: { id },
    }); */
    const product = await this.product.update({
      where: { id },
      data: {
        available: false,
      },
    });

    return product;
  }
}
