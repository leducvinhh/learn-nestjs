import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';

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

  async create(createUserDto: CreateUserDto) {
    const hashPassword = this.getHashPassword(createUserDto.password);

    const newUser = await this.userModel.create({
      name: createUserDto.name,
      password: hashPassword,
      email: createUserDto.email,
    });

    return newUser;
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: string) {
    if (this.isMongoId(id)) {
      return this.userModel.findOne({ _id: id });
    }

    return 'id is not valid';
  }

  findOneByUsername(username: string) {
    return this.userModel.findOne({ email: username });
  }

  update(updateUserDto: UpdateUserDto) {
    const { id, ...updateData } = updateUserDto;

    if (this.isMongoId(id)) {
      return this.userModel.updateOne({ _id: id }, updateData);
    }

    return 'id is not valid';
  }

  remove(id: string) {
    if (this.isMongoId(id)) {
      return this.userModel.softDelete({ _id: id });
    }

    return 'id is not valid';
  }
}
