const request = require('supertest');
const app = require('../src/api');

const AUTH_HEADER = process.env.BACKOFFICE_HEADER_NAME;
const AUTH_VALUE = process.env.BACKOFFICE_HEADER_VALUE;

// Microsoft graph client mocks are automatically picked up from __mocks__ folder
jest.mock('@azure/identity');
jest.mock('@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials');
jest.mock('@microsoft/microsoft-graph-client');

const { mockPost } = require('@microsoft/microsoft-graph-client');

describe('Legacy API endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /data', () => {
    it('should upload beach clean data successfully', async () => {
      const items = [
        {
          "id": "1",
          "signature": {
            "name": "christina",
            "email": "",
            "token": "test"
          },
          "type": "Trash",
          "date": 1648984888413,
          "location": "Guinjata",
          "category": "Lighter",
          "quantity": 3
        },
        {
          "id": "2",
          "signature": undefined,
          "type": "Trash",
          "date": 1648984888413,
          "location": "Paindane",
          "category": "Glow stick",
          "quantity": 0
        }
      ];

      const response = await request(app)
        .post('/.netlify/functions/api/data')
        .set('Content-type', 'application/json')
        .set(AUTH_HEADER, AUTH_VALUE)
        .send({ items: items })
        .expect(200);

      expect(response.body.uploaded.length).toBe(2);
      expect(response.body.uploaded).toContain("1");
      expect(response.body.uploaded).toContain("2");
      expect(response.body.errors.length).toBe(0);

      expect(mockPost).toHaveBeenCalled();  
      const postedBody = JSON.parse(mockPost.mock.calls[0][0]);
      expect(postedBody.values.length).toBe(2);
      const row1 = postedBody.values[0];
      const row2 = postedBody.values[1];
      expect(row1.slice(0, -1)).toEqual([
        "christina","","test","2022-04-03","13:21:28","Guinjata","Lighter",3,""
      ]);
      expect(row2.slice(0, -1)).toEqual([
        "","","","2022-04-03","13:21:28","Paindane","Glow stick",0,""
      ]);
    });

    it('should handle empty items array', async () => {
      const response = await request(app)
        .post('/.netlify/functions/api/data')
        .set(AUTH_HEADER, AUTH_VALUE)
        .send({ items: [] })
        .expect(200);

      expect(response.body.uploaded.length).toBe(0);
      expect(response.body.errors.length).toBe(0);
    });

    it('should return 400 when auth header is missing', async () => {
      await request(app)
        .post('/.netlify/functions/api/data')
        .send({ items: [] })
        .expect(400);

      expect(mockPost).not.toHaveBeenCalled();
    });

    it('should return 400 when auth header value is incorrect', async () => {
      await request(app)
        .post('/.netlify/functions/api/data')
        .set(AUTH_HEADER, 'wrong-value')
        .send({ items: [] })
        .expect(400);

      expect(mockPost).not.toHaveBeenCalled();
    });

    it('should return 400 when items are missing', async () => {
      await request(app)
        .post('/.netlify/functions/api/data')
        .set(AUTH_HEADER, AUTH_VALUE)
        .send({})
        .expect(400);

      expect(mockPost).not.toHaveBeenCalled();
    });

    it('should return 400 when items is null', async () => {
      await request(app)
        .post('/.netlify/functions/api/data')
        .set(AUTH_HEADER, AUTH_VALUE)
        .send({ items: null })
        .expect(400);

      expect(mockPost).not.toHaveBeenCalled();
    });

    it('should return 200 with error when upload fails', async () => {
      const mockError = new Error('connection timeout');
      mockPost.mockRejectedValue(mockError);

      const response = await request(app)
        .post('/.netlify/functions/api/data')
        .set(AUTH_HEADER, AUTH_VALUE)
        .send({ items: [] })
        .expect(200);

      // FIXME
      // expect(response.body.errors).toContain('connection timeout');
    });

    it('should handle malformed JSON gracefully', async () => {
      await request(app)
        .post('/.netlify/functions/api/data')
        .set(AUTH_HEADER, AUTH_VALUE)
        .send('{ invalid json }')
        .expect(400);
    });
  });
});