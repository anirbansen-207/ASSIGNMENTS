
import Department from "../models/Department.js";
import DepartmentLeavePolicy from "../models/DepartmentLeavePolicy.js";
import User from "../models/User.js";

// Remove sensitive account fields before returning user data.
const safeUserFields =
  "name email role department departmentId designation isVerified createdBy";

const getDepartmentManagementData = async (department) => {
  const departmentId = department._id;

  // Only verified managers assigned to this department.
  const managers = await User.find({
    role: "manager",
    departmentId,
    isVerified: true,
  })
    .select(safeUserFields)
    .sort({ name: 1 })
    .lean();

  // Employees assigned to this department.
  const employees = await User.find({
    role: "employee",
    departmentId,
  })
    .select(safeUserFields)
    .sort({ name: 1 })
    .lean();

  // Fetch the current leave policy for this department, if configured.
  const leavePolicy = await DepartmentLeavePolicy.findOne({
    departmentId,
  }).lean();

  // Group employees under the manager who created them.
  const managersWithEmployees = managers.map((manager) => ({
    ...manager,
    employees: employees.filter(
      (employee) =>
        employee.createdBy &&
        employee.createdBy.toString() === manager._id.toString(),
    ),
  }));

  // Keep employees visible even if they have no matching verified manager.
  return {
    ...department.toObject(),
    managers: managersWithEmployees,
    employees,
    leavePolicy: leavePolicy || null,
  };
};

// Create department.
export const createDepartmentService = async (data, adminId) => {
  try {
    const existingDepartment = await Department.findOne({
      name: data.name,
    });

    if (existingDepartment) {
      throw new Error("Department already exists");
    }

    const department = await Department.create({
      name: data.name,
      description: data.description || "",
      createdBy: adminId,
    });

    return department;
  } catch (error) {
    throw new Error(error.message);
  }
};

// View all active departments, including management data and leave policy.
export const viewAllDepartmentsService = async () => {
  try {
    const departments = await Department.find({
      isActive: true,
    }).sort({ name: 1 });

    return await Promise.all(
      departments.map(getDepartmentManagementData),
    );
  } catch (error) {
    throw new Error(error.message);
  }
};

// View a single department, including management data and leave policy.
export const viewSingleDepartmentService = async (departmentId) => {
  try {
    const department = await Department.findById(departmentId);

    if (!department) {
      throw new Error("Department not found");
    }

    return await getDepartmentManagementData(department);
  } catch (error) {
    throw new Error(error.message);
  }
};

// Update department.
export const updateDepartmentService = async (departmentId, data) => {
  try {
    const department = await Department.findById(departmentId);

    if (!department) {
      throw new Error("Department not found");
    }

    const updatedDepartment = await Department.findByIdAndUpdate(
      departmentId,
      data,
      {
        new: true,
        runValidators: true,
      },
    );

    return updatedDepartment;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Delete department using the existing soft-delete behavior.
export const deleteDepartmentService = async (departmentId) => {
  try {
    const department = await Department.findById(departmentId);

    if (!department) {
      throw new Error("Department not found");
    }

    department.isActive = false;

    await department.save();

    return department;
  } catch (error) {
    throw new Error(error.message);
  }
};
