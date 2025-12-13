const request = require('supertest');
const app = require('../src/api');

const AUTH_HEADER = process.env.BACKOFFICE_HEADER_NAME;
const AUTH_VALUE = process.env.BACKOFFICE_HEADER_VALUE;

jest.mock('../src/microsoft-sharepoint');
const sharepoint = require('../src/microsoft-sharepoint');

describe('photo upload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /photo', () => {
    it('should upload photo successfully', async () => {
      const mockUrl = 'https://example.com/photo.jpg';
      sharepoint.uploadPhoto = jest.fn().mockResolvedValue(mockUrl);

      const response = await request(app)
        .post('/.netlify/functions/api/photo')
        .set(AUTH_HEADER, AUTH_VALUE)
        .set('Content-Type', 'multipart/form-data')
        .attach('file', Buffer.from('some image content'), 'test.jpg')
        .expect(200);

      expect(response.body).toEqual({ link: mockUrl });
    });

    it('should handle requests without file', async () => {
      await request(app)
        .post('/.netlify/functions/api/photo')
        .set(AUTH_HEADER, AUTH_VALUE)
        .expect(400);
    });

    it('should handle large image files', async () => {
      const mockUrl = 'https://example.com/large-photo.png';
      sharepoint.uploadPhoto = jest.fn().mockResolvedValue(mockUrl);

      const largeBuffer = Buffer.alloc(5 * 1024 * 1024); // 5 MB
      const response = await request(app)
        .post('/.netlify/functions/api/photo')
        .set(AUTH_HEADER, AUTH_VALUE)
        .attach('file', largeBuffer, 'large-photo.png')
        .expect(200);

      expect(response.body.link).toBe(mockUrl);
    });

    it('should return 400 when auth header is missing', async () => {
      const response = await request(app)
        .post('/.netlify/functions/api/photo')
        .attach('file', Buffer.from('some image content'), 'test.jpg')
        .expect(400);

      expect(sharepoint.uploadPhoto).not.toHaveBeenCalled();
    });

    it('should return 400 when auth header value is incorrect', async () => {
      const response = await request(app)
        .post('/.netlify/functions/api/photo')
        .set(AUTH_HEADER, 'wrong-value')
        .attach('file', Buffer.from('some image content'), 'test.jpg')
        .expect(400);

      expect(sharepoint.uploadPhoto).not.toHaveBeenCalled();
    });

    it('should return 200 with error when upload fails', async () => {
      const mockError = new Error('upload failed');
      sharepoint.uploadFile = jest.fn().mockRejectedValue(mockError);

      const response = await request(app)
        .post('/.netlify/functions/api/photo')
        .set(AUTH_HEADER, AUTH_VALUE)
        .attach('file', Buffer.from('some image content'), 'test.jpg')
        .expect(200);

      // FIXME
      // expect(response.body.errors).toContain('upload failed');
    });
  });
});