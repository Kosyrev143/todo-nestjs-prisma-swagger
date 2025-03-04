import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  HttpStatus,
  HttpCode,
  Patch,
  Delete,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto, UpdateTodoDto } from './dto';
import { GetCurrentUserId } from '../common/decorators';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  addTodo(@GetCurrentUserId() userId: number, @Body() dto: CreateTodoDto) {
    return this.todosService.createATodo(userId, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  getAllTodos(@GetCurrentUserId() userId: number) {
    return this.todosService.getAllTodos(userId);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  getOneTodo(@Param('id') todoId: number) {
    return this.todosService.getOneTodo(todoId);
  }

  @HttpCode(HttpStatus.CREATED)
  @Patch(':id')
  updateOneTodo(@Param() todoId: number, @Body() dto: UpdateTodoDto) {
    return this.todosService.updateOneTodo(todoId, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  removeOneTodo(@Param('id') todoId: number) {
    return this.todosService.removeOneTodo(todoId);
  }
}
