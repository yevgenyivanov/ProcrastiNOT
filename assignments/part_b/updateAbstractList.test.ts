import { updateAbstractList } from '../server/abstractListController';
import { Request } from 'express';

describe('updateAbstractList', () => {
  it('should update an existing abstract list', async () => {
    // 1. Mock request, response, and user
    const mockList = { title: 'Old Title', items: [], id: jest.fn().mockReturnThis() };
    const mockUser = {
      abstractLists: { id: jest.fn().mockReturnValue(mockList) },
      save: jest.fn().mockResolvedValue(true),
    };

    const req = { params: { id: '1' }, body: { title: 'Updated Title' } } as Request;
    const res = {
      locals: { user: mockUser },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    // 2. Call the function
    await updateAbstractList(req, res);

    // 3. Assertions
    expect(mockUser.abstractLists.id).toHaveBeenCalledWith('1');
    expect(mockList.title).toBe('Updated Title');
    expect(mockUser.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Abstract list updated successfully" });
  });

  it('should return 404 if abstract list is not found', async () => {
    // 1. Mock request, response, and user
    const mockUser = {
      abstractLists: { id: jest.fn().mockReturnValue(null) },
    };

    const req = { params: { id: 'invalid' }, body: { title: 'New Title' } } as Request;
    const res = {
      locals: { user: mockUser },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    // 2. Call the function
    await updateAbstractList(req, res);

    // 3. Assertions
    expect(mockUser.abstractLists.id).toHaveBeenCalledWith('invalid');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Abstract list not found" });
  });
});
