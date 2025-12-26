// Generic App Integration Example

const CivicBase = require('civicbase-sdk');

// Initialize the SDK with your app's credentials
const cosmicSync = new CivicBase({
  appId: 'your_app_id',
  appSecret: 'your_app_secret'
});

// Define a custom data model
async function defineCustomModel() {
  try {
    const response = await cosmicSync.defineModel({
      name: 'UserProfile',
      fields: [
        { name: 'interests', type: 'array', items: { type: 'string' } },
        { name: 'values', type: 'array', items: { type: 'string' } },
        { name: 'emotionalState', type: 'string' },
        { name: 'growthAreas', type: 'array', items: { type: 'string' } },
        { name: 'lifeStage', type: 'string' }
      ]
    });
    console.log('Custom model defined:', response.modelId);
    return response.modelId;
  } catch (error) {
    console.error('Error defining custom model:', error);
  }
}

// Create a user profile
async function createUserProfile(modelId, userData) {
  try {
    const response = await cosmicSync.createInstance(modelId, userData);
    console.log('User profile created:', response.instanceId);
    return response.instanceId;
  } catch (error) {
    console.error('Error creating user profile:', error);
  }
}

// Update a user profile
async function updateUserProfile(modelId, instanceId, updates) {
  try {
    await cosmicSync.updateInstance(modelId, instanceId, updates);
    console.log('User profile updated successfully');
  } catch (error) {
    console.error('Error updating user profile:', error);
  }
}

// Example usage
async function main() {
  const modelId = await defineCustomModel();
  
  const userData = {
    interests: ['hiking', 'photography', 'cooking'],
    values: ['honesty', 'environmental conservation'],
    emotionalState: 'excited',
    growthAreas: ['public speaking', 'French language'],
    lifeStage: 'career-focused'
  };
  
  const profileId = await createUserProfile(modelId, userData);
  
  // Later, update the profile
  await updateUserProfile(modelId, profileId, {
    emotionalState: 'calm',
    interests: ['hiking', 'photography', 'cooking', 'gardening']
  });
  
  // Set up real-time updates
  cosmicSync.subscribeToUpdates(modelId, profileId, (update) => {
    console.log('Profile updated:', update);
  });
}

main();
