import { getAbstractLists } from '../server/abstractListController';

describe('getAbstractLists', () => {
  it('should return 401 if user is not authenticated', async () => {
    // 1. Mock request and response objects
    const req = {} as Request;
    const res = {
      locals: {},
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    // 2. Call the function
    await getAbstractLists(req, res);

    // 3. Assertions
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  it('should return user abstract lists if authenticated', async () => {
    // 1. Mock request and response objects
    const mockUser = { abstractLists: [{ id: '1', title: 'Test List' }] };
    const req = {} as Request;
    const res = {
      locals: { user: mockUser },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    // 2. Call the function
    await getAbstractLists(req, res);

    // 3. Assertions
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUser.abstractLists);
  });
});
