import { Injectable } from '@nestjs/common';
import { CreateTodoDto, UpdateTodoDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import {
  TodoPayload,
  TodoAllSelect,
  TodoNotFound,
  TodoDelete,
  TodoDeletePayload,
} from './constants';
import { Todo } from '@prisma/client';

@Injectable()
export class TodosService {
  constructor(private readonly prisma: PrismaService) {}

  createATodo(userId: number, dto: CreateTodoDto): Promise<TodoPayload> {
    return this.prisma.todo.create({
      data: {
        ...dto,
        userId,
      },
      select: TodoAllSelect,
    });
  }

  getAllTodos(userId: number): Promise<TodoPayload[]> {
    return this.prisma.todo.findMany({
      where: {
        userId,
      },
      select: TodoAllSelect,
    });
  }

  async getOneTodo(id: number): Promise<Todo> {
    return this.prisma.todo.findUnique({ where: { id } }).catch(TodoNotFound);
  }

  async updateOneTodo(id: number, dto: UpdateTodoDto): Promise<TodoPayload> {
    await this.prisma.todo.findUnique({ where: { id } }).catch(TodoNotFound);
    return this.prisma.todo.update({
      where: { id },
      data: { ...dto },
      select: TodoAllSelect,
    });
  }

  async removeOneTodo(id: number): Promise<TodoDeletePayload> {
    await this.prisma.todo.findUnique({ where: { id } }).catch(TodoNotFound);
    return this.prisma.todo.delete({ where: { id }, select: TodoDelete });
  }
}
