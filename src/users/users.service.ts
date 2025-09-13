import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from './user.interface';
import aqp from 'api-query-params';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
  ) {}

  getHashPassword = (password: string) => {
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);

    return hashPassword;
  };

  isValidPassword = (password: string, hashedPassword: string) => {
    return bcrypt.compareSync(password, hashedPassword);
  };

  isMongoId = (id: string) => {
    return !!mongoose.Types.ObjectId.isValid(id);
  };

  async isEmailExits(email: string) {
    const user = await this.userModel.findOne({
      email,
    });

    return !!user;
  }

  async updateUserToken(refreshToken: string, _id: string) {
    return this.userModel.updateOne({ _id }, { refreshToken });
  }

  async create(createUserDto: CreateUserDto, user: IUser) {
    const isExits = await this.isEmailExits(createUserDto.email);
    if (isExits) {
      throw new BadRequestException(
        `Email: ${createUserDto.email} is exits, please use other email`,
      );
    }

    const { password, ...rest } = createUserDto;
    const hashPassword = this.getHashPassword(createUserDto.password);

    const newUser = await this.userModel.create({
      ...rest,
      password: hashPassword,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });

    return newUser;
  }

  async register(registerUserDto: RegisterUserDto) {
    const isExits = await this.isEmailExits(registerUserDto.email);
    if (isExits) {
      throw new BadRequestException(
        `Email: ${registerUserDto.email} is exits, please use other email`,
      );
    }

    const hashPassword = this.getHashPassword(registerUserDto.password);
    const newUser = await this.userModel.create({
      ...registerUserDto,
      password: hashPassword,
      role: 'USER',
    });

    return newUser;
  }

  async findAll(currentPage: string, limit: string, qs: string) {
    const { filter, population, sort } = aqp(qs);

    delete filter.page;
    delete filter.limit;

    let defaultLimit = +limit ? +limit : 10;
    let offset = (+currentPage - 1) * +defaultLimit;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel
      .find(filter)
      .select('-password')
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
    if (this.isMongoId(id)) {
      return this.userModel.findOne({ _id: id }).select('-password');
    }

    return 'id is not valid';
  }

  findOneByUsername(username: string) {
    return this.userModel.findOne({ email: username });
  }

  update(updateUserDto: UpdateUserDto, user: IUser) {
    const { id, ...updateData } = updateUserDto;

    if (this.isMongoId(id)) {
      const mergeData = {
        ...updateData,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      };

      return this.userModel.updateOne({ _id: id }, mergeData);
    }

    return 'id is not valid';
  }

  async remove(id: string, user: IUser) {
    if (this.isMongoId(id)) {
      await this.userModel.updateOne(
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

      return this.userModel.softDelete({ _id: id });
    }

    return 'id is not valid';
  }
}
