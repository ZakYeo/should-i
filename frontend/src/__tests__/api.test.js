import { checkCoat, saveCommentToDB, getNearbyComments } from "../util/api.js";
import nock from "nock";

describe("API tests", () => {
  let consoleLogMock;
  let consoleErrorMock;

  beforeEach(() => {
    process.env.REACT_APP_API_URL = "http://localhost:3000/";
    nock.disableNetConnect();

    consoleLogMock = jest.spyOn(console, "log").mockImplementation();
    consoleErrorMock = jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();

    consoleLogMock.mockRestore();
    consoleErrorMock.mockRestore();
  });

  describe("checkCoat", () => {
    it("fetches successfully data from check-coat", async () => {
      const mockData = { status: "Needed" };
      nock("http://localhost:3000")
        .get("/check-coat?lat=45&lon=-122")
        .reply(200, mockData);

      const result = await checkCoat(45.0, -122.0);

      expect(result).toEqual(mockData);
    });

    it("throws an error when the API call fails to check-coat", async () => {
      nock("http://localhost:3000")
        .get("/check-coat?lat=45&lon=-122")
        .replyWithError("Something went wrong");

      await expect(checkCoat(45.0, -122.0)).rejects.toThrow(
        "Something went wrong",
      );
    });
  });

  describe("saveCommentToDB", () => {
    it("saves a comment to the database successfully", async () => {
      const mockResponse = { id: 1, message: "Comment saved" };
      nock("http://localhost:3000")
        .post("/comment/save", {
          userName: "john",
          commentDescription: "Nice place",
          latitude: 45.0,
          longitude: -122.0,
        })
        .reply(201, mockResponse);

      const result = await saveCommentToDB("john", "Nice place", 45.0, -122.0);

      expect(result).toEqual({ data: mockResponse, statusCode: 201 });
    });

    it("returns error data when the API call fails to /comment/save", async () => {
      const errorResponse = { message: "Failed to save comment" };
      nock("http://localhost:3000")
        .post("/comment/save", {
          userName: "john",
          commentDescription: "Nice place",
          latitude: 45.0,
          longitude: -122.0,
        })
        .reply(404, errorResponse);

      const result = await saveCommentToDB("john", "Nice place", 45.0, -122.0);

      expect(result).toEqual({ data: errorResponse, statusCode: 404 });
    });
  });

  describe("getNearbyComments", () => {
    it("fetches nearby comments successfully", async () => {
      const mockData = [{ id: 1, comment: "Nice view!" }];
      nock("http://localhost:3000")
        .get("/comment/get/nearby")
        .query({ lat: 45.0, lon: -122.0 })
        .reply(200, mockData);

      const result = await getNearbyComments(45.0, -122.0);

      expect(result).toEqual(mockData);
    });

    it("throws an error when fetching nearby comments fails", async () => {
      nock("http://localhost:3000")
        .get("/comment/get/nearby")
        .query({ lat: 45.0, lon: -122.0 })
        .replyWithError("Network error");

      await expect(getNearbyComments(45.0, -122.0)).rejects.toThrow(
        "Network error",
      );
    });
  });
});
