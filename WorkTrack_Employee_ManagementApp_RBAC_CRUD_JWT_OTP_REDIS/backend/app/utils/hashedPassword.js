import bcrypt from "bcrypt";

const hashedPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    } catch (error) {
        throw new Error(error.message);
    }
}

export default hashedPassword;