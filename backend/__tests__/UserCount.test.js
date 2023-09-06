const app = require("../app");
const supertest = require("supertest");
const UserCount = require("../Models/UserCount");
const mongoose = require("mongoose");
const userCountController = require("../Controllers/userCountController");


describe("Tests that we can get the users who have recently visited the website", () => {
    let request;

    beforeEach(() => {
      request = supertest(app);
    });
    
    afterEach(() => {
      jest.restoreAllMocks();
    });
    
    test("Add a new user to an existing UserCount", async () => {
      const today = new Date(new Date().setHours(0, 0, 0, 0));
      let todayCount = new UserCount({
        date: today,
        count: 0,
        users: []
      })
      let user = {}
      user._id = new mongoose.Types.ObjectId()
      let todayCountMod = new UserCount({
        date: today,
        count: 1,
        users: [user._id]
      })
      const query = UserCount.findOne({});

      jest.spyOn(UserCount, "findOne").mockImplementationOnce(() => query);
      jest.spyOn(mongoose.Query.prototype, "select").mockImplementationOnce(() => Promise.resolve(todayCount));
      jest.spyOn(UserCount.prototype, "save").mockImplementationOnce(() => Promise.resolve(todayCountMod))

      const response = userCountController.addNewUser(user);
    });

    test("Create a new UserCount by adding a user", () => {

      const today = new Date(new Date().setHours(0, 0, 0, 0));
      let user = {}
      user._id = new mongoose.Types.ObjectId()
      const query = UserCount.findOne({});
      let todayCount = new UserCount({
        date: today,
        count: 1,
        users: [user._id]
      })

      jest.spyOn(UserCount, "findOne").mockImplementationOnce(() => query);
      jest.spyOn(mongoose.Query.prototype, "select").mockImplementationOnce(() => Promise.resolve(null));
      jest.spyOn(UserCount, "create").mockImplementationOnce(() => Promise.resolve(todayCount))

      const response = userCountController.addNewUser(user);
    });

    test("Don't add a user to a UserCount they already belong to", async () => {
      const today = new Date(new Date().setHours(0, 0, 0, 0));
      let user = {}
      user._id = new mongoose.Types.ObjectId()
      let todayCount = new UserCount({
        date: today,
        count: 1,
        users: [user._id]
      })

      const query = UserCount.findOne({});

      jest.spyOn(UserCount, "findOne").mockImplementationOnce(() => query);
      jest.spyOn(mongoose.Query.prototype, "select").mockImplementationOnce(() => Promise.resolve(todayCount));

      const response = userCountController.addNewUser(user);
    });

    test("No count activity", async() => {

      const query = UserCount.find({});
      jest.spyOn(UserCount, "find").mockImplementationOnce(() => query);
      jest.spyOn(mongoose.Query.prototype, "sort").mockImplementationOnce(() => Promise.resolve([]));

      jest.spyOn(UserCount, "find").mockImplementationOnce(() => query);
      jest.spyOn(mongoose.Query.prototype, "sort").mockImplementationOnce(() => Promise.resolve([]));

      jest.spyOn(UserCount, "find").mockImplementationOnce(() => query);
      jest.spyOn(mongoose.Query.prototype, "sort").mockImplementationOnce(() => Promise.resolve([]));

      jest.spyOn(UserCount, "find").mockImplementationOnce(() => query);
      jest.spyOn(mongoose.Query.prototype, "sort").mockImplementationOnce(() => Promise.resolve([]));

      const response = await request
        .get("/user-counts/")

      expect(response.body.status).toBe("success");
      expect(response.body.data.allTimeArray[0].count).toBe(0);
    })

    test("Activity in each category", async() => {

      let lastWeek = new Date(
        new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 6).setHours(
          0,
          0,
          0,
          0
        )
      );
      let lastMonth = new Date(
        new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 29).setHours(
          0,
          0,
          0,
          0
        )
      );
      let last3Months = new Date(
        new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 89).setHours(
          0,
          0,
          0,
          0
        )
      );
      let lastYear = new Date(
        new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 364).setHours(
          0,
          0,
          0,
          0
        )
      );
      let lastWeekCount = new UserCount({
        date: lastWeek,
        count: 1,
        users: [new mongoose.Types.ObjectId()]
      })
      let lastMonthCount = new UserCount({
        date: lastMonth,
        count: 1,
        users: [new mongoose.Types.ObjectId()]
      })
      let last3MonthsCount = new UserCount({
        date: last3Months,
        count: 1,
        users: [new mongoose.Types.ObjectId()]
      })
      let lastYearCount = new UserCount({
        date: lastYear,
        count: 1,
        users: [new mongoose.Types.ObjectId()]
      })

      const query = UserCount.find({});
      jest.spyOn(UserCount, "find").mockImplementationOnce(() => query);
      jest.spyOn(mongoose.Query.prototype, "sort").mockImplementationOnce(() => Promise.resolve([lastYearCount, last3MonthsCount, lastMonthCount, lastWeekCount]));

      jest.spyOn(UserCount, "find").mockImplementationOnce(() => query);
      jest.spyOn(mongoose.Query.prototype, "sort").mockImplementationOnce(() => Promise.resolve([lastWeekCount]));

      jest.spyOn(UserCount, "find").mockImplementationOnce(() => query);
      jest.spyOn(mongoose.Query.prototype, "sort").mockImplementationOnce(() => Promise.resolve([lastMonthCount, lastWeekCount]));

      jest.spyOn(UserCount, "find").mockImplementationOnce(() => query);
      jest.spyOn(mongoose.Query.prototype, "sort").mockImplementationOnce(() => Promise.resolve([last3MonthsCount, lastMonthCount, lastWeekCount]));

      const response = await request
        .get("/user-counts/")

      expect(response.body.status).toBe("success");

      let weekTotalCount = 0
      for (let i = 0; i < response.body.data.lastWeekArray.length; i++) {
        weekTotalCount += response.body.data.lastWeekArray[i].count
      }

      let monthTotalCount = 0
      for (let i = 0; i < response.body.data.lastMonthArray.length; i++) {
        monthTotalCount += response.body.data.lastMonthArray[i].count
      }

      let month3TotalCount = 0
      for (let i = 0; i < response.body.data.last3MonthsArray.length; i++) {
        month3TotalCount += response.body.data.last3MonthsArray[i].count
      }

      let allTimeTotalCount = 0
      for (let i = 0; i < response.body.data.allTimeArray.length; i++) {
        allTimeTotalCount += response.body.data.allTimeArray[i].count
      }

      expect(weekTotalCount).toBe(1);
      expect(monthTotalCount).toBe(2);
      expect(month3TotalCount).toBe(3);
      expect(allTimeTotalCount).toBe(4);
    })
})