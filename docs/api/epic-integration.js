// EPiC (Exercise Planning in Collaboration) Integration Example

const CosmicSyncCore = require('cosmicsynccore-sdk');

// Initialize the SDK with EPiC credentials
const cosmicSync = new CosmicSyncCore({
  appId: 'epic_app_id',
  appSecret: 'epic_app_secret'
});

// Define EPiC exercise model
async function defineExerciseModel() {
  try {
    const response = await cosmicSync.defineModel({
      name: 'Exercise',
      fields: [
        { name: 'name', type: 'string', required: true },
        { name: 'type', type: 'string', required: true },
        { name: 'muscleGroups', type: 'array', items: { type: 'string' } },
        { name: 'difficulty', type: 'number', min: 1, max: 10 },
        { name: 'instructions', type: 'string' },
        { name: 'createdBy', type: 'string' }
      ]
    });
    console.log('Exercise model defined:', response.modelId);
    return response.modelId;
  } catch (error) {
    console.error('Error defining exercise model:', error);
  }
}

// Define EPiC workout plan model
async function defineWorkoutPlanModel() {
  try {
    const response = await cosmicSync.defineModel({
      name: 'WorkoutPlan',
      fields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'string' },
        { name: 'exercises', type: 'array', items: { type: 'object', properties: {
          exerciseId: { type: 'string' },
          sets: { type: 'number' },
          reps: { type: 'number' },
          duration: { type: 'number' } // in seconds
        }}},
        { name: 'createdBy', type: 'string' },
        { name: 'isPublic', type: 'boolean', default: false }
      ]
    });
    console.log('Workout plan model defined:', response.modelId);
    return response.modelId;
  } catch (error) {
    console.error('Error defining workout plan model:', error);
  }
}

// Create an exercise
async function createExercise(modelId, exerciseData) {
  try {
    const response = await cosmicSync.createInstance(modelId, exerciseData);
    console.log('Exercise created:', response.instanceId);
    return response.instanceId;
  } catch (error) {
    console.error('Error creating exercise:', error);
  }
}

// Create a workout plan
async function createWorkoutPlan(modelId, planData) {
  try {
    const response = await cosmicSync.createInstance(modelId, planData);
    console.log('Workout plan created:', response.instanceId);
    return response.instanceId;
  } catch (error) {
    console.error('Error creating workout plan:', error);
  }
}

// Search for exercises
async function searchExercises(modelId, criteria) {
  try {
    const exercises = await cosmicSync.query(modelId, {
      filter: criteria
    });
    return exercises;
  } catch (error) {
    console.error('Error searching exercises:', error);
  }
}

// Share a workout plan
async function shareWorkoutPlan(modelId, planId) {
  try {
    await cosmicSync.updateInstance(modelId, planId, { isPublic: true });
    console.log('Workout plan shared successfully');
  } catch (error) {
    console.error('Error sharing workout plan:', error);
  }
}

// Example usage
async function main() {
  const exerciseModelId = await defineExerciseModel();
  const workoutPlanModelId = await defineWorkoutPlanModel();
  
  // Create an exercise
  const exerciseId = await createExercise(exerciseModelId, {
    name: 'Push-up',
    type: 'Bodyweight',
    muscleGroups: ['Chest', 'Triceps', 'Shoulders'],
    difficulty: 5,
    instructions: 'Start in a plank position...',
    createdBy: 'user123'
  });
  
  // Create a workout plan
  const planId = await createWorkoutPlan(workoutPlanModelId, {
    name: 'Full Body Workout',
    description: 'A comprehensive full body workout routine',
    exercises: [
      { exerciseId: exerciseId, sets: 3, reps: 10 }
    ],
    createdBy: 'user123'
  });
  
  // Search for chest exercises
  const chestExercises = await searchExercises(exerciseModelId, {
    muscleGroups: { $in: ['Chest'] }
  });
  console.log('Chest exercises:', chestExercises);
  
  // Share the workout plan
  await shareWorkoutPlan(workoutPlanModelId, planId);
  
  // Set up real-time updates for collaborative editing
  cosmicSync.subscribeToUpdates(workoutPlanModelId, planId, (update) => {
    console.log('Workout plan updated:', update);
  });
}

main();
