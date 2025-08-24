import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  getHashPassword = (password: string) => {
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);

    return hashPassword;
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

  update(updateUserDto: UpdateUserDto) {
    const { id, ...updateData } = updateUserDto;

    if (this.isMongoId(id)) {
      return this.userModel.updateOne({ _id: id }, updateData);
    }

    return 'id is not valid';
  }

  remove(id: string) {
    if (this.isMongoId(id)) {
      return this.userModel.deleteOne({ _id: id });
    }

    return 'id is not valid';
  }
}
