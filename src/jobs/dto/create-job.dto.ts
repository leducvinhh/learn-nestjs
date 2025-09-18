import { IsNotEmpty, IsString } from 'class-validator';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsString({ each: true })
  @IsNotEmpty({ each: true, message: 'Each skill must be a non-empty string' })
  skills: string[];

  @IsString()
  @IsNotEmpty({ message: 'Company ID is required' })
  companyId: string;

  @IsString()
  @IsNotEmpty({ message: 'Company name is required' })
  companyName: string;

  @IsString()
  @IsNotEmpty({ message: 'Location is required' })
  location: string;

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

  @IsString()
  @IsNotEmpty({ message: 'Start date is required' })
  startDate: Date;

  @IsString()
  @IsNotEmpty({ message: 'End date is required' })
  endDate: Date;
}
