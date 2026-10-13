import axiosInstance from "./axios";

export const createTeamApi =
  async (teamData) => {
    const response =
      await axiosInstance.post(
        "/api/team/create-team",
        teamData,
      );

    return response.data.data;
  };

export const getAllTeamsApi =
  async () => {
    const response =
      await axiosInstance.get(
        "/api/team/all-teams",
      );

    return response.data.data;
  };

export const getSingleTeamApi =
  async (teamId) => {
    const response =
      await axiosInstance.get(
        `/api/team/team-details/${teamId}`,
      );

    return response.data.data;
  };

export const updateTeamApi =
  async (teamId, teamData) => {
    const response =
      await axiosInstance.put(
        `/api/team/update-team/${teamId}`,
        teamData,
      );

    return response.data.data;
  };

export const deleteTeamApi =
  async (teamId) => {
    const response =
      await axiosInstance.delete(
        `/api/team/delete-team/${teamId}`,
      );

    return response.data;
  };

export const addTeamMemberApi =
  async (
    teamId,
    employeeId,
  ) => {
    const response =
      await axiosInstance.patch(
        `/api/team/add-member/${teamId}/${employeeId}`,
      );

    return response.data;
  };

export const removeTeamMemberApi =
  async (
    teamId,
    employeeId,
  ) => {
    const response =
      await axiosInstance.delete(
        `/api/team/remove-member/${teamId}/${employeeId}`,
      );

    return response.data;
  };

export const getTeamMembersApi =
  async (teamId) => {
    const response =
      await axiosInstance.get(
        `/api/team/team-members/${teamId}`,
      );

    return response.data.data;
  };

export const getMyTeamApi =
  async () => {
    const response =
      await axiosInstance.get(
        "/api/team/my-team",
      );

    return response.data.data;
  };

export const getMyTeamMembersApi =
  async () => {
    const response =
      await axiosInstance.get(
        "/api/team/my-team/members",
      );

    return response.data.data;
  };