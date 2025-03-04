import { Todo, TodoPriority } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { TodosService } from '../../todos.service';
import { AuthService } from '../../../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { TodoDeletePayload, TodoPayload } from '../../constants';

const user = {
  email: 'a@a.ru',
  password: '123',
};

const todo = {
  title: 'Title',
  dateOfCompleted: '2021-03-29T00:08:30.000Z',
  todoPriority: TodoPriority.HIGH,
};

describe('Todo Flow', () => {
  let prisma: PrismaService;
  let todosService: TodosService;
  let authService: AuthService;
  let moduleRef: TestingModule;
  let jwtService: JwtService;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prisma = moduleRef.get(PrismaService);
    todosService = moduleRef.get(TodosService);
    authService = moduleRef.get(AuthService);
    jwtService = moduleRef.get(JwtService);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  describe('Create Todo', () => {
    beforeAll(async () => {
      await prisma.cleanDatabase();
    });

    it('should create new todo', async () => {
      const tokens = await authService.signupLocal(user);

      const { sub } = jwtService.decode(tokens.access_token);

      const todoPayload = await todosService.createATodo(sub, todo);

      expect(todoPayload).not.toBeUndefined();
    });
  });

  describe('Get All Todos By Current User', () => {
    beforeAll(async () => {
      await prisma.cleanDatabase();
    });

    it('should get all todos', async () => {
      const tokens = await authService.signupLocal(user);

      const { sub } = jwtService.decode(tokens.access_token);
      await todosService.createATodo(sub, todo);
      await todosService.createATodo(sub, todo);

      const todos = await todosService.getAllTodos(sub);
      expect(todos).toHaveLength(2);
    });
  });

  describe('Get One Todo By Id', () => {
    beforeAll(async () => {
      await prisma.cleanDatabase();
    });

    it('should get todo', async () => {
      const tokens = await authService.signupLocal(user);

      const { sub } = jwtService.decode(tokens.access_token);
      const newTodo = await todosService.createATodo(sub, todo);

      const arrivedTodo = await todosService.getOneTodo(newTodo.id);
      expect(arrivedTodo.title).toBe(todo.title);
      expect(arrivedTodo.dateOfCompleted.toISOString()).toBe(
        todo.dateOfCompleted,
      );
      expect(arrivedTodo.todoPriority).toBe(todo.todoPriority);
    });

    it('should throw not found todo in get', async () => {
      let arrivedTodo: Todo | null;
      try {
        arrivedTodo = await todosService.getOneTodo(100);
      } catch (error) {
        expect(error.status).toBe(404);
      }

      expect(arrivedTodo).toBeNull();
    });
  });

  describe('Update One Todo By Id', () => {
    beforeAll(async () => {
      await prisma.cleanDatabase();
    });

    it('should update todo', async () => {
      const tokens = await authService.signupLocal(user);

      const { sub } = jwtService.decode(tokens.access_token);
      const newTodo = await todosService.createATodo(sub, todo);

      todo.title += 'a';
      const updatedTodo = await todosService.updateOneTodo(newTodo.id, todo);

      expect(updatedTodo.title).toBe(todo.title);
    });

    it('should throw not found todo in update', async () => {
      let arrivedTodo: TodoPayload | undefined;
      try {
        arrivedTodo = await todosService.updateOneTodo(100, todo);
      } catch (error) {
        expect(error.status).toBe(404);
      }

      expect(arrivedTodo).toBeUndefined();
    });
  });

  describe('Delete One Todo By Id', () => {
    beforeAll(async () => {
      await prisma.cleanDatabase();
    });

    it('should delete todo', async () => {
      const tokens = await authService.signupLocal(user);

      const { sub } = jwtService.decode(tokens.access_token);
      const newTodo = await todosService.createATodo(sub, todo);
      const newTodoId = newTodo.id;

      const { id } = await todosService.removeOneTodo(newTodo.id);

      expect(id).toBe(newTodoId);
    });

    it('should throw not found todo in delete', async () => {
      let arrivedTodo: TodoDeletePayload | undefined;
      try {
        arrivedTodo = await todosService.removeOneTodo(100);
      } catch (error) {
        expect(error.status).toBe(404);
      }

      expect(arrivedTodo).toBeUndefined();
    });
  });
});
