import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import mongoose from 'mongoose';

class Company {
  @IsNotEmpty()
  _id: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty()
  name: mongoose.Schema.Types.ObjectId;
}

export class CreateJobDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsArray({ message: 'Skills must be an array of strings' })
  @IsString({ each: true, message: 'Each skill must be a string' })
  @IsNotEmpty({ each: true, message: 'Each skill must be a non-empty string' })
  skills: string[];

  @IsNotEmpty({ message: 'Salary is required' })
  salary: number;

  @IsNotEmpty({ message: 'Quantity is required' })
  quantity: number;

  @IsString()
  @IsNotEmpty({ message: 'Level is required' })
  level: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => Company)
  company: Company;

  @IsNotEmpty({ message: 'Start date is required' })
  @Transform(({ value }) => new Date(value))
  @IsDate({ message: 'startDate must be a valid date string' })
  startDate: Date;

  @IsNotEmpty({ message: 'Start date is required' })
  @Transform(({ value }) => new Date(value))
  @IsDate({ message: 'endDate must be a valid date string' })
  endDate: Date;

  @IsBoolean()
  @IsNotEmpty({ message: 'isActive is required' })
  isActive: boolean;
}
