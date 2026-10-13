import axiosInstance from "./axios";

// View own profile api
export const viewOwnProfileApi = async()=>{
    const response = await axiosInstance.get("/api/employee/viewOwnProfile");
    return response.data.employeeProfile;
};

// Update own profile api
export const updateOwnProfileApi = async(data)=>{
    const response = await axiosInstance.put("/api/employee/updateOwnProfile",data);
    return response.data.updatedEmployee;
};