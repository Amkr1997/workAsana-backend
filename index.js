const { initialization } = require("./db/db.connect");
initialization();
const Task = require("./models/task.model");
const Project = require("./models/project.model");
const Team = require("./models/team.model");
const User = require("./models/user.model");
const Tag = require("./models/tag.model");
const Completed = require("./models/completed.model");

const express = require("express");
const app = express();
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const corsOptions = {
  origin: "*",
  credentials: true,
  openSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => res.send("Express started"));

// Task Routes.
app.post("/addTask", async (req, res) => {
  const dataToAdd = req.body;

  try {
    const newData = new Task(dataToAdd);
    const savedTask = await newData.save();

    if (!savedTask) return res.status(404).json({ error: "Data not saved" });

    return res.status(200).json({ message: "Data got saved", savedTask });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/getTask", async (req, res) => {
  try {
    const foundData = await Task.find();

    if (!foundData)
      return res.status(404).json({ error: "An error occured between" });

    return res.status(200).json({ message: "Found all tasks", foundData });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

/*
// get populated task details
app.get("/getTask/populated", async (req, res) => {
  try {
    const foundData = await Task.find()
      .populate({ path: "project" })
      .populate({ path: "team" })
      .populate({ path: "owners" });

    if (!foundData)
      return res.status(404).json({ error: "An error occured between" });

    return res.status(200).json({ message: "Found the task", foundData });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});
*/

app.get("/getTask/populated/filtered", async (req, res) => {
  const { owners, team, project, tags } = req.query;
  let filter = {}; // Initializing empty object

  if (owners) {
    const allOwners = Array.isArray(owners) ? owners : owners.split(",");
    filter.owners = { $in: allOwners };
  }

  if (team && team !== "") {
    const allTeam = Array.isArray(team) ? team : team.split(",");
    filter.team = { $in: allTeam };
  }

  if (project && project !== "") {
    const allProject = Array.isArray(project) ? project : project.split(",");
    filter.project = { $in: allProject };
  }

  if (tags) {
    const allTags = Array.isArray(tags) ? tags : tags.split(",");

    const filteredStatus = allTags.filter((status) => {
      if (
        status === "Todo" ||
        status === "In Progress" ||
        status === "Completed" ||
        status === "Blocked"
      ) {
        return status;
      }
    });

    const filteredTags = allTags.filter((tags) => {
      if (tags === "Pending" || tags === "Priority") {
        return tags;
      }
    });

    if (filteredStatus.length > 0) {
      filter.status = filter.status
        ? { $in: [...filter.status.$in, ...filteredStatus] }
        : { $in: filteredStatus };
    }

    if (filteredTags.length > 0) {
      filter.tags = filter.tags
        ? { $in: [...filter.tags.$in, ...filteredTags] }
        : { $in: filteredTags };
    }
  }

  try {
    const foundData = await Task.find(filter)
      .populate({ path: "project" })
      .populate({ path: "team" })
      .populate({ path: "owners" });

    if (!foundData)
      return res.status(404).json({ error: "An error occured between" });

    return res.status(200).json({ message: "Found the task", foundData });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/updateTaskDetails/:taskId", async (req, res) => {
  const taskId = req.params.taskId;
  const dataToUpdate = req.body;

  try {
    const updatedTask = await Task.findByIdAndUpdate(taskId, dataToUpdate, {
      new: true,
    });

    if (!updatedTask)
      return res.status(404).json({ error: "Task cannot be updated" });

    return res.status(200).json({ message: "Updated task", updatedTask });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/deleteTask/:taskId", async (req, res) => {
  const taskId = req.params.taskId;

  try {
    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask)
      return res.status(404).json({ error: "Task cannot get delete" });

    return res.status(200).json({ message: "Deleted tasks", deletedTask });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Project Routes
app.post("/addProject", async (req, res) => {
  const dataToAdd = req.body;

  try {
    const newProject = new Project(dataToAdd);
    const savedProject = await newProject.save();

    if (!savedProject)
      return res.status(404).json({ error: "Cannot save project" });

    return res.status(200).json({ message: "Saved Project", savedProject });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/getAllProjects", async (req, res) => {
  try {
    const allProjects = await Project.find();

    if (!allProjects)
      return res.status(404).json({ error: "Cannot find project" });

    return res.status(200).json({ message: "Found Project", allProjects });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/updateProject/:projectId", async (req, res) => {
  const projectId = req.params.projectId;
  const projectToUpdate = req.body;

  try {
    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      projectToUpdate,
      {
        new: true,
      }
    );

    if (!updatedProject)
      return res.status(404).json({ error: "Cannot update project" });

    return res.status(200).json({ message: "Updated Project", updatedProject });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/deleteProject/:projectId", async (req, res) => {
  const projectId = req.params.projectId;

  try {
    const deletedProject = await Project.findByIdAndDelete(projectId);

    if (!deletedProject)
      return res.status(404).json({ error: "Project cannot get delete" });

    return res.status(200).json({ message: "Deleted project", deletedProject });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Team Routes
app.post("/addTeam", async (req, res) => {
  const dataToAdd = req.body;

  try {
    const newTeam = new Team(dataToAdd);
    const savedTeam = await newTeam.save();

    if (!savedTeam) return res.status(404).json({ error: "Cannot save team" });

    return res.status(200).json({ message: "Saved Team", savedTeam });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/getAllTeams", async (req, res) => {
  try {
    const allTeams = await Team.find();

    if (!allTeams) return res.status(404).json({ error: "Cannot find team" });

    return res.status(200).json({ message: "Found Team", allTeams });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/updateTeams/:teamId", async (req, res) => {
  const teamId = req.params.teamId;
  const teamToUpdate = req.body;

  try {
    const updatedTeam = await Team.findByIdAndUpdate(teamId, teamToUpdate, {
      new: true,
    });

    if (!updatedTeam)
      return res.status(404).json({ error: "Cannot update team" });

    return res.status(200).json({ message: "Updated Team", updatedTeam });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/deleteTeam/:teamId", async (req, res) => {
  const teamId = req.params.teamId;

  try {
    const deletedTeam = await Team.findByIdAndDelete(teamId);

    if (!deletedTeam)
      return res.status(404).json({ error: "Team cannot get delete" });

    return res.status(200).json({ message: "Deleted team", deletedTeam });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Tag Routes
app.post("/addTag", async (req, res) => {
  const dataToAdd = req.body;

  try {
    const newTag = new Tag(dataToAdd);
    const savedTag = await newTag.save();

    if (!savedTag) return res.status(404).json({ error: "Cannot save tag" });

    return res.status(200).json({ message: "Saved Tag", savedTag });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/getAllTags", async (req, res) => {
  try {
    const allTags = await Tag.find();

    if (!allTags) return res.status(404).json({ error: "Cannot find team" });

    return res.status(200).json({ message: "Found Tag", allTags });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// User Registration
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (name === "" && email === "" && password === "") {
      return res.status(400).json({ error: "Fill complete credentials" });
    }

    const alreadyUser = await User.findOne({ email });

    if (alreadyUser)
      return res.status(404).json({ error: "User already exists" });

    const newUser = new User({ name, email, password });
    newUser.password = await bcrypt.hash(password, 10);
    const savedUser = await newUser.save();

    if (!savedUser)
      return res.status(404).json({ error: "Cannot register user" });

    return res.status(200).json({ message: "User got registered", savedUser });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// User Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (email === "" && password === "") {
      return res.status(400).json({ error: "Fill complete credentials" });
    }

    const loginUser = await User.findOne({ email });

    if (!loginUser) return res.status(404).json({ error: "No user found" });

    const checkPass = await bcrypt.compare(password, loginUser.password);

    if (!checkPass)
      return res.status(401).json({ error: "Password doesn't match" });

    const jwtToken = jwt.sign(
      {
        userId: loginUser._id,
      },
      process.env.SECRET_KEY,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      message: "You logined successfully",
      jwtToken,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

const verifyJwt = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decodedToken;

    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Protected Route
app.get("/verify", verifyJwt, async (req, res) => {
  const loginedUser = req.user;

  if (!loginedUser)
    return res.status(404).json({ error: "not able to get user credentials" });

  return res.status(200).json({ message: "User data", loginedUser });
});

// Get Single User Data
app.get("/getUser/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const foundUser = await User.findById(userId).select("-password");

    if (!foundUser)
      return res.status(404).json({ error: "Can't find Userdata" });

    return res.status(200).json({ message: "User details found", foundUser });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get All Users
app.get("/getAllUsers", async (req, res) => {
  try {
    const allUsers = await User.find().select("-password");

    if (!allUsers)
      return res.status(404).json({ error: "Can't find all Users" });

    return res.status(200).json({ message: "All users found", allUsers });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log("Server started at port", PORT));
