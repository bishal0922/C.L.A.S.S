/**
 * NOTE: NOT USED YET
 * This file is responsible for handling user-related operations in our application.
 * 
 * We import the `clientPromise` from our `mongodb` file. This promise resolves to a connected MongoDB client,
 * which we use to interact with our MongoDB database.
 * 
 * The functions in this file will:
 * - Create a new user in the "users" collection.
 * - Retrieve a user from the "users" collection using their Firebase ID.
 * - Update a user's schedule in the "users" collection.
 * - Retrieve a user's schedule from the "users" collection using their Firebase ID.
 * 
 * Each function connects to the database, performs the necessary operation, and returns the result.
 */
async function fetchFromAPI(action, data) {
  const response = await fetch('/api/user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action, data }),
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

export async function createUser(userData) {
  return fetchFromAPI('createUser', userData);
}

export async function getUserByFirebaseId(firebaseId) {
  const result = await fetchFromAPI('getUserByFirebaseId', { firebaseId });
  return result.user;
}

export async function updateUserSchedule(firebaseId, schedule) {
  return fetchFromAPI('updateUserSchedule', { firebaseId, schedule });
}

export async function getUserSchedule(firebaseId) {
  const result = await fetchFromAPI('getUserSchedule', { firebaseId });
  return result.schedule;
}