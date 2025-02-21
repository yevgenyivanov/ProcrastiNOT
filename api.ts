import axios from "axios";

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  userID: string;
}

interface RegisterRequest {
  email: string;
  password: string;
}

interface RegisterResponse {
  id: string;
  email: string;
}

interface AbstractListItem {
  text: string;
  desc?: string;
  date: Date;
  completed: boolean;
}

interface AbstractList {
  title: string;
  items: AbstractListItem[];
  date: Date;
  id: string;
}

interface CollabList {
  title: string;
  items: AbstractListItem[];
  date: Date;
  id: string;
  owner: string;
  members: string[];
}

// const API_URL = "http://localhost:3000"; // Adjust the URL if necessary
// Android/Windows
const API_URL = "http://10.0.2.2:3000"; 

// Login user
export const loginUser = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await axios.post<LoginResponse>(`${API_URL}/login`, {
      email,
      password,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Login failed");
  }
};

// Register user
export const registerUser = async (
  email: string,
  password: string
): Promise<RegisterResponse> => {
  try {
    const response = await axios.post<RegisterResponse>(`${API_URL}/register`, {
      email,
      password,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Registration failed");
  }
};

// Google login



// Fetch all abstract lists for the logged-in user
export const fetchAllLists = async (token: string | null): Promise<AbstractList[]> => {
  try {
    if (!token) {
      throw new Error("No token provided");
    }
    const response = await axios.get<AbstractList[]>(`${API_URL}/abstract-lists`, {
      headers: {
        Authorization: `Bearer ${token}`, // Send the token as a Bearer token
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch abstract lists");
  }
};

// Add a new abstract list for the logged-in user
export const createList = async (
  token: string | null,
  title: string,
  items: AbstractListItem[]
): Promise<{ message: string }> => {
  try {
    if (!token) {
      throw new Error("No token provided");
    }
    
    const response = await axios.post<{ message: string }>(
      `${API_URL}/abstract-lists`,
      { title, items },
      {
        headers: {
          Authorization: `Bearer ${token}`, // Send the token as a Bearer token
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to add abstract list");
  }
};

// Update an existing abstract list
export const updateExistingList = async (
  token: string | null,
  listId: string,
  title: string,
  items: AbstractListItem[]
): Promise<{ message: string }> => {
  try {
    if (!token) {
      throw new Error("No token provided");
    }
    const response = await axios.put<{ message: string }>(
      `${API_URL}/abstract-lists/${listId}`,
      { title, items },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update list");
  }
};

// Delete an abstract list
export const deleteExistingList = async (
  token: string | null,
  listId: string
): Promise<{ message: string }> => {
  try {
    const response = await axios.delete<{ message: string }>(`${API_URL}/abstract-lists/${listId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to delete list");
  }
};

// Override all abstract lists for the logged-in user
export const overrideAllLists = async (
  token: string | null,
  lists: AbstractList[]
): Promise<{ message: string }> => {
  try {
    if (!token) {
      throw new Error("No token provided");
    }

    // Make the PUT request to override lists
    const response = await axios.put<{ message: string }>(
      `${API_URL}/abstract-lists`,
      { abstractLists: lists }, // Send the lists as part of the request body
      {
        headers: {
          Authorization: `Bearer ${token}`, // Send the JWT token in the Authorization header
        },
      }
    );
    
    return response.data;  // Return the success message from the server
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to override lists");
  }
};

export const createCollabList = async ( 
  token: string | null, 
  title: string
): Promise<{ message: string }> => {
  try{
    if(!token){
      throw new Error("No token provided");
    }
    const response = await axios.post<{ message: string }>(
      `${API_URL}/create-collab-list`,
      { title },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  }catch(error: any){
    throw new Error(error.response?.data?.message || "Failed to create collab list");
  }
};

// FIXME: Data needs to be parsed to the correct type AbstractCollabList (new type inherited from AbstractList)
//
export const fetchAllCollabLists = async ( 
  token: string | null, 
): Promise<CollabList[]> => {
  try{
    if(!token){
      throw new Error("No token provided");
    }
    const response = await axios.get<CollabList[]>(
      `${API_URL}/get-all-collab-lists`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  }catch(error: any){
    throw new Error(error.response?.data?.message || "Failed to create collab list");
  }
};
export const fetchCollabListsIds = async (token: string | null): Promise<string[]> => {
  try {
    if (!token) {
      throw new Error("No token provided");
    }
    const response = await axios.get<string[]>(
      `${API_URL}/get-collab-lists-ids`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch collab list IDs");
  }
};


export const updateCollabList = async (
  token: string | null,
  collabListId: string,
  title: string,
  items: AbstractListItem[]
): Promise<{ message: string }> => {
  try {
    if (!token) {
      throw new Error("No token provided");
    }
    const response = await axios.put<{ message: string }>(
      `${API_URL}/update-collab-list/${collabListId}`,
      { title, items },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update list");
  }
};

export const joinCollabList = async (
  token: string | null,
  collabListId: string
): Promise<{ message: string }> => {
  try {
    if (!token) {
      throw new Error("No token provided");
    }
    const response = await axios.put<{ message: string }>(
      `${API_URL}/join-collab-list`,
      { collabListId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to join collab list");
  }
}

export const updateRandomItem = async (
  token: string | null,
  collabListId: string,
  item: string
): Promise<{ message: string }> => {
  try {
    if (!token) {
      throw new Error("No token provided");
    }
    const response = await axios.put<{ message: string }>(
      `${API_URL}/update-random-item/${collabListId}`,
      { item },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update random item");
  }
}



