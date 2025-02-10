import { addAbstractList } from '../server/abstractListController';
import { AbstractList } from '../utils/types';
import { Request } from 'express';

jest.mock('../server/schemas'); // Corrected the path to mock the model

describe('addAbstractList', () => {
  it('should add an abstract list for an authenticated user', async () => {
    // 1. Mock request, response, and user
    const mockUser = {
      abstractLists: [],
      save: jest.fn().mockResolvedValue(true),
    };
    
    const req = { body: { title: 'New List' } } as Request;
    const res = {
      locals: { user: mockUser },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    // Mock AbstractList constructor
    const mockAbstractList = { title: 'New List', items: [], date: new Date()};
    jest.spyOn(AbstractList, 'parseMongoDBObject').mockReturnValue(AbstractList.fromPlainObject(mockAbstractList));

    // 2. Call the function
    await addAbstractList(req, res);

    // 3. Assertions
    expect(mockUser.abstractLists.length).toBe(1);
    expect(mockUser.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: "Abstract list added successfully" });
  });
});
