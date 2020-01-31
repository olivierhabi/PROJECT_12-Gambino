import UserService from "../services/UserService";
import genToken from "../helpers/genToken";
import hashPassword from "../helpers/hashPassword";

class UserController {
  /**
   *
   * @param {object} req
   * @param {object} res
   * @return {object} user object
   */
  static async AddUser(req, res) {
    const { firstName, lastName, idNo, phone, email, password } = req.body;

    const hashedPassword = await hashPassword(password);
    try {
      const createUser = await UserService.addUser({
        firstName,
        lastName,
        idNo,
        phone,
        email,
        password: hashedPassword
      });

      const token = genToken({ firstName, lastName, idNo, phone, email });
      return res.status(201).send({
        status: 201,
        message: "Signup successfull",
        token: token,
        createUser
      });
    } catch (e) {
      console.log(e.errors);
      if (e.name === "SequelizeUniqueConstraintError") {
        const { message } = e.errors[0];
        let errorMessage = message;
        if (message === "idNo must be unique") {
          errorMessage = "The ID number is already exist";
        }
        if (message === "email must be unique") {
          errorMessage = "The email is already taken";
        }
        if (message === "phone must be unique") {
          errorMessage = "The phone number is already taken";
        }
        return res.status(400).send({ status: 400, message: errorMessage });
      }
      return res
        .status(500)
        .send({ status: 500, message: "INTERNAL_SERVER ERROR" });
    }
  }
}

export default UserController;
