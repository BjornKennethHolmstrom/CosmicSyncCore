// MindSpheres Integration Example

const CosmicSyncCore = require('cosmicsynccore-sdk');

// Initialize the SDK with MindSpheres credentials
const cosmicSync = new CosmicSyncCore({
  appId: 'mindsheres_app_id',
  appSecret: 'mindsheres_app_secret'
});

// Define MindSpheres user profile model
async function defineUserProfileModel() {
  try {
    const response = await cosmicSync.defineModel({
      name: 'MindSpheresProfile',
      fields: [
        { name: 'skills', type: 'array', items: { type: 'string' } },
        { name: 'interests', type: 'array', items: { type: 'string' } },
        { name: 'expertise', type: 'array', items: { type: 'string' } },
        { name: 'lookingToLearn', type: 'array', items: { type: 'string' } },
        { name: 'availableForMentoring', type: 'boolean', default: false }
      ]
    });
    console.log('MindSpheres profile model defined:', response.modelId);
    return response.modelId;
  } catch (error) {
    console.error('Error defining MindSpheres profile model:', error);
  }
}

// Define project model
async function defineProjectModel() {
  try {
    const response = await cosmicSync.defineModel({
      name: 'Project',
      fields: [
        { name: 'title', type: 'string', required: true },
        { name: 'description', type: 'string' },
        { name: 'skills', type: 'array', items: { type: 'string' } },
        { name: 'creator', type: 'string' },
        { name: 'collaborators', type: 'array', items: { type: 'string' } },
        { name: 'status', type: 'string', enum: ['Planning', 'In Progress', 'Completed'] }
      ]
    });
    console.log('Project model defined:', response.modelId);
    return response.modelId;
  } catch (error) {
    console.error('Error defining project model:', error);
  }
}

// Create a user profile
async function createUserProfile(modelId, profileData) {
  try {
    const response = await cosmicSync.createInstance(modelId, profileData);
    console.log('MindSpheres profile created:', response.instanceId);
    return response.instanceId;
  } catch (error) {
    console.error('Error creating MindSpheres profile:', error);
  }
}

// Create a project
async function createProject(modelId, projectData) {
  try {
    const response = await cosmicSync.createInstance(modelId, projectData);
    console.log('Project created:', response.instanceId);
    return response.instanceId;
  } catch (error) {
    console.error('Error creating project:', error);
  }
}

// Find potential collaborators
async function findCollaborators(userModelId, projectModelId, projectId) {
  try {
    const project = await cosmicSync.getInstance(projectModelId, projectId);
    const potentialCollaborators = await cosmicSync.query(userModelId, {
      filter: {
        $or: [
          { skills: { $in: project.skills } },
          { interests: { $in: project.skills } }
        ]
      }
    });
    return potentialCollaborators;
  } catch (error) {
    console.error('Error finding potential collaborators:', error);
  }
}

// Join a project
async function joinProject(projectModelId, projectId, userId) {
  try {
    await cosmicSync.updateInstance(projectModelId, projectId, {
      $push: { collaborators: userId }
    });
    console.log(`User ${userId} joined project ${projectId}`);
  } catch (error) {
    console.error('Error joining project:', error);
  }
}

// Example usage
async function main() {
  const userModelId = await defineUserProfileModel();
  const projectModelId = await defineProjectModel();
  
  // Create a user profile
  const userId = await createUserProfile(userModelId, {
    skills: ['JavaScript', 'React', 'Node.js'],
    interests: ['AI', 'Web Development', 'Open Source'],
    expertise: ['Frontend Development'],
    lookingToLearn: ['Machine Learning', 'GraphQL'],
    availableForMentoring: true
  });
  
  // Create a project
  const projectId = await createProject(projectModelId, {
    title: 'AI-powered Web App',
    description: 'Developing a web application with AI features',
    skills: ['JavaScript', 'React', 'Machine Learning'],
    creator: userId,
    status: 'Planning'
  });
  
  // Find potential collaborators
  const collaborators = await findCollaborators(userModelId, projectModelId, projectId);
  console.log('Potential collaborators:', collaborators);
  
  // Join the project (simulating another user joining)
  await joinProject(projectModelId, projectId, 'anotherUserId');
  
  // Set up real-time updates for project collaboration
  cosmicSync.subscribeToUpdates(projectModelId, projectId, (update) => {
    console.log('Project updated:', update);
  });
}

main();
