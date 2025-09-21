import { Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Job, JobDocument } from './schemas/job.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/user.interface';
import aqp from 'api-query-params';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name)
    private jobModel: SoftDeleteModel<JobDocument>,
  ) {}

  create(createJobDto: CreateJobDto, user: IUser) {
    const newData = {
      ...createJobDto,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    };

    return this.jobModel.create(newData);
  }

  async findAll(currentPage: string, limit: string, qs: string) {
    const { filter, population, sort } = aqp(qs);

    delete filter.current;
    delete filter.pageSize;

    let defaultLimit = +limit ? +limit : 10;
    let offset = (+currentPage - 1) * +defaultLimit;

    const totalItems = (await this.jobModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.jobModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .exec();

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems,
      },
      result,
    };
  }

  findOne(id: string) {
    return this.jobModel.findOne({ _id: id });
  }

  async update(id: string, updateJobDto: UpdateJobDto, user: IUser) {
    const payload = {
      ...updateJobDto,
      updatedBy: {
        _id: user._id,
        email: user.email,
      },
    };

    const result = await this.jobModel.updateOne({ _id: id }, payload);
    return result;
  }

  async remove(id: string, user: IUser) {
    await this.jobModel.updateOne(
      {
        _id: id,
      },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    return this.jobModel.softDelete({ _id: id });
  }
}
