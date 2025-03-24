import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Error generating tokens:", error);
        throw new ApiError(500, "Something went wrong while generating access and refresh tokens");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, phoneNumber, email, password, companyName, ajency } = req.body;

    if (!fullName || !email || !password || !companyName || !phoneNumber) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ phoneNumber }, { email }]
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or phone number already exists")
    }

    const user = await User.create({
        fullName,
        email,
        password,
        companyName,
        phoneNumber,
        ajency
    });
    console.log(req.body)
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while regestering the user")
    }

    return res.status(201).json(new ApiResponse(200, createdUser, "User regestration successfully"));
})

const loginUser = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User doesn't exist");
    }

    const isPasswordvalid = await user.isPasswordCorrect(password);

    if (!isPasswordvalid) {
        throw new ApiError(401, "Incorrect user credintials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully"));
})

export { registerUser, loginUser };