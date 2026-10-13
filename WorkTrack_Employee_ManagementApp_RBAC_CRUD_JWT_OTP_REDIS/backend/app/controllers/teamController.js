import {
  createTeamService,
  viewAllTeamService,
  viewSingleTeamService,
  updateTeamService,
  deleteTeamService,
  addTeamMemberService,
  removeTeamMemberService,
  viewTeamMembersService,
  viewMyTeamService,
  viewMyTeamMembersService,
} from "../services/teamServices.js";

export const createTeamController = async (req, res) => {
  try {
    const team = await createTeamService(
      req.body,
      req.user,
    );

    return res.status(201).json({
      success: true,
      message: "Team created successfully",
      data: team,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const viewAllTeamsController = async (req, res) => {
  try {
    const teams = await viewAllTeamService(req.user);

    return res.status(200).json({
      success: true,
      data: teams,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const viewSingleTeamController = async (
  req,
  res,
) => {
  try {
    const team = await viewSingleTeamService(
      req.params.teamId,
      req.user,
    );

    return res.status(200).json({
      success: true,
      data: team,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateTeamController = async (req, res) => {
  try {
    const team = await updateTeamService(
      req.params.teamId,
      req.body,
      req.user,
    );

    return res.status(200).json({
      success: true,
      message: "Team updated successfully",
      data: team,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteTeamController = async (
  req,
  res,
) => {
  try {
    const result = await deleteTeamService(
      req.params.teamId,
      req.user,
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const addTeamMemberController = async (
  req,
  res,
) => {
  try {
    const result = await addTeamMemberService(
      req.params.teamId,
      req.params.employeeId,
      req.user,
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const removeTeamMemberController = async (
  req,
  res,
) => {
  try {
    const result = await removeTeamMemberService(
      req.params.teamId,
      req.params.employeeId,
      req.user,
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const viewTeamMembersController = async (
  req,
  res,
) => {
  try {
    const members = await viewTeamMembersService(
      req.params.teamId,
      req.user,
    );

    return res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const viewMyTeamController = async (
  req,
  res,
) => {
  try {
    const team = await viewMyTeamService(
      req.user._id,
    );

    return res.status(200).json({
      success: true,
      data: team,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const viewMyTeamMembersController = async (
  req,
  res,
) => {
  try {
    const members = await viewMyTeamMembersService(
      req.user._id,
    );

    return res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};