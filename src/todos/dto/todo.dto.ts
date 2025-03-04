import { TodoPriority } from '@prisma/client';
import {
  IsDate,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateTodoDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  title: string;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  @ApiProperty()
  dateOfCompleted: string;

  @IsEnum(TodoPriority)
  @IsNotEmpty()
  @ApiProperty()
  todoPriority: TodoPriority;
}
