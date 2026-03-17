import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BoardsService } from './boards.service';
import { Board } from './entities/board.entity';

describe('BoardsService', () => {
  let service: BoardsService;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardsService,
        {
          provide: getRepositoryToken(Board),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<BoardsService>(BoardsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of boards', async () => {
      const boards = [{ id: '1', title: 'Test Board' }];
      mockRepository.find.mockResolvedValue(boards);

      const result = await service.findAll();

      expect(result).toEqual(boards);
      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: ['columns', 'columns.cards'],
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('create', () => {
    it('should create a new board', async () => {
      const input = { title: 'New Board' };
      const board = { id: '1', ...input };

      mockRepository.create.mockReturnValue(board);
      mockRepository.save.mockResolvedValue(board);

      const result = await service.create(input);

      expect(result).toEqual(board);
      expect(mockRepository.create).toHaveBeenCalledWith(input);
      expect(mockRepository.save).toHaveBeenCalledWith(board);
    });
  });
});
