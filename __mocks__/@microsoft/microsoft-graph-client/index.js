const mockPut = jest.fn();
const mockPost = jest.fn();
const mockGet = jest.fn();
const mockPatch = jest.fn();
const mockDelete = jest.fn();
const mockHeader = jest.fn();
const mockVersion = jest.fn();

// Reset all to return 'this' for chaining by default
const resetChaining = () => {
  mockPut.mockReturnThis();
  mockPost.mockReturnThis();
  mockGet.mockReturnThis();
  mockPatch.mockReturnThis();
  mockDelete.mockReturnThis();
  mockHeader.mockReturnThis();
  mockVersion.mockReturnThis();
};

resetChaining();

// Create mock API that returns chainable methods
const mockApi = jest.fn(() => ({
  put: mockPut,
  post: mockPost,
  get: mockGet,
  patch: mockPatch,
  delete: mockDelete,
  header: mockHeader,
  version: mockVersion,
}));

const mockClient = {
  api: mockApi,
};

const Client = {
  initWithMiddleware: jest.fn(() => mockClient),
  init: jest.fn(() => mockClient),
};

module.exports = {
  Client,
  mockApi,
  mockPut,
  mockPost,
  mockGet,
  mockPatch,
  mockDelete,
  mockHeader,
  mockVersion,
  resetChaining,
};