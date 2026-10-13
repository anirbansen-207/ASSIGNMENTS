import bcrypt from "bcrypt";

// compare password utility
const comparePassword = async (password, hashedPassowrd) => {
    try {
        return await bcrypt.compare(password, hashedPassowrd);
    } catch (error) {
        throw new Error(error.message);
    }
}

export default comparePassword;
