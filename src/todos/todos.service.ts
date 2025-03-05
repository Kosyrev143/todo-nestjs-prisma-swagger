import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTodoDto, UpdateTodoDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import {
  TodoPayload,
  TodoAllSelect,
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
    const todo = await this.prisma.todo.findUnique({ where: { id } });
    if (!todo) {
      throw new NotFoundException('Todo Not Found');
    }
    return todo;
  }

  async updateOneTodo(
    id: number,
    dto: UpdateTodoDto,
  ): Promise<TodoPayload | undefined> {
    const todo = await this.prisma.todo.findUnique({ where: { id } });
    if (!todo) {
      throw new NotFoundException('Todo Not Found');
    }

    return this.prisma.todo.update({
      where: { id },
      data: { ...dto },
      select: TodoAllSelect,
    });
  }

  async removeOneTodo(id: number): Promise<TodoDeletePayload> {
    const todo = await this.prisma.todo.findUnique({ where: { id } });
    if (!todo) {
      throw new NotFoundException('Todo Not Found');
    }

    return this.prisma.todo.delete({ where: { id }, select: TodoDelete });
  }
}
