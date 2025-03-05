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
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto, UpdateTodoDto } from './dto';
import { GetCurrentUserId } from '../common/decorators';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { TodoEntity } from './entities';
import { TodoDeletePayload, TodoPayload } from './constants';
import { Todo } from '@prisma/client';
import { AtGuard } from '../common/guards';

@ApiBearerAuth('accessToken')
@ApiTags('Todo')
@UseGuards(AtGuard)
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @ApiOperation({ summary: 'Create new todo' })
  @ApiCreatedResponse({ type: TodoEntity })
  addTodo(
    @GetCurrentUserId() userId: number,
    @Body() dto: CreateTodoDto,
  ): Promise<TodoPayload> {
    return this.todosService.createATodo(userId, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  @ApiOperation({ summary: 'Get all todos' })
  @ApiOkResponse({ type: TodoEntity, isArray: true })
  getAllTodos(@GetCurrentUserId() userId: number): Promise<TodoPayload[]> {
    return this.todosService.getAllTodos(userId);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  @ApiOperation({ summary: 'Get todo by id' })
  @ApiOkResponse({ type: TodoEntity })
  getOneTodo(@Param('id', ParseIntPipe) todoId: number): Promise<Todo> {
    return this.todosService.getOneTodo(todoId);
  }

  @HttpCode(HttpStatus.CREATED)
  @Patch(':id')
  @ApiOperation({ summary: 'Update todo by id' })
  @ApiCreatedResponse({ type: TodoEntity })
  @ApiBody({ type: UpdateTodoDto })
  updateOneTodo(
    @Param('id', ParseIntPipe) todoId: number,
    @Body() dto: UpdateTodoDto,
  ): Promise<TodoPayload> {
    return this.todosService.updateOneTodo(todoId, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete todo by id' })
  @ApiOkResponse({ type: TodoEntity })
  removeOneTodo(
    @Param('id', ParseIntPipe) todoId: number,
  ): Promise<TodoDeletePayload> {
    return this.todosService.removeOneTodo(todoId);
  }
}
