import { Prisma } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

export const TodoAllSelect = {
  id: true,
  title: true,
  dateOfCompleted: true,
  isCompleted: true,
  isExpired: true,
  todoPriority: true,
} satisfies Prisma.TodoSelect;

export type TodoPayload = Prisma.TodoGetPayload<{
  select: typeof TodoAllSelect;
}>;

export const TodoDelete = {
  id: true,
} satisfies Prisma.TodoSelect;

export type TodoDeletePayload = Prisma.TodoGetPayload<{
  select: typeof TodoDelete;
}>;

export const TodoNotFound = () => {
  throw new NotFoundException('Todo Not Found');
};
