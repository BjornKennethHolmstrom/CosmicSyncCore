// HeartSpheres Integration Example

const CosmicSyncCore = require('cosmicsynccore-sdk');
const CryptoJS = require('crypto-js'); // For local encryption

// Initialize the SDK with HeartSpheres credentials
const cosmicSync = new CosmicSyncCore({
  appId: 'heartsheres_app_id',
  appSecret: 'heartsheres_app_secret'
});

// Local encryption key (in a real app, this should be securely generated and stored)
const encryptionKey = 'user_specific_encryption_key';

// Encrypt data locally
function encryptData(data) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), encryptionKey).toString();
}

// Decrypt data locally
function decryptData(encryptedData) {
  const bytes = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}

// Define HeartSpheres user profile model
async function defineHeartSpheresModel() {
  try {
    const response = await cosmicSync.defineModel({
      name: 'HeartSpheresProfile',
      fields: [
        { name: 'encryptedData', type: 'string' },
        { name: 'publicInterests', type: 'array', items: { type: 'string' } },
        { name: 'publicValues', type: 'array', items: { type: 'string' } }
      ]
    });
    console.log('HeartSpheres model defined:', response.modelId);
    return response.modelId;
  } catch (error) {
    console.error('Error defining HeartSpheres model:', error);
  }
}

// Create a HeartSpheres user profile
async function createHeartSpheresProfile(modelId, userData) {
  const { interests, values, personalInfo, ...publicData } = userData;
  const encryptedPersonalInfo = encryptData(personalInfo);
  
  const profileData = {
    encryptedData: encryptedPersonalInfo,
    publicInterests: interests,
    publicValues: values
  };
  
  try {
    const response = await cosmicSync.createInstance(modelId, profileData);
    console.log('HeartSpheres profile created:', response.instanceId);
    return response.instanceId;
  } catch (error) {
    console.error('Error creating HeartSpheres profile:', error);
  }
}

// Find potential matches
async function findMatches(modelId, userProfileId, criteria) {
  try {
    const matches = await cosmicSync.query(modelId, {
      filter: {
        publicInterests: { $in: criteria.interests },
        publicValues: { $in: criteria.values }
      },
      exclude: [userProfileId] // Exclude the current user
    });
    return matches.map(match => ({
      profileId: match.id,
      sharedInterests: match.publicInterests.filter(i => criteria.interests.includes(i)),
      sharedValues: match.publicValues.filter(v => criteria.values.includes(v))
    }));
  } catch (error) {
    console.error('Error finding matches:', error);
  }
}

// Request connection
async function requestConnection(fromProfileId, toProfileId) {
  // In a real app, this would be handled through a separate connection request system
  console.log(`Connection request sent from ${fromProfileId} to ${toProfileId}`);
}

// Example usage
async function main() {
  const modelId = await defineHeartSpheresModel();
  
  const userData = {
    interests: ['hiking', 'photography', 'cooking'],
    values: ['honesty', 'environmental conservation'],
    personalInfo: {
      name: 'Alice Smith',
      age: 28,
      location: 'New York'
    }
  };
  
  const profileId = await createHeartSpheresProfile(modelId, userData);
  
  // Find potential matches
  const matches = await findMatches(modelId, profileId, {
    interests: ['hiking', 'photography'],
    values: ['honesty']
  });
  
  console.log('Potential matches:', matches);
  
  // Request connection with the first match
  if (matches.length > 0) {
    await requestConnection(profileId, matches[0].profileId);
  }
}

main();
